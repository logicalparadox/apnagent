/*!
 * apnagent - Simple Codec
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var lotus = require('lotus');

/**
 * .reader
 *
 * Simple Apple Push Notifications protocol.
 * See APN documents for the specification.
 *
 * @api public
 */

exports.reader = lotus.reader()
  .u16be('tokenLen')
  .take('tokenLen', 'deviceToken')
  .u16be('payloadLen')
  .take('payloadLen', 'payload', JSON.parse);

/**
 * .writer
 *
 * Enhanced Apple Push Notifications protocol.
 * See APN documents for the specifications.
 *
 * @api public
 */

exports.writer = lotus.writer()
  .u16be(function (msg) {
    return msg.deviceToken.length;
  })
  .push('deviceToken')
  .u16be(function (msg) {
    var payload = JSON.stringify(msg.payload);
    return Buffer.byteLength(payload, 'utf8');
  })
  .write('payload', 'utf8', JSON.stringify);
