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
 * .reader
 *
 * Response Apple Push Feedback protocol.
 * See APN documents for the specification.
 *
 * @api public
 */

exports.reader = lotus.reader()
  .u32be('timestamp')
  .u16be('tokenLen')
  .take('tokenLen', 'deviceToken');

/**
 * .writer
 *
 * Response Apple Push Feedback protocol.
 * See APN documents for the specifications.
 *
 * @api public
 */

exports.writer = lotus.writer()
  .u32be('timestamp')
  .u16be(function (msg) {
    return msg.deviceToken.length;
  })
  .push('deviceToken');
