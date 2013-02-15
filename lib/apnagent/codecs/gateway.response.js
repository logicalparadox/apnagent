/*!
 * apnagent - Response Codec
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var lotus = require('lotus');

/**
 * .reader
 *
 * Response Apple Push Notifications protocol.
 * See APN documents for the specification.
 *
 * @api public
 */

exports.reader = lotus.reader()
  .take(1, 'code')
  .u32be('identifier');
