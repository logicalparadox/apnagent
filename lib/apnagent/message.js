/*!
 * apnagent - Message Builder
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
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

var MAX_PAYLOAD_SIZE = 2048;

/**
 * ## Message Builder API
 *
 * A message encapsulates all data points that will
 * be encoded and sent through the wire to APNS. The message
 * builder is a chainable API that provides full feature
 * coverage of the Apple Push Notification specifications.
 *
 * The preferred method of composing messages is directly
 * from a constructed `Agent` or `MockAgent`.
 *
 * ```js
 * var msg = agent.createMessage();
 * ```
 *
 * @header Message Builder API
 */

function Message (agent, codec, opts) {
  /*!
   * @param {Agent} agent to use for sending
   * @param {String} default codec
   * @param {Object} payload to import
   * @api public
   */

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
    if (opts.aps['content-available']) this.contentAvailable(opts.aps['content-available']);

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
 * ### .alert (key, value)
 *
 * Sets variables to be included in the `alert` dictionary
 * for the `aps` portion of the payload. If you wish to set
 * a singlular message, set the `body` key. You may also set
 * any of the other values outlined in the APNS documentation
 * and the codecs will optimize the payload format for delivery.
 *
 * ##### Allowed keys:
 *
 * - `body`
 * - `action-loc-key`
 * - `loc-key`
 * - `loc-args`
 * - `launch-image`
 *
 * ```js
 * // just set body
 * msg.alert('Hello Universe');
 *
 * // set multiple values
 * msg.alert({
 *     body: 'Hello Universe'
 *   , 'launch-image': 'notif.png'
 * });
 *
 * // chainable
 * msg
 *   .alert('Hello Universe')
 *   .alert('launch-image', 'notif.png');
 * ```
 *
 * @param {String|Object} alert body, string key or object of alert settings
 * @param {Mixed} value (when first argument is a string)
 * @returns {this} for chaining
 * @api public
 * @name alert
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
  } else if (arguments.length === 1) {
    this.aps['body'] = key;
  } else {
    if (!~allowed.indexOf(key)) return this;
    this.aps[key] = value;
  }

  return this;
};

/**
 * ### .set (key, value)
 *
 * Set extra key values that will be incuded
 * as part of the payload. `aps` is reserved by
 * Apple and `enc` is reserved by apnagent.
 *
 * Is a key/value you pair is provided it will
 * be set. If an object is provided, all data points
 * will be merged into the current payload.
 *
 * ```js
 * // single value
 * msg.set('key', 'value');
 *
 * // multiple values
 * msg.set({
 *     key1: 'value1'
 *   , key2: 'value2'
 * });
 *
 * // or chainable
 * msg
 *   .set('key1', 'value1')
 *   .set('key2', 'value2');
 * ```
 *
 * @param {String|Object} string key or object of custom settings
 * @param {Mixed} value (when first argument is string)
 * @returns {this} for chaining
 * @api public
 * @name set
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
 * ### .device (token)
 *
 * Set the device that this message is to be delivered
 * to. Device can be provided as a string or buffer. If
 * provided as a string, it will be sanitized of spaces
 * and extra characters (such as `<` and `>`).
 *
 * ```js
 * msg.device('a1b2c3');
 * msg.device('<a1b2c3>');
 * ```
 *
 * @param {apnagent.Device|String|Buffer} device token
 * @returns {this} for chaining
 * @api public
 * @name device
 */

Message.prototype.device = function (device) {
  if (!arguments.length) {
    return this.meta.device;
  } else if (device instanceof Device) {
    this.meta.device = device;
  } else {
    this.meta.device.token = device;
  }

  return this;
};

/**
 * ### .expires (time)
 *
 * Set the message expiration date when being used
 * with the enhanced codec. The default value is `0` which
 * will indicate to Apple to only attempt to deliver
 * the message once.
 *
 * Should be provided as the number of ms until expiration
 * or as a string that can be converted, such as `1d`.
 *
 * ```js
 * // set to specific time in future
 * msg.expires('30m'); // 30 minutes
 * msg.expires('1d'); // 1 day
 *
 * // reset to default value
 * msg.expires(0);
 * msg.expires(true);
 * ```
 *
 * @param {Number|String} time until expiration
 * @returns {this} for chaining
 * @api public
 * @name expires
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
 * ### .badge (number)
 *
 * Set the badge number to be displayed.
 *
 * ```js
 * msg.badge(4);
 * ```
 *
 * @param {Number} badge count
 * @returns {this} for chaining
 * @api public
 * @name badge
 */

Message.prototype.badge = function (n) {
  this.settings.badge = n;
  return this;
};

/**
 * ### .sound (file)
 *
 * Set the sound file to be played when this message
 * is delivered if the app is closed.
 *
 * ```js
 * msg.sound('bingbong.aiff');
 * ```
 *
 * @param {String} sound file
 * @returns {this} for chaining
 * @api public
 * @name sound
 */

Message.prototype.sound = function (sound) {
  this.settings.sound = sound;
  return this;
};


/**
 * ### .contentAvailable (bool)
 *
 * Set the content-available flag for content download
 * push notifications
 *
 * ```js
 * msg.contentAvailable(true);
 * ```
 *
 * @param {Bool} sets content-available flag to 1 if true
 * @returns {this} for chaining
 * @api public
 * @name contentAvailable
 */

Message.prototype.contentAvailable = function (contentAvailable) {
  if (contentAvailable) {
    this.settings['content-available'] = 1;
  } else {
    this.settings['content-available'] = undefined;
  }
  return this;
};


/*!
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
    , SE = errors.MessageSerializationError
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
  var apsLength = Object.keys(this.aps).length;
  if (apsLength === 1 && this.aps.body) {
    payload.aps.alert = this.aps.body;
  } else if (apsLength > 0) {
    payload.aps.alert = {};
    extend(payload.aps.alert, this.aps);
  }

  // check to ensure body is not to long, shorten if possible
  var str = JSON.stringify(payload)
    , len = Buffer.byteLength(str, enc);

  if (len > MAX_PAYLOAD_SIZE && this.aps.body) {
    var over = len - MAX_PAYLOAD_SIZE
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
  } else if (len > MAX_PAYLOAD_SIZE) {
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
 * ### .send (cb)
 *
 * Send the message through the connected agent. The `cb`
 * function will be invoked with an error if there is
 * a problem serializing the message for transport.
 *
 * If there are no serialization errors, the callback
 * will be invoked when the message has been flushed
 * through the socket. This does NOT mean the message
 * has be received by the device or that Apple has
 * accepted the message. If Apple has a problem with
 * the message it will be emitted on the agent's
 * `message:error` event.
 *
 * ```js
 * msg.send(function (err) {
 *   if (err) {
 *     // handle it
 *   }
 * });
 * ```
 *
 * @param {Function} callback
 * @api public
 * @name send
 */

Message.prototype.send = function (cb) {
  cb = cb || function () {};
  if (!this._agent) return cb(new Error('Agent not associated with message.'));
  this._agent.send(this, cb);
};
