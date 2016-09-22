/**
 * Created by aaronrussell on 9/21/16.
 */
var QBWS = require('./QBWS'),
  loopback = require('loopback');

module.exports = QBSOAPService;

function QBSOAPService(settings) {
  var ds = loopback.createDataSource('soap', {
    connector: 'loopback-connector-soap',
    remotingEnabled: true,
    wsdl: 'http://0.0.0.0:2188/wsdl?WSDL',
    url: 'http://0.0.0.0:2188/wsdl?wsdl',
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
        console.log('authentication res: %j', response);
        cb(response);
      });
    };
    console.log('calling authentication')
    QuickBooksService.authenticateUser();
  })
}

QBSOAPService.prototype.connect = function(settings) {
  QBWS.connect(settings);
};
