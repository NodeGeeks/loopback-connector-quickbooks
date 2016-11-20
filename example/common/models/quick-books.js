var loopback = require('loopback');

module.exports = function (QuickBooks) {

  QuickBooks.queueTransaction = function (body, cb) {
    QuickBooks.getDataSource('quickbooksService').connector.webService.queueTransaction({modelName: body.modelName, method: body.method, data: body.data, filter: body.filter});
    cb();
  };

  QuickBooks.remoteMethod(
    'queueTransaction',
    {
      accepts: [
        {arg: 'body', type: 'object', required: true, http: {source: 'body'}}
      ],
      description: 'Queue the request transaction for syncing with QuickBooks',
      http: {path: '/queueTransaction', verb: 'post'}
    }
  );

  QuickBooks.reSync = function (cb) {
    QuickBooks.getDataSource('quickbooksService').connector.webService.reSync();
    cb();
  };

  QuickBooks.remoteMethod(
    'reSync',
    {
      description: 'Re-Sync all the QuickBooks data into the application',
      http: {path: '/reSync', verb: 'get'}
    }
  );
};
