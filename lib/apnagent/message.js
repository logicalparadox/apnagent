/*!
 * apnagent - Message Builder
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var extend = require('tea-extend')
  , ms = require('tea-ms');

/*!
 * Internal dependencies
 */

var Device = require('./device')
  , errors = require('./errors')
  , util = require('./util');

/*!
 * Primary export
 */

module.exports = Message;

/**
 * Message
 *
 * A message encapsulates all data points that will
 * be encoded and sent via the wire to the APNS. If
 * any data is provided to a message that a codec
 * does not support, it will be ignored (such as
 * `expires` to the simple codec).
 *
 * @param {String} encoding for payload (utf8)
 * @api public
 */

function Message (agent, codec, opts) {
  this._agent = agent;
  this.encoding = 'utf8';

  this.meta = {};
  this.meta.codec = codec;
  this.meta.device = new Device();
  this.meta.expires = null;

  this.settings = {};
  this.payload = {};
  this.aps = {};

  opts = opts || {};

  // import custom encoding
  if (opts.enc) this.encoding = opts.enc;

  // import custom variables
  for (var name in opts) {
    if (name === 'aps' || name === 'enc') continue;
    this.set(name, opts[name]);
  }

  if (opts.aps) {
    // import badge/sound
    if (opts.aps.badge) this.badge(opts.aps.badge);
    if (opts.aps.sound) this.sound(opts.aps.sound);

    // import alert
    if (opts.aps.alert && 'string' === typeof opts.aps.alert) {
      this.alert('body', opts.aps.alert);
    } else if (opts.aps.alert) {
      this.alert(opts.aps.alert);
    }
  }

  if (agent && 'simple' !== codec) {
    this.expires(agent.get('expires'));
  }
}

/**
 * .set (key, value)
 *
 * Set extra key values that will be incuded
 * as part of the payload. `aps` is reserved by
 * Apple and `enc` is reserved by apnagent.
 *
 * Is a key/value you pair is provided it will
 * be set. If an object is provided, all data points
 * will be merged into the current payload.
 *
 * @param {String|Object}
 * @param {Mixed} value
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.set = function (key, value) {
  if ('object' === typeof key) {
    for (var name in key) {
      this.set(name, key[name]);
    }
  } else {
    if (key === 'aps') return;
    this.payload[key] = value;
  }

  return this;
};

/**
 * .alert (key, value)
 *
 * Sets variables to be included in the `alert` dictionary
 * for the `aps` portion of the payload. If you wish to set
 * a singlular message, set the `body` key. You may also set
 * any of the other values outlined in the APNS documentation
 * and the codecs will optimize the payload format for delivery.
 *
 * Allowed keys:
 * - `body`
 * - `action-loc-key'
 * - `log-key`
 * - `loc-args`
 * - `launch-image`
 *
 * @param {String|Object}
 * @param {Mixed} value
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.alert = function (key, value) {
  var allowed = [
      'body'
    , 'action-loc-key'
    , 'loc-key'
    , 'loc-args'
    , 'launch-image'
  ];

  if ('object' === typeof key) {
    for (var name in key) {
      this.alert(name, key[name]);
    }
  } else {
    if (!~allowed.indexOf(key)) return this;
    this.aps[key] = value;
  }

  return this;
};

/**
 * .device (token)
 *
 * Set the device that this message is to be delivered
 * to. Device can be provided as a string or buffer. If
 * provided as a string, it expected hex compatible string,
 * with each 32bit (4 octet) group seperated by spaces.
 *
 * @param {String|Buffer} device token
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.device = function (device) {
  if (!device) {
    return this.meta.device;
  } else {
    this.meta.device.token = device;
    return this;
  }
};

/**
 * .expires (time)
 *
 * Set the message expiration date when being used
 * with the enhanced codec. If you are composing a
 * message using the service API, you can set the
 * default expiration to have this automatically populated.
 *
 * Should be provided as the number of ms until expiration
 * or as a string that can be converted, such as `1d`.
 *
 * See APNS documentation for more information.
 *
 * @param {Number|String} time until expiration
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.expires = function (time) {
  if ('number' === typeof time) {
    this.meta.expires = time === 0 ? time : ms.unix(time);
    this.meta.codec = 'enhanced';
  } else if (true === time) {
    this.meta.expires = 0;
    this.meta.codec = 'enhanced';
  } else if (!time) {
    this.meta.expires = null;
    this.meta.codec = 'simple'
  } else {
    this.meta.expires = ms.unix(time);
    this.meta.codec = 'enhanced';
  }

  return this;
};

/**
 * .badge (number)
 *
 * Set the badge number to be displayed if the
 * message is delivered while the application is closed.
 *
 * @param {Number} badge count
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.badge = function (n) {
  this.settings.badge = n;
  return this;
};

/**
 * .sound (file)
 *
 * Set the sound file to be played when this message
 * is delivered if the app is closed.
 *
 * See APNS documenation for more informatino.
 *
 * @param {String} sound file
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.sound = function (sound) {
  this.settings.sound = sound;
  return this;
};

/**
 * .serialize ()
 *
 * Export this message to JSON in a format
 * that will be accepted by Apple as a compatible
 * payload.
 *
 * Used by the codecs.
 *
 * @returns {Object} JSON payload
 * @api public
 */

Message.prototype.serialize = function () {
  var codec = this.meta.codec
    , enc = this.encoding
    , payload = {}
    , SE = errors.SerializationError
    , ssf = arguments.callee;

  // check for device
  if (!this.meta.device.toBuffer()) {
    throw new SE('Message device not specified.', null, ssf);
  }

  // enhanced codec requires expiration
  if ('enhanced' === codec && null === this.meta.expires) {
    throw new SE('Message expiration not specified for enhanced codec delivery.', null, ssf);
  }

  // enchanced code requires agent to generate an id
  if ('enhanced' === codec && !this._agent) {
    throw new SE('Message agent not specified for enhanced codec delivery.', null, ssf);
  }

  // copy over extra variables
  extend(payload, this.payload);

  // set encoding if not utf8
  if (enc !== 'utf8') {
    payload.enc = this.encoding;
  }

  // copy over badge and sound settings
  payload.aps = {};
  extend(payload.aps, this.settings);

  // copy over alert settings
  if (Object.keys(this.aps).length === 1 && this.aps.body) {
    payload.aps.alert = this.aps.body;
  } else {
    payload.aps.alert = {};
    extend(payload.aps.alert, this.aps);
  }

  // check to ensure body is not to long, shorten if possible
  var str = JSON.stringify(payload)
    , len = Buffer.byteLength(str, enc);

  if (len > 256 && this.aps.body) {
    var over = len - 256
      , bodyLen = Buffer.byteLength(this.aps.body, enc)
      , body = bodyLen <= over
        ? null
        : util.trim(this.aps.body, bodyLen - over);

    if (!body) {
      throw new SE('Message too long.', null, ssf);
    }

    if ('string' === typeof payload.aps.alert) {
      payload.aps.alert = body;
    } else {
      payload.aps.alert.body = body;
    }
  } else if (len > 256) {
    throw new SE('Message too long.', null, ssf);
  }

  // construct the response
  var res = {};
  res.deviceToken = this.meta.device.toBuffer();
  res.expiration = this.meta.expires
  res.identifier = this._agent
    ? this._agent.nextId()
    : null;
  res.payload = payload;
  return res;
};

/**
 * .send (cb)
 *
 * Hook to not break the chainable interface when
 * wanting to send a message.
 *
 * @param {Function} callback
 */

Message.prototype.send = function (cb) {
  cb = cb || function () {};
  if (!this._agent) return cb(new Error('Agent not associated with message.'));
  this._agent.send(this, cb);
};
