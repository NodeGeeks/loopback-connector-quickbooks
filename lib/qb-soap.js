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
        }
      }
    });

    ds.once('connected', function(){
      console.log('connected to quickbooks soap integrator service')
      var QuickBooksService = ds.createModel('QuickBooksService', {})
      QuickBooksService.authenticateUser = function(username, password, cb) {
        QuickBooksService.authenticate({strUserName: username || settings.username, strPassword: password || settings.password}, function(err, response){
          callback(response);
        });
      };
      console.log('calling authentication')
      QuickBooksService.authenticateUser();
    })
  });

};

module.exports = QBSOAPService;
