/**
 * Created by aaronrussell on 9/21/16.
 */
var QBWS = require('./QBWS'),
  loopback = require('loopback');

var QBSOAPService = function (settings) {

};

QBSOAPService.connect = function(settings, callback) {
  QBWS.run(settings, function(){
    console.log('QBSOAPService initialized')
    var ds = loopback.createDataSource('soap', {
      connector: 'loopback-connector-soap',
      remotingEnabled: true,
      wsdl: settings.wsdlURL,
      url: settings.wsdlURL,
      wsdl_options: {
        rejectUnauthorized: false,
        strictSSL: false,
        requestCert: false
      },
      operations: {
        authenticate: {
          service: 'QBWebConnectorSvc', // The WSDL service name
          port: 'QBWebConnectorSvcSoap', // The WSDL port name
          operation: 'authenticate' // The WSDL operation name
        },
        sendRequestXML: {
          service: 'QBWebConnectorSvc', // The WSDL service name
          port: 'QBWebConnectorSvcSoap', // The WSDL port name
          operation: 'sendRequestXML' // The WSDL operation name
        }
      }
    });

    ds.once('connected', function(){
      console.log('connected to quickbooks soap integrator service')
      var QuickBooksService = ds.createModel('QuickBooksService', {})
      QuickBooksService.authenticateUser = function(username, password, cb) {
        if (typeof username === 'function') cb = username;
        QuickBooksService.authenticate({strUserName: settings.username || username, strPassword: settings.password || password}, function(err, response){
          console.log(response)
          if (cb) cb(response);
        });
      };
      QuickBooksService.sendRequest = function(cb) {
        QuickBooksService.sendRequestXML({}, function(err, response){
          console.log(response)
          if (cb) cb(response);
        });
      };
      console.log('calling authentication')
      QuickBooksService.authenticateUser(function(){
        console.log('done authenticating bout to send request')
        //QuickBooksService.sendRequest();
      });
    })
  });

};

module.exports = QBSOAPService;
