/*!
 * apnagent - Device
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary export
 */

module.exports = Device;

/**
 * Device
 *
 * A small constructor to easily encapsulate a device
 * token so it can be passed around and converted to
 * whatever type is needed for given scenario.
 *
 * If a Device is constructed without parameters, a
 * token can be assigned later by setting the `.token`
 * property to either a string or buffer.
 *
 * @param {String|Buffer} device token
 * @api public
 */

function Device (token) {
  this.token = token || undefined;
}

/**
 * .toBuffer ()
 *
 * Convert the stored device token to a buffer.
 *
 * @return {Buffer}
 * @api public
 */

Device.prototype.toBuffer = function () {
  return bufferize(this.token);
};

/**
 * .toString ()
 *
 * Convert the stored device token to a string.
 *
 * @return {String}
 * @api public
 */

Device.prototype.toString = function () {
  return stringify(this.token);
};

/**
 * .equal (device)
 *
 * Compare the stored device token to another
 * Device, string, or Buffer. Will also return false
 * if both Devices do not have tokens associated with
 * them.
 *
 * @param {Mixed} instance of Device, String, or Buffer
 * @return {Boolean} device tokens equal
 * @api public
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
  return new Buffer(token.replace(/\s/g, ''), 'hex');
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
