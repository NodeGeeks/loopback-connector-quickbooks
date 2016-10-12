/**
 * Created by aaronrussell on 9/30/16.
 */

require('../../datatype-ext');

const BigNumber = require('bignumber.js');

const FLOAT_CONVERSION = function(val) {
  return val ? parseFloat(val) : 0.0;
};

/**
 * @return {boolean}
 */
const BOOL_CONVERSION = function(val) {
  return val ? val == 'true' || val === true : false;
};

const TIME_CONVERSION = function(val) {
  if (val.constructor !== Date) {
    try {
      val = new Date(val).format('c');
    } catch(err) {
      val = undefined;
    }
  }
  if (val == 'Invalid Date') return new Error('Invalid Date');
  return val ? val.format('c') : new Date().format('c');
};

const DATE_CONVERSION = function(val) {
  if (val.constructor !== Date) {
    try {
      val = new Date(val).format('c');
    } catch(err) {
      return new Error('Value could not be formatted into a date.');
    }
  }
  if (val == 'Invalid Date') return new Error('Invalid Date');
  return val ? val.format('F') : new Date(val).format('F');
};

const STR_CONVERSION = function(val) {
  return val.toString();
};

const INT_CONVERSION = function(val) {
  return val ? parseInt(val) : 0;
};

const BIGDECIMAL_CONVERSION = function(val) {
  return val ? new BigNumber(val) : 0.0;
};

module.exports = {
  "AMTTYPE": FLOAT_CONVERSION,
  "BOOLTYPE": BOOL_CONVERSION,
  "DATETIMETYPE": TIME_CONVERSION,
  "DATETYPE": DATE_CONVERSION,
  "ENUMTYPE": STR_CONVERSION,
  "FLOATTYPE": FLOAT_CONVERSION,
  "GUIDTYPE": STR_CONVERSION,
  "IDTYPE": STR_CONVERSION,
  "INTTYPE": INT_CONVERSION,
  "PERCENTTYPE": FLOAT_CONVERSION,
  "PRICETYPE": FLOAT_CONVERSION,
  "QUANTYPE": BIGDECIMAL_CONVERSION,
  "STRTYPE": STR_CONVERSION,
  "TIMEINTERVALTYPE": STR_CONVERSION
};