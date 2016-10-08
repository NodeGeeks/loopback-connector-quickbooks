'use strict';

/**
 * Created by aaronrussell on 9/29/16.
 */

/**
 * String.prototype extensions
 */
require('../datatype-ext')

const fs = require('fs'),
  http = require('http'),
  soap = require('soap'),
  chalk = require('chalk'),
  loopback = require('loopback'),
  builder = require('xmlbuilder'),
  uuid = require('node-uuid'),
  to_json = require('xmljson').to_json;

let app = require('../../../../server/server');

const server = http.createServer(function (request, response) {
  response.end('404: Not Found: ' + request.url);
}).listen(2188);


/** **/

class QBWebService {

  constructor(settings) {
    const self = this;
    this.settings = settings || {enableServiceLog: true};
    this.serviceLog('STARTED: QuickBooks Web Service server initialization.');
    this.queuedTransactions = new Map();
    this.errorCount = 0;
    this.syncedData = {};
    this.sentTransactionsCount = 0;
    this.serviceLog('STARTED: Building WSDL file.');
    const wsdl = fs.readFileSync(__dirname + '/qbws.wsdl', 'utf8').replace(/<soap:address\ +location=".*"\ +\/>/,
      '<soap:address location="' + 'http://localhost:2188/wsdl?wsdl' + '" />');
    this.serviceLog('COMPLETED: Building WSDL file.');
    this.serviceLog('STARTED: SOAP Server');
    this.soapServer = soap.listen(server, '/wsdl', {QBWebConnectorSvc: {QBWebConnectorSvcSoap: this}}, wsdl);
    this.serviceLog('COMPLETED: SOAP Server');
    this.serviceLog('STARTED: Creating log file');
    this.log = fs.readFile(__dirname + '/qbws-logs.log', 'utf8', function (err, file) {
      self.serviceLog('COMPLETED: Creating log file');
    });
    this.serviceLog('COMPLETED: QuickBooks Web Service server initialization.');
    //todo: is this createDataSource for soap really required?
  }

  /**
   * @function serviceLog
   *
   * @desc Writes a string to the console and log file.
   *
   * @param {String} data - The information to be logged.
   */
  serviceLog(data) {
    //if (!self.settings.enableServiceLog) return;
    data = 'TIME:' + new Date().format('F') + ' - MSG: ' + data;
    console.log(data);

    fs.appendFile(__dirname + '/qbws-logs.log', data + '\n');
  }


  /**
   * @function queueTransaction
   *
   * @desc Queues the transaction to sync with QuickBooks Web Connector and wraps the transaction in a QBWSTransaction class
   *
   * @param transaction
   * @param.arg {String} method
   */
  queueTransaction(transaction) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    console.log('Queueing Transaction: \n', transaction);
    //before doing anything we first insure that the modelName used for the transaction exists
    let Model = app.models[transaction.modelName];
    //if loopback couldn't find the Model then we create it dynamically
    if (!Model) {
      Model = app.loopback.createModel(transaction.modelName, {}, {base: 'PersistedModel'});
      app.model(Model, {dataSource: app.dataSources.db});
    }
    // TODO: is 'pretty' false by default? Probably.
    var strRequestXML,
      inputXMLDoc,
      requestID = self.queuedTransactions.size + 1;
    //check if there are no existing transactions queued then
    switch (transaction.method) {
      case 'GET':
        //todo: add filter
        transaction.operation = transaction.modelName.capitalize() + 'Query';
        inputXMLDoc = builder.create('QBXML', {version: '1.0'})
          .instruction('qbxml', 'version="4.0"')
          .ele('QBXMLMsgsRq', {'onError': 'stopOnError'})
          .ele(transaction.operation + 'Rq', {'requestID': requestID})
          .ele('OwnerID')
          .text('0');
        break;
      case 'POST':
        transaction.operation = transaction.modelName.capitalize() + 'Add';
        inputXMLDoc = builder.create('QBXML', {version: '1.0'})
          .instruction('qbxml', 'version="4.0"')
          .ele('QBXMLMsgsRq', {'onError': 'stopOnError'})
          .ele(transaction.operation + 'Rq', {'requestID': requestID})
          .ele('OwnerID')
          .text('0');
        break;
      case 'UPDATE':
        transaction.operation = transaction.modelName.capitalize() + 'Mod';
        inputXMLDoc = builder.create('QBXML', {version: '1.0'})
          .instruction('qbxml', 'version="4.0"')
          .ele('QBXMLMsgsRq', {'onError': 'stopOnError'})
          .ele(transaction.operation + 'Rq', {'requestID': requestID})
          .ele('OwnerID')
          .text('0');
        break;
      case 'DELETE':
        // todo: implement
        break;
    }

    if (!inputXMLDoc) {
      //noinspection JSValidateTypes
      return new Error({message: 'empty transaction request attempted'});
    } else {
      strRequestXML = inputXMLDoc.end({'pretty': false});
      self.queuedTransactions.set(requestID, {transaction: transaction, strRequestXML: strRequestXML});
      return strRequestXML;
    }

  }

  handleResponse(response, transaction) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    console.log(response[transaction.operation + 'Rs']);
    response.records = response[transaction.operation + 'Rs'][transaction.modelName + 'Ret'];
    for (let i in response.records) {
      if (response.records.hasOwnProperty(i)) {
        var employeeRecordData = response.records[i];
        if (!self.syncedData[transaction.modelName]) self.syncedData[transaction.modelName] = {};
        if (!self.syncedData[transaction.modelName][employeeRecordData.ListID]) {
          //record was just synced FROM QuickBooks and needs to be stored in Memory
          employeeRecordData.isStoredInMemory = false;
          self.syncedData[transaction.modelName][employeeRecordData.ListID] = employeeRecordData;
        }
      }
    }
    self.synchronizeData(transaction);
  }

  synchronizeData(transaction) {
    //we already know `this` is the global namespace due to being ran in a separate process
    const self = this || app.dataSources.quickbooksService.connector.webService;
    //todo: 'for in' loop every array of model data within the syncedData
    let Model = app.models[transaction.modelName];
    for (let recordListID in self.syncedData[transaction.modelName]) {
      if (self.syncedData[transaction.modelName].hasOwnProperty(recordListID)) {
        const recordData = self.syncedData[transaction.modelName][recordListID];
        //handles creating newly synced records
        if (recordData.isStoredInMemory === false) {
          delete recordData.isStoredInMemory;
          Model.create(recordData);
        }
        //handles updating modified synced records

        //handles creating newly created records that were created from the app and need to be synced TO QuickBooks
        if (recordData.isStoredInMemory === true) {

        }
      }
    }

  }

  /**
   * @function parseForVersion
   *
   * @desc Parses the first two version components out of the standard four
   *   component version number: `<Major>.<Minor>.<Release>.<Build>`.
   *
   * @example
   *   // returns 2.0
   *   parseForVersion('2.0.1.30');
   *
   * @param {String} input - A version number.
   *
   * @returns {String} First two version components (i.e. &lt;Major>.&lt;Minor>)
   *   if `input` matches the regular expression. Otherwise returns `input`.
   */
  parseForVersion(input) {
    // As long as you get the version in right format, you could use
    // any algorithm here.
    var major = '',
      minor = '',
      version = /^(\d+)\.(\d+)(\.\w+){0,2}$/,
      versionMatch;

    versionMatch = version.exec(input.toString());

    if (versionMatch !== null) {
      major = versionMatch[1];
      minor = versionMatch[2];

      return major + '.' + minor;
    } else {
      return input;
    }
  }


  /**
   * @function objectNotEmpty
   *
   * @desc Checks that the type of a variable is 'object' and it is not empty.
   *
   * @param {Object} obj - The object to be checked.
   *
   * @returns {Number} The number of properties in obj, or null if it is not an
   *   object.
   */
  objectNotEmpty(obj) {
    if (typeof obj !== 'object') {
      return null;
    }

    return Object.getOwnPropertyNames(obj).length;
  }

  /**
   * @function announceMethod
   *
   * @desc Logs qbws method calls and their parameters.
   *
   * @param {String} name - The name of the method.
   *
   * @param {Object} params - The parameters sent to the method.
   */
  announceMethod(name, params) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var arg,
      argType;

    if (self.settings.config.verbosity > 0) {
      self.serviceLog(chalk.yellow('WebMethod: ' + name +
        '() has been called by QBWebConnector'));
    }

    if (self.settings.config.verbosity > 1) {
      if (self.objectNotEmpty(params)) {
        self.serviceLog('    Parameters received:');
        for (arg in params) {
          if (params.hasOwnProperty(arg)) {
            // TODO: Truncate long value
            argType = typeof params[arg];
            // TODO: DRY this up
            if (argType === 'object') {
              self.serviceLog('        ' + argType + ' ' + arg + ' = ' +
                JSON.stringify(params[arg], null, 2));
            } else {
              self.serviceLog('        ' + argType + ' ' + arg + ' = ' +
                params[arg]);
            }
          }
        }
      } else {
        self.serviceLog('    No parameters received.');
      }
    }
  }


  /**
   * @function authenticate
   *
   * @desc Prompts qbws to authenticate the supplied user and specify the company
   *   to be used in the session.
   *
   * @summary When a scheduled update occurs for qbws or when the user clicks
   *   Update Selected in the Web Connector, authenticate() is called supplying
   *   the user name and password required for the user to access your web
   *   service. Your web service validates the user specified in the authenticate
   *   call and returns a string array.
   *
   * @param {String} args.strUserName The Web Connector supplies the user name
   *   that you provided to your user in the QWC file to allow that username to
   *   access your web service.
   *
   * @param {String} args.strPassword The Web Connector supplies the user
   *   password (provided to your user by you) which was stored by the user in
   *   the web connector.
   *
   * @returns {String|Array} Instructions for QuickBooks to proceed with update.
   *   A string array must be returned with four possible elements. In this
   *   returned string array:
   *   - _The zeroth element_ provides a session ticket for the client.
   *   - _The first element_ contains either `'NONE'`, `'NVU'` (invalid user),
   *     `'BUSY'`, `''` (empty string), or a string that is the QB company file
   *     name. If qbws returns an empty string or any other string that is NOT
   *     `'NVU'`, `'NONE'`, or `'BUSY'`, that string will be used as the
   *     qbCompanyFileName parameter in the web connector's BeginSession call to
   *     QuickBooks.
   *   - _The second element_ enables qbws to postpone the update process. The
   *     value in this parameter determines the number of seconds by which the
   *     update will be postponed. For example, if `authReturn[2] = 60`, the Web
   *     Connector will postpone the update process by 60 seconds. That is, the
   *     current update process is discontinued and will resume after 60 seconds.
   *   - _The third element_ (optional) sets the lower limit in seconds for the
   *     `Every_Min` parameter (this parameter determines the interval the
   *     scheduler uses to run the updates when autorun is enabled). For example:
   *     if `authReturn[3] = 300`, suppose a client tries to set `Every_Min = 2`
   *     using the UI of the Web Connector instance. In this case the result
   *     would be a popup that informs the user that the lower limit for this
   *     parameter is 300 seconds and the Web Connector will automatically set
   *     the `Every_Min` parameter to `5` minutes (300 seconds).
   *   - _The fourth element_ (optional) contains the number of seconds to be
   *     used as the `MinimumRunEveryNSeconds` time.
   *   **Important**: In order to enable qbws to utilize `authReturn[2]` &
   *   `authReturn[3]`, 'Auto Run' hase to be enabled in the Web Connector.
   *
   *   Possible return values
   *   - string[0] = ticket
   *   - string[1]
   *     - `''` (empty string) = use current company file
   *     - `'none'` = no further request/no further action required
   *     - `'nvu'` = not valid user
   *     - any other string value = use this company file
   */
  authenticate(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var authReturn = [];
    self.announceMethod('authenticate', args);

    // Code below uses a random GUID to use as a session ticket
    // An example of a GUID is {85B41BEE-5CD9-427a-A61B-83964F1EB426}
    authReturn[0] = self.OwnerID = uuid.v1();

    self.serviceLog('    Password locally stored = ' + self.settings.password);

    self.serviceLog('    args.strUserName: ' + args.strUserName.trim())
    self.serviceLog('    args.strPassword: ' + args.strPassword.trim())
    console.log(self.settings)
    if (args.strUserName == self.settings.username && args.strPassword == self.settings.password) {
      //todo: build transactions for all flagged records to be posted back to QuickBooks
      if (self.queuedTransactions.size <= 0) {
        authReturn[1] = 'NONE';
      } else {
        // An empty string for authReturn[1] means asking QBWebConnector
        // to connect to the company file that is currently opened in QB
        authReturn[1] = self.settings.companyFile || '';
      }
    } else {
      authReturn[1] = 'nvu';
    }

    self.serviceLog('    Return values: ');
    self.serviceLog('        string[] authReturn[0] = ' + authReturn[0]);
    self.serviceLog('        string[] authReturn[1] = ' + authReturn[1]);

    return {
      authenticateResult: {'string': [authReturn[0], authReturn[1]]}
    };
  };

  /**
   * @function clientVersion
   *
   * @desc An optional callback that allows the web service to evaluate the
   *  current Web Connector version and react to it.
   *
   * @summary Not currently required to support backward compatibility but
   *   strongly recommended.
   *
   *   When the Web Connector user clicks on Update Selected with your web
   *   service selected or when a scheduled update occurs, the Web Connector
   *   begins the communication by calling clientVersion.
   *
   *   Not currently required to support backward compatibility but strongly
   *   recommended. If your web service does not implement this callback method,
   *   the Web Connector simply proceeds to the update by calling authenticate().
   *
   *   If your web service does implement the clientVersion callback, the Web
   *   Connector will continue with the update, cancel it, or warn the user
   *   depending on the information it receives from your web service.
   *
   *   Supply one of the following return strings:
   *   - `'NULL'` or `''` (empty string) if you want the Web Connector to proceed
   *     with the update.
   *   - `'W:<any text>'` if you want the web Connector to display a WARNING
   *     dialog prompting the user to continue with the update or cancel it. The
   *     text string after the `'W:'` will be displayed in the warning dialog.
   *   - `'E:<any text>'` if you want to cancel the update and display an ERROR
   *     dialog. The text string after `'E:'` will be displayed in the error
   *     dialog. The user will have to download a new version of the Web
   *     Connector to continue with the update.
   *   - `'O:<version number>'` to tell the user that the server expects a newer
   *     version of QBWC than the user currently has but also tells the user
   *     which version is needed.
   *
   * @param {String} args.strVersion - The version of the QB web connector
   *   supplied in the web connector's call to clientVersion.
   *
   * @returns {String} A string telling the Web Connector what to do next.
   */
  clientVersion(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var strVersion = args.strVersion,
      recommendedVersion = '2.0.1.30',
      supportedMinVersion = '1.0',
      suppliedVersion,
      retVal = '';

    suppliedVersion = self.parseForVersion(strVersion);

    self.announceMethod('clientVersion', args);

    self.serviceLog('    QBWebConnector Version = ' + strVersion);
    self.serviceLog('    Recommended Version = ' + recommendedVersion);
    self.serviceLog('    Supported Minimum Version = ' + supportedMinVersion);
    self.serviceLog('    Supplied Version = ' + suppliedVersion);

    if (strVersion < recommendedVersion) {
      retVal = 'W:We recommend that you upgrade your QBWebConnector';
    } else if (strVersion < supportedMinVersion) {
      retVal = 'E:You need to upgrade your QBWebConnector';
    }

    self.serviceLog('    Return values:');
    self.serviceLog('        string retVal = ' + retVal);

    return {
      clientVersionResult: {'string': retVal}
    };
  };

  /**
   * @function closeConnection
   *
   * @desc Called by the Web Connector at the end of a successful update session.
   *
   * @summary Tells your web service that the Web Connector is finished with the
   *   update session.
   *
   *   When the update with the web service is completed, the Web Connector will
   *   notify the web service that it is done with the session it started by
   *   calling closeConnection.
   *
   * @param {String} args.ticket The ticket from the client. This is the session
   *   token your web service returned to the client's authenticate call, as the
   *   first element of the returned string array.
   *
   * @returns {String} Specify a string that you want the Web Connector to
   *   display to the user showing the status of the web service action on behalf
   *   of your user. This string will be displayed in the Web Connector UI in the
   *   status column.
   */
  closeConnection(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    let retVal = null;

    self.announceMethod('closeConnection', args);

    // This method doesn't currently do anything very interesting, just returns
    //   an 'OK' message.
    retVal = 'OK';

    //reset the queuedTransactions
    //todo: add abiility to add default transactions that are always occurring on every quickbooks update cycle
    self.queuedTransactions.clear();

    self.serviceLog('    Return values:');
    self.serviceLog('        string retVal = ' + retVal);

    return {
      closeConnectionResult: {'string': retVal}
    };
  };

  /**
   * @function connectionError
   *
   * @desc Tells your web service about an error the Web Connector encountered in
   *   its attempt to connect to QuickBooks or QuickBooks POS.
   *
   * @summary **Important**: Don't retry the same operation in response to the
   *   connectionError more than a couple of times. If the problem isn't resolved
   *   after a couple of tries, use getLastError to notify the user about the
   *   problem.
   *
   *   When the web service responds to the Web Connector's authenticate method
   *   call by indicating there is data to be exchanged with QuickBooks, the
   *   Web Connector calls the OpenConnection and BeginSession medhotds of the
   *   QuickBooks XML request processor.
   *
   *   If either of those calls fail for any reason, the Web Connector will
   *   display the error code and error message from the request processor to the
   *   user and it will let your web service know about the error via the
   *   connectionError call.
   *
   * @param {String} args.ticket - The ticket from the Web Connector. This is the
   *   session token your web service returns to the Web Connector's authenticate
   *   call as the first element of the returned string array.
   *
   * @param {String} args.hresult - An HRESULT value (in HEX) thrown by
   *   QuickBooks when trying to make a connection thrown by the request
   *   processor.
   *
   * @param {String} args.message - An error message that accompanies the HRESULT
   *   from the request processor.
   *
   * @returns {String} Returns `'done'` to indicate that the web service is
   *   finished or a full company pathname if you want to retry the connection
   *   attempt on a different QuickBooks or QuickBooks POS company. Any string
   *   other than `'done'` will be interpreted as the company name to be used in
   *   a retry attempt. An empty string will retry the connection attempt with
   *   the currently open company.
   */

  connectionError(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var hresult = args.hresult,
      message = args.message,
      retVal = null,
    // 0x80040400 - QuickBooks found an error when parsing the
    //     provided XML text stream.
      QB_ERROR_WHEN_PARSING = '0x80040400',
    // 0x80040401 - Could not access QuickBooks.
      QB_COULDNT_ACCESS_QB = '0x80040401',
    // 0x80040402 - Unexpected error. Check the qbsdklog.txt file for
    //     possible additional information.
      QB_UNEXPECTED_ERROR = '0x80040402';
    // Add more as you need...

    self.announceMethod('connectionError', args);

    // TODO: Why is the same code repeated thrice? Switch statement instead?
    switch (hresult.trim()) {
      case QB_ERROR_WHEN_PARSING || QB_COULDNT_ACCESS_QB || QB_UNEXPECTED_ERROR:
        self.serviceLog('    HRESULT = ' + hresult);
        self.serviceLog('    Message = ' + message);
        retVal = 'DONE';
        break;
      default :
        retVal = !self.errorCount ? '' && self.serviceLog('    Sending empty company file to try again.') : 'DONE' && self.serviceLog('    Sending DONE to stop.');
        break;
    }

    self.serviceLog('    Return values:');
    self.serviceLog('        string retVal = ' + retVal);
    self.errorCount++;

    return {
      connectionErrorResult: {'string': retVal}
    };
  };

// TODO: What is the sessionID parameter?
// TODO: Is it ticket or wcTicket? (Mismatch in documentation)
  /**
   * @function getInteractiveURL
   *
   * @desc Lets your web service tell the Web Connector where to get the web
   *   page to display in the browser at the start of interactive mode.
   *
   * @summary Used to support interactive mode. To start interactive mode, your
   *   web service indicates to the Web Connector that it wants to start
   *   interactive mode by returning an empty string from sendRequestXML, which
   *   causes the Web Connector to invoke getLastError. Then from getLastError
   *   you return the string 'Interactive mode' to kick off the interactive
   *   session.
   *
   *   The Web Connector responds to this string by calling getInteractiveURL and
   *   opens a browser with the web page you specify in your return to that call.
   *
   * @param {String} args.wcTicket The ticket from the Web Connector. This is the
   *   session token your web service returned to the Web Connector's
   *   authenticate call, as the first element of the returned string array.
   *
   * @param {String} args.sessionID
   *
   * @returns {String} The URL to the interactive mode website.
   */
  getInteractiveURL(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var retVal = '';

    self.announceMethod('getInteractiveURL', args);

    return {
      getInteractiveURLResult: {'string': retVal}
    };
  };

  /**
   * @function getLastError
   *
   * @param {String} args.ticket
   *
   * @returns {String} An error message describing the last web service error.
   */
  getLastError(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var errorCode = 0,
      retVal = '';

    self.announceMethod('getLastError', args);

    if (errorCode === -101) {
      // This is just an example of custom user errors
      retVal = 'QuickBooks was not running!';
    } else {
      retVal = 'Error!';
    }

    self.serviceLog('    Return values:');
    self.serviceLog('        string retVal = ' + retVal);

    return {
      getLastErrorResult: {'string': retVal}
    };
  };

  /**
   * @function interactiveDone
   *
   * @param {String} wcTicket
   *
   * @returns {String}
   */
  interactiveDone(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var retVal = '';

    self.announceMethod('interactiveDone', args);

    return {
      interactiveDoneResult: {'string': retVal}
    };
  };

// TODO Does the param reason actually exist?
// TODO: Is it ticket or wcTicket? (Mismatch in documentation)
  /**
   * @function interactiveRejected
   *
   * @desc Allows your web service to take alternative action when the
   *   interactive session it requested was rejected by the user or by timeout
   *   in the absence of the user.
   *
   * @param {String} args.wcTicket The ticket from the Web Connector. This is the
   *   session token your web service returned to the Web Connector's
   *   authenticate call, as the first element of the returned string array.
   *
   * @param {String} args.reason The reason for rejection of interactive mode.
   *
   * @returns {String} A message string to be displayed.
   */
  interactiveRejected(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var retVal = '';

    self.announceMethod('interactiveRejected', args);

    return {
      interactiveRejectedResult: {'string': retVal}
    };
  };

  /**
   * @function receiveResponseXML
   *
   * @desc This web method facilitates qbws to receive the response XML from
   *   QuickBooks via the Web Connector.
   *
   * @param {String} args.ticket
   *
   * @param {String} args.response
   *
   * @param {String} args.hresult
   *
   * @param {String} args.message
   *
   * @returns {{receiveResponseXMLResult: {int: number}}} The percentage of work done. Must be an integer.
   *   Possible values:
   *   - Greater than 0 - There are more requests to send
   *   - 100 - Done; no more requests to send
   *   - Less than 0 - Custom error codes
   */
  receiveResponseXML(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    const response = args.response,
      hresult = args.hresult,
      message = args.message;

    let retVal = 0,
      percentage;

    self.announceMethod('receiveResponseXML', args);
    to_json(response, function (error, data) {
      self.handleResponse(data.QBXML.QBXMLMsgsRs, self.queuedTransactions.get(self.sentTransactionsCount).transaction);
    });
    if (self.objectNotEmpty(hresult)) {
      // If there is an error with response received,
      //     web service could also return a -ve int
      self.serviceLog('    HRESULT = ' + hresult);
      self.serviceLog('    Message = ' + message);
      retVal = -101;
    } else {
      self.serviceLog('    Length of response received = ' + response.length);

      percentage = self.sentTransactionsCount * 100 / self.queuedTransactions.size;
      if (percentage >= 100) {
        self.queuedTransactions.clear();
        self.sentTransactionsCount = 0;
      }

      // QVWC throws an error if if the return value contains a decimal
      retVal = percentage.toFixed();
    }

    self.serviceLog('    Return values: ');
    self.serviceLog('        Number retVal = ' + retVal);

    return {
      receiveResponseXMLResult: {'int': retVal}
    };
  };

  /**
   * @function sendRequestXML
   *
   * @desc This web method sends the request XML to the client which should
   *   process the request within QuickBooks.
   *
   * @param {Number} args.qbXMLMajorVers
   *
   * @param {Number} args.qbXMLMinorVers
   *
   * @param {String} args.ticket
   *
   * @param {String} args.strHCPResponse
   *
   * @param {String} args.strCompanyFileName
   *
   * @param {String} args.Country
   *
   * @returns {{sendRequestXMLResult: {string: string}}} Returns the request XML for the client to process or an
   *   empty string if there are no more requests.
   */
  sendRequestXML(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    let request;
    self.announceMethod('sendRequestXML', args);

    if (self.sentTransactionsCount < self.queuedTransactions.size) {
      self.sentTransactionsCount++;
      request = self.queuedTransactions.get(self.sentTransactionsCount).strRequestXML;
      self.serviceLog('    Sending request no = ' + self.sentTransactionsCount + 'with RequestID ' + self.sentTransactionsCount);
    } else {
      self.sentTransactionsCount = 0;
      request = '';
    }

    return {
      sendRequestXMLResult: {'string': request}
    };
  };

  /**
   * @function serverVersion
   *
   * @desc Communicates the web service's version number to the client.
   *
   * @returns {{serverVersionResult: {string: string}}} qbws's version number
   */
  serverVersion(args) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    var retVal = '0.2.1';

    self.announceMethod('serverVersion', args);
    self.serviceLog('    No parameters required.');
    self.serviceLog('    Returned: ' + retVal);

    return {
      serverVersionResult: {'string': retVal}
    };
  };


}

module.exports = QBWebService;