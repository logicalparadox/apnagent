/*!
 * apnagent - Device
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Primary export
 */

module.exports = Device;

/**
 * ## Device API
 *
 * A small constructor to easily encapsulate a device
 * token so it can be passed around and converted to
 * whatever type is needed for given scenario.
 *
 * If a Device is constructed without parameters, a
 * token can be assigned later by setting the `.token`
 * property to either a string or buffer.
 *
 * The most common usage for the `Device` constructor
 * is to sanitize a device token for storage in a database.
 *
 * ```js
 * var Device = require('apnagent').Device
 *   , device = new Device('<a1b56d2c 08f621d8 7060da2b>');
 * ```
 *
 * @header Device API
 */

function Device (token) {
  /*!
   * @param {String|Buffer|Device} device token
   * @api public
   */
  if (token instanceof Device) {
    token = token.toString();
  }

  this.token = token || undefined;
}

/**
 * ### .toBuffer ()
 *
 * Convert the stored device token to a buffer.
 *
 * ```js
 * var buf = device.toBuffer();
 * ```
 *
 * @return {Buffer}
 * @api public
 * @name toBuffer
 */

Device.prototype.toBuffer = function () {
  return bufferize(this.token);
};

/**
 * ### .toString ()
 *
 * Convert the stored device token to a string.
 * The string will be sanitized and thus not include
 * spaces or extra characters.
 *
 * ```js
 * var str = device.toString();
 * ```
 *
 * @return {String}
 * @api public
 * @name toString
 */

Device.prototype.toString = function () {
  return stringify(this.token);
};

/**
 * ### .equal (device)
 *
 * Compare the stored device token to another
 * device, string, or buffer. Will also return false
 * if both Devices do not have tokens associated with
 * them.
 *
 * ```js
 * // testing string
 * device.equal('a1b56d2c08f621d87060da2b').should.be.true;
 *
 * // testing another device
 * var dev2 = new Device('feedface');
 * device.equal(dev2).should.be.false;
 * ```
 *
 * @param {Mixed} instance of Device, String, or Buffer
 * @return {Boolean} device tokens equal
 * @api public
 * @name equal
 */

Device.prototype.equal = function (dev) {
  var token1 = this.toString()
    , token2 = dev instanceof Device
      ? dev.toString()
      : stringify(dev);

  return token1
    && token2
    && token1 === token2;
};

/*!
 * Turn a device token into its buffer representation.
 * If a Buffer is passed in, it will be converted to
 * a string first so that it is dereferrenced.
 *
 * @param {Mixed} device token
 * @return {Buffer}
 * @api private
 */

function bufferize (token) {
  if (!token) return undefined;
  if (token instanceof Buffer) token = stringify(token);
  return new Buffer(token.replace(/[^a-z0-9]/gi, ''), 'hex');
}

/*!
 * Turn a device token into it's string representation.
 * If a string is passed in, it will be converted to
 * a Buffer first to ensure it is a valid hex.
 *
 * @param {Mixed} device token
 * @return {Buffer}
 * @api private
 */

function stringify (token) {
  if (!token) return undefined;
  if ('string' === typeof token) token = bufferize(token);
  return token.toString('hex');
}
