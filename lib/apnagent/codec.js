/*!
 * apnagent - Codec Selector
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Internal collection of codecs
 */

var codecs = [];

/*!
 * Import the simple codec
 */

codecs.push(require('./codecs/simple'));

/*!
 * Import the enhanced codec
 */

codecs.push(require('./codecs/enhanced'));

/**
 * .byId (id)
 *
 * Get a codec by APNS first byte id.
 *
 * @param {Number} first byte id
 * @returns {Object} codec
 */

exports.byId = function (id) {
  return codecs.filter(function (c) {
    return c.id === id;
  })[0];
};

/**
 * .byName (name)
 *
 * Get a codec by APNS name.
 *
 * @param {String} name
 * @returns {Object} codec
 */

exports.byName = function (name) {
  return codecs.filter(function (c) {
    return c.name === name;
  })[0];
};
