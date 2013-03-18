/*!
 * apnagent - Response Codec
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var lotus = require('lotus');

/**
 * .decode
 *
 * Response Apple Push Notifications protocol.
 * See APN documents for the specification.
 *
 * @api public
 */

exports.decode = lotus.decode()
  .take(1, 'code')
  .u32be('identifier');
