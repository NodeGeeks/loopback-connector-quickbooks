/**
 * Created by aaronrussell on 10/11/16.
 */
const fs = require('fs');
module.exports = {
  Customer: JSON.parse(fs.readFileSync(__dirname +'/Customer.json', 'utf8')),
  Estimate: JSON.parse(fs.readFileSync(__dirname +'/Estimate.json', 'utf8')),
  SalesOrder: JSON.parse(fs.readFileSync(__dirname +'/SalesOrder.json', 'utf8')),
  datatypeMappings: require('./datatype-mappings')
};