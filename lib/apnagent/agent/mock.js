/*!
 * apnagent - Agent (Mock)
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:agent-mock')
  , inherits = require('tea-inherits')
  , ms = require('tea-ms')
  , lotus = require('lotus');

/*!
 * Internal dependancies
 */

var Base = require('./base')
  , codecs = require('../codecs')
  , errors = require('../errors')
  , util = require('../util')
  , Device = require('../device');

/*!
 * Primary Export
 */

module.exports = Mock;

/**
 * Mock (Mock)
 *
 * The agent keeps a constant connection with
 * the apn service. All messages are pass through
 * its open stream. It will manage reconnections
 * and authentication.
 *
 * See APNS Documentation
 *
 * @api public
 */

function Mock () {
  Base.call(this);

  // Messages sent to these devices will be rejected with error 8 BAD_TOKEN
  this.badDevices = []
}

/*!
 * Inherits from Base
 */

inherits(Mock, Base);

/**
 * .connect (callback)
 *
 * Begin the serer connection sequence and
 * establish all listeners needed for operation,
 * including a callback on successful connection.
 *
 * @param {Function} callback on connect
 * @name connect
 * @api public
 */

Mock.prototype.connect = function (cb) {
  cb = cb || function () {};

  var self = this
    , delay = this.get('reconnect delay')
    , opts = util.gatewayOptions(this)
    , recon = this.enabled('reconnect')
    , ttl = this.get('cache ttl')
    , gateway;

  // how to perform a reconnect
  function reconnect () {
    var gwe = self.meta.gatewayError
      , pos = 0;

    if (gwe && 'undefined' !== typeof gwe.identifier) {
      debug('(cache) since: %d', gwe.identifier);
      self.cache.sinceId(gwe.identifier, function (obj, id) {
        debug('(queue) push: %d', id);
        self.queue.pushAt(pos++, obj);
      });
    }

    debug('(gateway) reconnecting');
    self.connect(function (err) {
      if (err) return;
      debug('(gateway) reconnected');
      self.emit('gateway:reconnect');
    });
  }

  // reset state
  this.meta.gatewayError = null;

  // mock gateway parses the outgoing buffers back to json
  gateway = lotus.createDecoder();
  gateway.stream(0, codecs.getInterface('gateway simple', 'decode'));
  gateway.stream(1, codecs.getInterface('gateway enhanced', 'decode'));

  // simulate async connect
  debug('(gateway) connecting - mock');
  process.nextTick(function () {
    debug('(gateway) connected - mock');
    self.connected = true;
    self.cache.ttl = ttl;
    self.cache.resume();
    self.queue.resume();
    self.emit('gateway:connect');
    cb();
  });

  function shouldBeRejected (msgJson) {
    msgDevice = new Device(msgJson.deviceToken);
    reject = false;
    for (var i = 0; i < self.badDevices.length; i++) {
      reject = self.badDevices[i].equal(msgDevice)
    }
    return reject;
  }

  // data event is emitted for each message
  function emitter () {
    var json = this.read();
    if (!json) return;

    // Simulate message error at Apple side
    if (shouldBeRejected(json)) {
      var err = new errors.GatewayMessageError("Invalid token", {code: 8})
      self.meta.gatewayError = err;

      debug('(gateway) incoming message error', err.toJSON(false));
      self.emit('message:error', err, json);
      gateway.end();
    } else {
      debug('(gateway) incoming message', json);
      self.emit('mock:message', json);
    }
  }

  gateway.stream(0).on('readable', emitter);
  gateway.stream(1).on('readable', emitter);

  // an error is emitted when an incoming message is badly formatted
  gateway.on('error', function (err) {
    debug('(gateway) error: %s', err.message || 'Unspecified Error');
    self.emit('gateway:error', err);
  });

  // this is similiar to a socket `close` event
  gateway.on('close', function () {
    self.cache.pause();
    self.queue.pause();
    self.gateway = null;

    if (self.connected && recon) {
      debug('(gateway) disconnected - mock');
      self.connected = false;
      self.meta.timer = setTimeout(reconnect, ms(delay));
    } else {
      debug('(gateway) closed - mock');
      self.connected = false;
      self.emit('gateway:close');
    }
  });

  // mount
  this.gateway = gateway;
  return this;
};

/**
 * .close ()
 *
 * Closes the gateway connection.
 *
 * @name close
 * @api public
 */

Mock.prototype.close = function (cb) {
  cb = cb || function () {};

  // leave if nothing needs to be done
  if (!this.connected || !this.gateway) {
    clearTimeout(this.meta.timer);
    process.nextTick(cb);
    return this;
  }

  var self = this
    , drain = this.queue.drain;

  // wait for queue to finish processing current
  this.queue.drain = function () {
    debug('(gateway) disconnecting');
    self.cache.pause();
    process.nextTick(cb);
    self.gateway.end();
    self.queue.drain = drain;
  };

  // set things in motion
  this.connected = false;
  this.queue.pause();
  return this;
};

/**
 * .setBadDevices ()
 *
 * If, after setting tokens here, message is sent to one
 * of these token, it'll result in error 8 "Invalid token".
 * Connection then will be closed.
 *
 * Intended to be used by clients when testing their error
 * mitigation logics.
 *
 * @param {Array} Array of Device
 * @name setBadDevices
 * @api public
 */
Mock.prototype.setBadDevices = function (devices) {
  // Validate input, crash early if smth is wrong -
  // better than search for a bug somewhere deep in code
  if (!(devices instanceof Array)) {
    throw new Error('Parameter "devices" should be an array of Device');
  } else {
    for (var i = 0; i < devices.length; i++) {
      if (!(devices[i] instanceof Device)) {
        throw new Error('Parameter "devices" should be an array of Device')
      }
    }
  }

  // All good
  this.badDevices = devices;
};

Mock.prototype._queueIterator = function (obj, next) {
  var self = this
    , cache = this.cache
    , encoder = this.encoder
    , stream = encoder.stream(obj.codec)
    , id = obj.json.identifier
    , queue = this.queue;

  // wait for encoded message
  encoder.once('readable', function () {
    var buf = encoder.read()
      , gateway = self.gateway;

    // requeue if not connected
    if (!gateway || !gateway.writable || !self.connected) {
      debug('(queue) pause: not connected');
      queue.pause();
      queue.pushAt(0, obj);
      return next();
    }

    debug('(gateway) write: %d', id);
    gateway.write(buf);
    process.nextTick(function () {
      debug('(cache) push: %d', id);
      cache.push(id, obj);
      next();
    });
  });

  // encode message
  debug('(encoder) write: %d', id);
  stream.write(obj.json);
};
