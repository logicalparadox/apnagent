/*!
 * apnagent - Mock (Mock)
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:agent-mock')
  , inherits = require('tea-inherits')
  , lotus = require('lotus');

/*!
 * Internal dependancies
 */

var Base = require('./base')
  , codecs = require('../codecs')
  , errors = require('../errors')
  , util = require('../util');

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
    var gwe = sef.gatewayError
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
  this.gatewayError = null;

  // mock gateway parses the outgoing buffers back to json
  gateway = lotus.createReaderStream();
  gateway.use(0, codecs.getInterface('gateway simple', 'reader'));
  gateway.use(1, codecs.getInterface('gateway enhanced', 'reader'));

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

  // data event is emitted for each message
  gateway.on('data', function (json) {
    debug('(gateway) incoming message', json);
    self.emit('mock:message', json);
  });

  // an error is emitted when an incoming message is badly formatted
  gateway.on('error', function (err) {
    debug('(gateway) error: %s', err.message || 'Unspecified Error');
    self.emit('gateway:error', err);
  });

  // end is similiar to a socket `close` event
  gateway.on('end', function () {
    self.cache.pause();
    self.queue.pause();
    self.gateway = null;

    if (self.connected && recon) {
      debug('(gateway) disconnected - mock');
      self.connected = false;
      setTimeout(reconnect, ms(delay));
    } else {
      debug('(gateway) closed - mock');
      self.connected = false;
      self.emit('gateway:close');
    }
  });

  // mount
  this.gateway = gateway;
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
  if (!this.connected) return cb();
  debug('(gateway) disconnecting');
  this.connected = false;
  this.cache.pause();
  this.queue.pause();
  process.nextTick(cb);
  this.gateway.end();
};

Mock.prototype._queueIterator = function (obj, next) {
  if (!this.gateway || !this.connected) {
    debug('(queue) pause: not connected');
    this.queue.pause();
    this.queue.pushAt(0, obj);
    return next();
  }

  var cache = this.cache
    , encoder = this.encoder
    , gateway = this.gateway
    , id = obj.json.identifier;

  encoder.once('data', function (buf) {
    debug('(gateway) write: %d', id);
    gateway.write(buf);
    process.nextTick(function () {
      debug('(cache) push: %d', id);
      cache.push(id, obj);
      next();
    });
  });

  debug('(encoder) write: %d', id);
  encoder.write(obj.codec, obj.json);
};
