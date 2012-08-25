/*!
 * apnagent - Enhanced Message Codec
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

exports.name = 'enhanced';

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

exports.id = 1;

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

};
