/*!
 * apnagent - Message Constructor
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Internal module dependancies
 */

var _ = require('./utils');

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

function Message (enc) {
  this.encoding = enc || 'utf8';
  this.meta = {};
  this.settings = {};
  this.payload = {};
  this.aps = {};
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
  if ('string' == typeof key) {
    if (key === 'aps') return;
    this.payload[key] = value;
  } else {
    for (name in key) {
      if (name === 'aps') continue;
      this.payload[name] = key[name];
    }
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

  if ('string' == typeof key) {
    if (!~allowed.indexOf(key)) return this;
    this.aps[key] = value;
  } else {
    for (var name in key) {
      if (!~allowed.indexOf(name)) continue;
      this.aps[name] = key[name];
    }
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
  if ('string' === typeof device) {
    device = new Buffer(device.replace(/\s/g, ''), 'hex');
  }

  this.meta.device = device;
  return this;
};

/**
 * .codec (name)
 *
 * Overwrite the default codec to be used when
 * encoding for transfer.
 *
 * @param {String} codec name
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.codec = function (name) {
  this.meta.codec = name;
  return this;
};

/**
 * .id (id)
 *
 * > NOTE: not currently implemented
 *
 * Set the message ID when being used with the enhanced
 * codec. If you are composing a message using the
 * service API, this will be automatically set.
 *
 * See APNS documentation for more information.
 *
 * @param {Buffer|Hex|String} message id
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.id = function (id) {
  //TODO: implement this
};

/**
 * .id (id)
 *
 * > NOTE: not currently implemented
 *
 * Set the message expiration date when being used
 * with the enhanced codec. If you are composing a
 * message using the service API, you can set the
 * default expiration to have this automatically populated.
 *
 * Should be provided as the number of ms until expiration
 * or as a string that can be converded, such as `1d`.
 *
 * See APNS documentation for more information.
 *
 * @param {Number|String} time until expiration
 * @returns {this} for chaining
 * @api public
 */

Message.prototype.expires = function (time) {
  //TODO: implement this
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
 * .export ()
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

Message.prototype.export = function () {
  var payload = {}
    , enc = this.encoding;

  function byteLength (str) {
    return Buffer.byteLength(str, enc);
  }

  function trim (str, len) {
    len = len - 3;
    var res = str.substr(0, len);
    res = res.substr(0, Math.min(res.length, res.lastIndexOf(' ')));
    return res + '...';
  }

  // copy over extra variables
  _.merge(payload, this.payload);

  if (enc !== 'utf8') {
    payload.enc = this.encoding;
  }

  // copy over badge and sound settings
  payload.aps = {};
  _.merge(payload.aps, this.settings);

  // copy over alert settings
  if (Object.keys(this.aps).length === 1 && this.aps.body) {
    payload.aps.alert = this.aps.body;
  } else {
    payload.aps.alert = {};
    _.merge(payload.aps.alert, this.aps);
  }

  var str = JSON.stringify(payload);

  if (byteLength(str) > 256 && this.aps.body) {
    var over = byteLength(str) - 256
      , bodyLen = byteLength(this.aps.body);

    if (bodyLen <= over) throw new Error('Message too long.');

    var body = trim(this.aps.body, bodyLen - over);

    if ('string' === typeof payload.aps.alert) {
      payload.aps.alert = body;
    } else {
      payload.aps.alert.body = body;
    }
  } else if (byteLength(str) > 256) {
    throw new Error('Message too long.');
  }

  return payload;
};

/**
 * .import (json)
 *
 * Import a compatible payload into this message.
 * If the message already has variables defined, they
 * may be overwritten or merged with incoming values.
 * Suggested use is only with an empty message.
 *
 * @param {Object} json payload
 * @api public
 */

Message.prototype.import = function (json) {
  // import custom encoding
  if (json.enc) this.encoding = json.enc;

  // import custom variables
  for (var name in json) {
    if (name === 'aps' || name === 'enc') continue;
    this.set(name, json[name]);
  }

  if (json.aps) {
    // import badge/sound
    if (json.aps.badge) this.badge(json.aps.badge);
    if (json.aps.sound) this.sound(json.aps.sound);

    // import alert
    if (json.aps.alert && 'string' === typeof json.aps.alert) {
      this.alert('body', json.aps.alert);
    } else {
      this.alert(json.aps.alert);
    }
  }
};
