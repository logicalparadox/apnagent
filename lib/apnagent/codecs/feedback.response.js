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
 * Response Apple Push Feedback protocol.
 * See APN documents for the specification.
 *
 * @api public
 */

exports.decode = lotus.decode()
  .u32be('timestamp')
  .u16be('tokenLen')
  .take('tokenLen', 'deviceToken');

/**
 * .encode
 *
 * Response Apple Push Feedback protocol.
 * See APN documents for the specifications.
 *
 * @api public
 */

exports.encode = lotus.encode()
  .u32be('timestamp')
  .u16be(function (msg) {
    return msg.deviceToken.length;
  })
  .push('deviceToken');
