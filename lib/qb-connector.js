/**
 * Created by aaronrussell on 9/21/16.
 *
 * @Description: The purpose of this connector is to act as the middle and end man in the process of communication to
 * QuickBooks Web Connector used to communicate to QuickBooks Desktop software. Traditionally QuickBooks Web Connector
 * requires a SOAP server to send and receive XML requests to view, create or update QuickBooks data. This connector
 * has a built in SOAP server built in. The connector itself is responsible intaking a traditional RESTful API request,
 * and using the SOAP service to communicate it to the QuickBooks Web Connector.
 */

var util = require('util'),
  Connector = require('loopback-connector').Connector,
  QBSOAP = require('./qb-soap'),
  debug = require('debug')('loopback:connector:quickbooks');

/**
 * Initialize connector with datasource, configure settings and return
 * @param {object} dataSource
 * @param {function} done callback
 */
exports.initialize = function initializeDataSource(dataSource, done) {
  console.log('initializing QuickBooks Connector DataSource')
  var settings = dataSource.settings || {};
  var connector = new QBConnector(settings, dataSource);
  connector.connectToQuickBooksWebConnector(settings, dataSource);
  dataSource.connector = connector;
  done();
};

/**
 * Connector constructor
 * @param {object} settings from dataSource
 * @constructor
 */
var QBConnector = function (settings, dataSource) {
  this.name = 'quickbooks';
  this._models = {};
  this.settings = settings;
};

/**
 * Inherit the prototype methods
 */
util.inherits(QBConnector, Connector);

/**
 * Connect to the QuickBooks Web Connector
 * @param {object} settings of data source
 * @param {object} dataSource
 */
QBConnector.prototype.connectToQuickBooksWebConnector = function (settings, dataSource) {
  //todo: authenticate and connect to the quickbooks web connector
  QBSOAP.connect(settings);
  this.dataSource = dataSource;
};

/**
 * Return an array of objects of multiple entries from QuickBooks
 * @param {String} model The model name
 * @param {Object} filter The filter
 * @param {Function} done callback function
 */
QBConnector.prototype.find = function find(model, filter, done) {
  var self = this;
  console.log('find method still being implemented');
  //todo: implement
};

/**
 * Return a single object of a single entry from QuickBooks
 * @param {String} model The model name
 * @param {Object} filter The filter
 * @param {Function} done callback function
 */
QBConnector.prototype.findOne = function findOne(model, filter, done) {
  var self = this;
  console.log('findOne method still being implemented');
  //todo: implement
};

/**
 * Find a model instance by id
 * @param {String} model name
 * @param {String} id
 * @param {Function} done callback
 */
QBConnector.prototype.findByID = function findByID(model, id, done) {
  var self = this;
  console.log('findById method still being implemented');
  //todo: implement
};

/**
 * Delete a document by Id
 * @param {String} model name
 * @param {String} id
 * @param {Function} done callback
 */
QBConnector.prototype.destroyByID = function destroyByID(model, id, done) {
  var self = this;
  console.log('destroyByID method still being implemented');
  //todo: implement
};

/**
 * Return number of rows by the where criteria
 * @param {String} model name
 * @param {String} filter criteria
 * @param {Function} done callback
 */
QBConnector.prototype.count = function count(model, filter, done) {
  var self = this;
  console.log('count method still being implemented');
  //todo: implement
};

/**
 * Return true of false of entry exists
 * @param {String} model name
 * @param {String} id
 * @param {Function} done callback
 */
QBConnector.prototype.exists = function count(model, id, done) {
  var self = this;
  console.log('exists method still being implemented');
  //todo: implement
};

/**
 * Create a new model instance
 * @param {String} model name
 * @param {object} data info
 * @param {Function} done callback
 */
QBConnector.prototype.create = function (model, data, done) {
  var self = this;
  console.log('create method still being implemented');
  //todo: implement
};

/**
 * Update document data
 * @param {String} model name
 * @param {Object} data document
 * @param {Function} done callback
 */
QBConnector.prototype.update = function (model, data, done) {
  var self = this;
  console.log('update method still being implemented');
  //todo: implement
};

module.exports.QBConnector = QBConnector;