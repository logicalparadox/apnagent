/*!
 * apnagent - Agent (Live)
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:agent-live')
  , inherits = require('tea-inherits')
  , ms = require('tea-ms')
  , tls = require('tls');

/*!
 * Internal dependancies
 */

var Base = require('./base')
  , errors = require('../errors')
  , util = require('../util');

/*!
 * Primary Export
 */

module.exports = Agent;

/**
 * Agent (Live)
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

function Agent () {
  Base.call(this);
}

/*!
 * Inherits from Base
 */

inherits(Agent, Base);

/**
 * ._reconnect()
 *
 * Establish the broken connection again
 *
 * @name _reconnect
 * @api private
 */

Agent.prototype._reconnect = function(){
  var self = this
    , gwe = self.meta.gatewayError
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
};

/**
 * .connect (callback)
 *
 * Begin the server connection sequence and
 * establish all listeners needed for operation,
 * including a callback on successful connection.
 *
 * @param {Function} callback on connect
 * @name connect
 * @api public
 */
Agent.prototype.connect = function (cb) {
  cb = cb || function () {};

  var self = this
    , delay = this.get('reconnect delay')
    , opts = util.gatewayOptions(this)
    , recon = this.enabled('reconnect')
    , ttl = this.get('cache ttl')
    , gateway;

  // don't try to connect without credentials
  if (!opts.pfx && !opts.key && !opts.cert) {
    process.nextTick(function () {
      var err = new errors.GatewayAuthorizationError('Insufficient credentials');
      debug('(gateway) error: %s', err.message);
      self.emit('gateway:error', err);
      cb(err);
    });

    return this;
  }

  // reset state
  this.meta.gatewayError = null;

  // connect to gateway
  debug('(gateway) connecting - %s:%d', opts.host, opts.port);
  gateway = tls.connect(opts, function () {
    if (gateway.authorized) {
      debug('(gateway) connected - %s:%d', opts.host, opts.port);
      self.connected = true;
      self.cache.ttl = ttl;
      self.cache.resume();
      self.queue.resume();
      self.emit('gateway:connect');
      cb();
    } else {
      var err = new errors.GatewayAuthorizationError(gateway.authorizationError);
      debug('(gateway) unauthorized - %s:%d', opts.host, opts.port, gateway.authorizationError);
      self.gateway.destroy();
      self.emit('gateway:error', err);
      cb(err);
    }
  });

  // handle a disconnection
  gateway.on('close', function () {
    self.cache.pause();
    self.queue.pause();
    self.gateway = null;

    if (self.connected && recon) {
      debug('(gateway) disconnected - %s:%d', opts.host, opts.port);
      self.connected = false;
      self.meta.timer = setTimeout(self._reconnect.bind(self), ms(delay));
    } else {
      debug('(gateway) closed - %s:%d', opts.host, opts.port);
      self.connected = false;
      self.emit('gateway:close');
    }
  });

  // handle incoming data
  gateway.on('data', function (buf) {
    debug('(gateway) data: %d bytes', buf.length);
    self.decoder.write(buf);
  });

  // emit errors;
  gateway.on('error', function (err) {
    debug('(gateway) error: %s', err.message || 'Unspecified Error');
    if (self.gateway) self.gateway.destroy();
    self.emit('gateway:error', err);
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

Agent.prototype.close = function (cb) {
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
    self.gateway.once('close', cb);
    self.gateway.destroy();
    self.queue.drain = drain;
  };

  // set things in motion
  this.connected = false;
  this.queue.pause();
  return this;
};

Agent.prototype._queueIterator = function (obj, next) {
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
    gateway.write(buf, function () {
      debug('(cache) push: %d', id);
      cache.push(id, obj);
      next();
    });
  });

  // encode message
  debug('(encoder) write: %d', id);
  stream.write(obj.json);
};
