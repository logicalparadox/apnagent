/*!
 * apnagent - Simple Message Codec
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Internal module dependancies
 */

var Message = require('../message');

/**
 * .name
 *
 * Code name identifier according to
 * APNS documentation.
 *
 * @type {String}
 * @api public
 */

exports.name = 'simple';

/**
 * .id
 *
 * Code id identifier according to
 * APNS documentation. Also used as the
 * first byte when encoded.
 *
 * @type {Number}
 * @api public
 */

exports.id = 0;

/**
 * .encode (message)
 *
 * Will encode the provided message into a
 * buffer according to the APNS documentation.
 *
 * @param {Message} apnagent constructed message
 * @returns {Buffer}
 */

exports.encode = function (msg) {
  var enc = msg.encoding
    , token = msg.meta.device
    , payload = JSON.stringify(msg.export())
    , plLen = Buffer.byteLength(payload, enc)
    , buf = new Buffer(1 + 2 + token.length + 2 + plLen)
    , pos = 0;

  // write command
  buf[0] = 0;
  pos++;

  // write device token length
  buf.writeUInt16BE(token.length, pos);
  pos += 2;

  // write device token
  pos += token.copy(buf, pos, 0);

  // write the payload size
  buf.writeUInt16BE(plLen, pos);
  pos += 2;

  // write the payload
  pos += buf.write(payload, pos, enc);

  return buf;
};

/**
 * .decode (buffer)
 *
 * Will decode the provided buffer into a
 * message according to the APNS documentation.
 *
 * @param {Buffer} incoming
 * @returns {Message} apnagent constructed message
 */

exports.decode = function (buf) {
  var msg = new Message();

  // pull out the device token
  var tokenLen = buf.slice(1, 3).readUInt16BE(0)
    , token = buf.slice(3, 3 + tokenLen);

  // set device token
  msg.device(token);

  // pull out the JSON payload
  var payloadStart = 3 + tokenLen + 2
    , payloadRaw = buf.slice(payloadStart)
    , payload = JSON.parse(payloadRaw);

  // import payload/settings/alert
  msg.import(payload);

  return msg;
};
