/*!
 * apnagent - Message Constructor
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Internal module dependancies
 */

var Provider = require('./apnagent/provider');

/*!
 * APN Agent version
 */

exports.version = '0.0.0';

/*!
 * Provider factory
 */

exports.provider = function () {
  return new Provider();
};
