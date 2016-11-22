'use strict';

/**
 * Created by aaronrussell on 9/29/16.
 */

/**
 * String.prototype extensions
 */
require('../datatype-ext');

const fs = require('fs'),
  http = require('http'),
  soap = require('soap'),
  chalk = require('chalk'),
  bcrypt = require('bcrypt-nodejs'),
  loopback = require('loopback'),
  xmlBuilder = require('xmlbuilder'),
  uuid = require('node-uuid'),
  to_json = require('xmljson').to_json,
  schemas = require('./schema/index');

let app = require('../../../../server/server');

const server = http.createServer(function (request, response) {
  response.end('404: Not Found: ' + request.url);
}).listen(2188);


/** **/

class QBWebService {

  constructor(settings) {
    const self = this;
    this.settings = settings || {enableServiceLog: true};
    QBWebService.serviceLog('STARTED: QuickBooks Web Service server initialization.');
    this.queuedTransactions = new Map();
    this.queuedRequestsID = [];
    this.errorCount = 0;
    this.sentTransactionsCount = 0;
    this.OwnerID = '{2383efae-c4fb-41ea-b1b4-0666e71c5836}';

    QBWebService.serviceLog('STARTED: Building WSDL file.');
    const wsdl = fs.readFileSync(__dirname + '/qbws.wsdl', 'utf8').replace(/<soap:address\ +location=".*"\ +\/>/,
      '<soap:address location="' + 'http://localhost:2188/wsdl?wsdl' + '" />');
    QBWebService.serviceLog('COMPLETED: Building WSDL file.');

    QBWebService.serviceLog('STARTED: SOAP Server');
    this.soapServer = soap.listen(server, '/wsdl', {QBWebConnectorSvc: {QBWebConnectorSvcSoap: this}}, wsdl);
    QBWebService.serviceLog('COMPLETED: SOAP Server');

    QBWebService.serviceLog('STARTED: Creating log file');
    this.log = fs.readFile(__dirname + '/qbws-logs.log', 'utf8', function (err, file) {
      QBWebService.serviceLog('COMPLETED: Creating log file');
    });

    QBWebService.serviceLog('INITIALIZING: QuickBooks Data Models');
    self.reSync()
    QBWebService.serviceLog('COMPLETED: QuickBooks Web Service server initialization.');
  }

  /**
   * @function serviceLog
   *
   * @desc Writes a string to the console and log file.
   *
   * @param {String} data - The information to be logged.
   */
  static serviceLog(data) {
    //if (!self.settings.enableServiceLog) return;
    data = 'TIME:' + new Date().format('c') + ' - MSG: ' + data;
    console.log(data);

    fs.appendFile(__dirname + '/qbws-logs.log', data + '\n');
  }

  activateInteractiveMode(operation, request, parameters) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    self.shouldActivateInteractiveMode = true;
    let url = 'qbwc://' + operation + '/' + request;
    for (let paramKey in parameters) {
      if (parameters.hasOwnProperty(paramKey)) {
        url = url + '?' + paramKey + '=' + parameters[paramKey];
      }
    }
  }

  reSync(models, callback) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    if (self.resyncingAll) return;
    self.resyncingAll = true;
    if (models instanceof Function) callback = models;
    if (models && models.length) {
      models.forEach(function (model) {
        if (model instanceof String) {
          self.queueTransaction({modelName: model, method: 'Query'});
        }
      });
    } else {
      //default
      self.queueTransaction({modelName: 'Employee', method: 'Query', filter: {includeAllDataExt: true}});
      self.queueTransaction({modelName: 'Estimate', method: 'Query'});
      self.queueTransaction({
        modelName: 'Customer',
        method: 'Query',
        filter: {
          IncludeRetElement: ['Name', 'ListID', 'FullName', 'JobTitle', 'CompanyName', 'SalesRepRef', 'CustomerTypeRef',
            'JobStartDate', 'JobEndDate', 'JobProjectedEndDate', 'Sublevel', 'FirstName', 'MiddleName', 'LastName',
            'EditSequence', 'ParentRef', 'BillAddress', 'ShipAddress', 'Phone', 'AltPhone', 'Email', 'Cc', 'JobStatus',
            'CustomerTypeRef', 'Balance', 'TotalBalance', 'CreditLimit', 'ItemSalesTaxRef', 'JobTypeRef', 'JobDesc',
            'PriceLevelRef', 'PreferredDeliveryMethod']
        }
      });
      self.queueTransaction({modelName: 'CustomerType', method: 'Query'});
      self.queueTransaction({modelName: 'CustomerMsg', method: 'Query'});
      self.queueTransaction({modelName: 'Class', method: 'Query'});
      self.queueTransaction({modelName: 'ToDo', method: 'Query'});
      self.queueTransaction({modelName: 'PaymentMethod', method: 'Query'});
      self.queueTransaction({modelName: 'PriceLevel', method: 'Query'});
      self.queueTransaction({modelName: 'SalesRep', method: 'Query'});
      self.queueTransaction({modelName: 'SalesReceipt', method: 'Query'});
      self.queueTransaction({modelName: 'SalesOrder', method: 'Query'});
      self.queueTransaction({modelName: 'SalesTaxCode', method: 'Query'});
      self.queueTransaction({modelName: 'ShipMethod', method: 'Query'});
      self.queueTransaction({modelName: 'StandardTerms', method: 'Query'});
      self.queueTransaction({modelName: 'Terms', method: 'Query'});
      self.queueTransaction({modelName: 'Template', method: 'Query'});
      self.queueTransaction({modelName: 'Item', method: 'Query'});
      self.queueTransaction({modelName: 'ItemInventory', method: 'Query'});
      self.queueTransaction({modelName: 'ItemNonInventory', method: 'Query'});
      self.queueTransaction({modelName: 'ItemService', method: 'Query'});
      self.queueTransaction({modelName: 'ItemSalesTax', method: 'Query'});
      self.queueTransaction({modelName: 'ItemDiscount', method: 'Query'});
      self.queueTransaction({modelName: 'JobType', method: 'Query'});
      self.queueTransaction({modelName: 'Vendor', method: 'Query'});
      self.queueTransaction({modelName: 'VendorType', method: 'Query'});
      self.queueTransaction({modelName: 'UnitOfMeasureSet', method: 'Query'});
    }

    return callback && callback();

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
    //before doing anything we first insure that the modelName used for the transaction exists
    if (transaction.modelName[0]!== 'Q' && transaction.modelName[0]!== 'B' ) {
      transaction.modelName = 'QB' + transaction.modelName;
    }
    let Model = app.models[transaction.modelName];
    //if loopback couldn't find the Model then we create it dynamically
    if (!Model) {
      if (transaction.modelName == 'Employee') {
        Model = app.loopback.createModel(transaction.modelName, {}, {
          base: 'User',
          acls: [{
            "accessType": "*",
            "principalType": "ROLE",
            "principalId": "$everyone",
            "permission": "DENY"
          }, {
            "accessType": "*",
            "principalType": "ROLE",
            "principalId": "$authenticated",
            "permission": "ALLOW"
          }]
        });
      } else {
        Model = app.loopback.createModel(transaction.modelName, {}, {
          base: 'PersistedModel',
          acls: [{
            "accessType": "*",
            "principalType": "ROLE",
            "principalId": "$everyone",
            "permission": "DENY"
          }, {
            "accessType": "*",
            "principalType": "ROLE",
            "principalId": "$authenticated",
            "permission": "ALLOW"
          }]
        });
      }
      app.model(Model, {dataSource: app.dataSources.db});
      //noinspection JSCheckFunctionSignatures
      Model.observe('before save', function (instance, next) {
        let data = instance.instance && instance.instance.__data || instance.data;
        let method = data.ListID || data.TxnID && data.EditSequence ? 'Mod' : 'Add';

        if (data.syncToQB) {
          delete data.syncToQB;
          if (QBWebService.objectNotEmpty(data)) {

            if (instance.Model.definition.name == 'QBCustomer') {
              if (!data.Name) {
                let names = [data.FirstName, data.MiddleName, data.LastName];
                names.length && names.forEach(function (name, arr, i) {
                  if (name && !!name.trim()) {
                    names[i] = name.trim();
                  } else {
                    names[i] = '';
                  }
                });
                data.Name = names.join(' ').trim();
                if (!data.Name.trim() && data.CompanyName && data.CompanyName.trim()) {
                  data.Name = data.CompanyName.trim();
                }
              } else {
                data.Name = data.Name.trim();
              }

            }
            if (method == 'Add' && instance.Model.definition.name == 'QBEstimate') {
              data.EstimateLineAdd = data.EstimateLineMod;
            }
            if (method == 'Add' && instance.Model.definition.name == 'QBSalesOrder') {
              data.SalesOrderLineAdd = data.SalesOrderLineMod;
            }
            self.queueTransaction({method: method, data: data, modelName: instance.Model.definition.name})
          }
        } else {
          if (instance.Model.definition.name == 'QBEstimate') {
            let estimateLines = [];
            if (data.EstimateLineRet['0']) {
              for (let i in data.EstimateLineRet) {
                if (data.EstimateLineRet.hasOwnProperty(i)) {
                  estimateLines.push(data.EstimateLineRet[i]);
                }
              }
            } else {
              estimateLines.push(data.EstimateLineRet)
            }
            data.EstimateLineMod = estimateLines;
            delete data.EstimateLineRet;
          }
          if (instance.Model.definition.name == 'QBSalesOrder') {
            let estimateLines = [];
            if (data.SalesOrderLineRet['0']) {
              for (let i in data.SalesOrderLineRet) {
                if (data.SalesOrderLineRet.hasOwnProperty(i)) {
                  estimateLines.push(data.SalesOrderLineRet[i]);
                }
              }
            } else {
              estimateLines.push(data.SalesOrderLineRet)
            }
            data.SalesOrderLineMod = estimateLines;
            delete data.SalesOrderLineRet;
          }
          if (instance.Model.definition.name == 'QBEmployee') {
            data.email = data.email || data.Email;
            if (data.DataExtRet) {
              let extraDataFields = [];
              if (data.DataExtRet['0']) {
                for (let i in data.DataExtRet) {
                  if (data.DataExtRet.hasOwnProperty(i)) {
                    extraDataFields.push(data.DataExtRet[i]);
                  }
                }
              } else {
                extraDataFields.push(data.DataExtRet)
              }
              var salt = bcrypt.genSaltSync(10);
              var password = extraDataFields.filter(function (field) {
                return field.DataExtName == 'web_password';
              })[0].DataExtValue;
              data.password = data.password || bcrypt.hashSync(password, salt);
            }
          }
        }

        next();
      });
    }


    var strRequestXML,
      requestID;

    //check if there are no existing transactions queued then
    if (transaction.method == 'Query') {
      requestID = transaction.modelName;
      transaction.operation = transaction.modelName + 'Query'.replace('QB', '');
      var qbXML = xmlBuilder.create('QBXML', {version: '1.0'})
        .instruction('qbxml', 'version="13.0"');
      let qbXMLMsgsRq = qbXML.e('QBXMLMsgsRq').a('onError', 'stopOnError');
      var qbXMLOpRq = qbXMLMsgsRq.ele(transaction.modelName + transaction.method + 'Rq').a('requestID', requestID);
      if (transaction.modelName == 'QBSalesOrder' || transaction.modelName == 'QBEstimate') {
        qbXMLOpRq.e('IncludeLineItems').t('true');
      }
      for (let filterKey in transaction.filter) {
        if (transaction.filter.hasOwnProperty(filterKey)) {
          if (filterKey == 'includeAllDataExt') {
            qbXMLOpRq.e('OwnerID').t('0');
          } else if (filterKey == 'includeAppDataExt') {
            qbXMLOpRq.e('OwnerID').t(self.OwnerID);
          } else {
            if (transaction.filter[filterKey].constructor == Array) {
              transaction.filter[filterKey].forEach(function (item) {
                qbXMLOpRq.e(filterKey).t(item);
              })
            } else {
              qbXMLOpRq.e(filterKey).t(transaction.filter[filterKey]);
            }
          }
        }
      }
      strRequestXML = qbXML.end({'pretty': true});
    } else {
      transaction.operation = transaction.modelName + transaction.method.replace('QB', '');
      let ID = transaction.data.id;
      if (!ID) return;
      requestID = ID + '-' + transaction.modelName;
      strRequestXML = QBWebService.buildXMLRequest(transaction.modelName, transaction.method, transaction.data, requestID);
    }
    self.queuedRequestsID.push(requestID);
    self.queuedTransactions.set(requestID, {transaction: transaction, strRequestXML: strRequestXML});
    return strRequestXML;
  }

  handleSuccessfulResponse(response, transaction) {
    const self = this || app.dataSources.quickbooksService.connector.webService;
    response.records = response[transaction.operation + 'Rs'][transaction.modelName + 'Ret'];
    if (response.records && response.records['0']) {
      for (let i in response.records) {
        if (response.records.hasOwnProperty(i)) {
          let recordData = response.records[i];
          handleRecordData(recordData);
        }
      }
    } else {
      let recordData = response.records;
      if (recordData) handleRecordData(recordData);
    }

    function handleRecordData(recordData) {
      let Model = app.models[transaction.modelName];
      let qbID = recordData.ListID || recordData.TxnID;
      let instanceId = transaction.data && transaction.data.id;
      let upsertWhereObj = instanceId ? {id: instanceId} : recordData.ListID ? {ListID: qbID} : {TxnID: qbID};
      recordData.resynchronizing = false;
      Model.upsertWithWhere(upsertWhereObj, recordData);
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
  static parseForVersion(input) {
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
   * @returns {boolean} The number of properties in obj, or null if it is not an
   *   object.
   */
  static objectNotEmpty(obj) {
    if (obj.constructor !== Object) {
      return false;
    }
    if (Object.getOwnPropertyNames(obj).length == 0) return false;
    let objectHasPropertyWithData = false;
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && obj[key].constructor == String) obj[key] = obj[key].trim();
        if (!!obj[key]) objectHasPropertyWithData = true;
      }
    }
    return objectHasPropertyWithData;
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
      argType,
      responseString;

    if (self.settings.config.verbosity > 0) {
      QBWebService.serviceLog(chalk.yellow('WebMethod: ' + name +
        '() has been called by QBWebConnector'));
    }

    if (self.settings.config.verbosity > 1) {
      if (QBWebService.objectNotEmpty(params)) {
        QBWebService.serviceLog('    Parameters received:');
        for (arg in params) {
          if (params.hasOwnProperty(arg)) {
            // TODO: Truncate long value
            argType = typeof params[arg];
            // TODO: DRY this up
            if (argType === 'object') {
              QBWebService.serviceLog('        ' + argType + ' ' + arg + ' = ' +
                JSON.stringify(params[arg], null, 2).substring(0, 100));
            } else {
              responseString = params[arg].toString().length >= 97 ? params[arg].toString().substring(0, 97) + '...' : params[arg];
              QBWebService.serviceLog('        ' + argType + ' ' + arg + ' = ' +
                responseString);
            }
          }
        }
      } else {
        QBWebService.serviceLog('    No parameters received.');
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
    // An example of a GUID is {2383efae-c4fb-41ea-b1b4-0666e71c5836}
    authReturn[0] = self.OwnerID;

    QBWebService.serviceLog('    Password locally stored = ' + self.settings.password);

    QBWebService.serviceLog('    args.strUserName: ' + args.strUserName.trim())
    QBWebService.serviceLog('    args.strPassword: ' + args.strPassword.trim())
    if (args.strUserName == self.settings.username && args.strPassword == self.settings.password) {
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

    QBWebService.serviceLog('    Return values: ');
    QBWebService.serviceLog('        string[] authReturn[0] = ' + authReturn[0]);
    QBWebService.serviceLog('        string[] authReturn[1] = ' + authReturn[1]);

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

    suppliedVersion = QBWebService.parseForVersion(strVersion);

    self.announceMethod('clientVersion', args);

    QBWebService.serviceLog('    QBWebConnector Version = ' + strVersion);
    QBWebService.serviceLog('    Recommended Version = ' + recommendedVersion);
    QBWebService.serviceLog('    Supported Minimum Version = ' + supportedMinVersion);
    QBWebService.serviceLog('    Supplied Version = ' + suppliedVersion);

    if (strVersion < recommendedVersion) {
      retVal = 'W:We recommend that you upgrade your QBWebConnector';
    } else if (strVersion < supportedMinVersion) {
      retVal = 'E:You need to upgrade your QBWebConnector';
    }

    QBWebService.serviceLog('    Return values:');
    QBWebService.serviceLog('        string retVal = ' + retVal);

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
    self.queuedTransactions.clear();
    self.queuedRequestsID = [];

    QBWebService.serviceLog('    Return values:');
    QBWebService.serviceLog('        string retVal = ' + retVal);

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
        QBWebService.serviceLog('    HRESULT = ' + hresult);
        QBWebService.serviceLog('    Message = ' + message);
        retVal = 'DONE';
        break;
      default :
        retVal = !self.errorCount ? '' && QBWebService.serviceLog('    Sending empty company file to try again.') && self.errorCount++ : 'DONE' && QBWebService.serviceLog('    Sending DONE to stop.') && self.errorCount--;
        break;
    }

    QBWebService.serviceLog('    Return values:');
    QBWebService.serviceLog('        string retVal = ' + retVal);

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
    //todo: handle errorCode within self/this instead of local variable, this is causing it to always return Error! instead of the appropriate error message
    var errorCode = 0,
      retVal = '';

    self.announceMethod('getLastError', args);

    if (errorCode === -101) {
      // This is just an example of custom user errors
      retVal = 'QuickBooks was not running!';
    } else if (errorCode === -500) {
      retVal = 'Error handling response within server!';
    } else {
      retVal = 'Error!'
    }

    QBWebService.serviceLog('    Return values:');
    QBWebService.serviceLog('        string retVal = ' + retVal);

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
      try {
        self.handleSuccessfulResponse(data.QBXML.QBXMLMsgsRs, self.queuedTransactions.get(self.queuedRequestsID[self.sentTransactionsCount - 1]).transaction);
      } catch (err) {
        retVal = -500;
      }

    });
    if (QBWebService.objectNotEmpty(hresult)) {
      // If there is an error with response received,
      //     web service could also return a -ve int
      QBWebService.serviceLog('    HRESULT = ' + hresult);
      QBWebService.serviceLog('    Message = ' + message);
      retVal = -101;
    } else {
      QBWebService.serviceLog('    Length of response received = ' + response.length);

      percentage = self.sentTransactionsCount * 100 / self.queuedTransactions.size;
      if (percentage >= 100) {
        if (self.resyncingAll) self.resyncingAll = false;
        self.queuedTransactions.clear();
        self.queuedRequestsID = [];
        self.sentTransactionsCount = 0;
      }

      // QVWC throws an error if if the return value contains a decimal
      retVal = percentage.toFixed();
    }

    QBWebService.serviceLog('    Return values: ');
    QBWebService.serviceLog('        Number retVal = ' + retVal);

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
      request = self.queuedTransactions.get(self.queuedRequestsID[self.sentTransactionsCount]).strRequestXML;
      QBWebService.serviceLog('    Sending RequestID ' + self.queuedRequestsID[self.sentTransactionsCount]);
      self.sentTransactionsCount++;
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
    QBWebService.serviceLog('    No parameters required.');
    QBWebService.serviceLog('    Returned: ' + retVal);

    return {
      serverVersionResult: {'string': retVal}
    };
  };

  /**
   * @function validatePropertyAvailability
   *
   * @desc
   *
   * @param dataProperty
   * @param modelName
   * @param method
   *
   * @returns {boolean}
   */
  static validatePropertyAvailability(dataProperty, modelName, method) {
    if (dataProperty.constructor == Array) {
      //todo: not that quickbooks has multiple layers of children in there XML requests now, but for in the future we need to loop for dataProperty.length a number of times to determine the depth of the child element
      return schemas[modelName][method][dataProperty[0]] && !!schemas[modelName][method][dataProperty[0]][dataProperty[1]];
    } else {
      return !!schemas[modelName][method][dataProperty];
    }
  }

  //todo: add maxLength[ ], datatype[√], order[√], required[ ] and a custom[ ] validation. `custom` validation should be a function that would return true or false. Each validation should be defined within its appropriate schema (model) file
  static validateMaxLength(value, property, modelName, method) {

  }

  static validateCustom(value, property, modelName, method) {
    if (property.constructor == Array) {
      if (schemas[modelName][method][property[0]].validation && schemas[modelName][method][property[0]].validation.custom) {
        value = schemas[modelName][method][property[0]].validation.custom(value);
      }
    } else {
      if (schemas[modelName][method][property].custom) {
        value = schemas[modelName][method][property].custom(value);
      }
    }
    return value;
  }

  static validateRequired(property, modelName, method) {

  }

  static convertToProperDataType(datatype, val) {
    return schemas.datatypeMappings[datatype](val);
  }

  static buildXMLRequest(modelName, op, data, requestID) {
    var schema = schemas[modelName][op];
    var qbXML = xmlBuilder.create('QBXML', {version: '1.0'})
      .instruction('qbxml', 'version="13.0"');
    let qbXMLMsgsRq = qbXML.e('QBXMLMsgsRq').a('onError', 'continueOnError');
    var qbXMLOpRq = qbXMLMsgsRq.e(modelName + op + 'Rq').a('requestID', requestID);
    var qbXMLOp = qbXMLOpRq.e(modelName + op);
    var propertyCount = Object.keys(schema).length - 1;
    for (var i = 0; i <= propertyCount; i++) {
      var modelProperties = schema[i.toString()];
      Object.keys(modelProperties).forEach(function (propKey) {
        if (data[propKey]) {
          if (modelProperties[propKey].constructor == Object) {
            if (QBWebService.objectNotEmpty(data[propKey])) {
              var qbXMLProperty = qbXMLOp.e(propKey);
              var propertyCount2 = Object.keys(modelProperties[propKey]).length - 1;
              for (var i2 = 0; i2 <= propertyCount2; i2++) {
                var modelProperties2 = modelProperties[propKey][i2.toString()];
                Object.keys(modelProperties2).forEach(function (propKey2) {
                  data[propKey][propKey2] && qbXMLProperty.e(propKey2).t(data[propKey][propKey2])
                });
              }
            }
          } else if (modelProperties[propKey].constructor == Array) {
            data[propKey].forEach(function (item, arr, index) {
              if (QBWebService.objectNotEmpty(item)) {
                var qbXMLProperty = qbXMLOp.e(propKey);
                var propertyCount2 = Object.keys(modelProperties[propKey][0]).length - 1;
                for (var i2 = 0; i2 <= propertyCount2; i2++) {
                  var modelProperties2 = modelProperties[propKey][0][i2.toString()];
                  Object.keys(modelProperties2).forEach(function (propKey2) {
                    if (item[propKey2]) {
                      if (modelProperties2[propKey2].constructor == Object) {
                        var qbXMLProperty3 = qbXMLProperty.e(propKey2);
                        var propertyCount3 = Object.keys(modelProperties2[propKey2]).length - 1;
                        for (var i3 = 0; i3 <= propertyCount3; i3++) {
                          var modelProperties3 = modelProperties2[propKey2][i3.toString()];
                          Object.keys(modelProperties3).forEach(function (propKey3) {
                            item[propKey2][propKey3] && qbXMLProperty3.e(propKey3).t(QBWebService.convertToProperDataType(modelProperties3[propKey3], item[propKey2][propKey3]))
                          });
                        }
                      } else {
                        qbXMLProperty.ele(propKey2, QBWebService.convertToProperDataType(modelProperties2[propKey2], item[propKey2]))
                      }
                    }
                  });
                }
              }
            });
          } else {
            qbXMLOp.ele(propKey, QBWebService.convertToProperDataType(modelProperties[propKey], data[propKey]));
          }
        }
      });
    }

    return qbXML.end({pretty: true});
  }
}

module.exports = QBWebService;