/*!
 * apnagent - Agent (Live)
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:agent-live')
  , inherits = require('tea-inherits')
  , tls = require('tls');

/*!
 * Internal dependancies
 */

var Base = require('./base')
  , errors = require('../errors');

/*!
 * APN Service Constants
 */

var APNS_PORT = 2195
  , APNS_PROD = 'gateway.push.apple.com'
  , APNS_SANDBOX = 'gateway.sandbox.push.apple.com';

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

Agent.prototype.connect = function (cb) {
  cb = cb || function () {};

  var self = this
    , opts = {}
    , gateway;

  function copy (key) {
    if (self.get(key)) opts[key] = self.get(key);
  }

  // get the tls host based on sandbox
  opts.host = this.enabled('sandbox')
    ? APNS_SANDBOX
    : APNS_PROD;

  // use default port
  opts.port = APNS_PORT;

  // include passphrase
  copy('passphrase');

  // get our tls certificates
  if (this.get('pfx')) {
    copy('pfx');
  } else {
    copy('key');
    copy('cert');
  }

  // apply ca certificate
  if (this.get('ca')) {
    copy('ca');
    opts.ca = [ opts.ca ];
  }

  debug('gateway initializing connection to %s:%d', opts.host, opts.port);
  this.gatewayOpts = opts;

  // connect to tls service using opts
  gateway = tls.connect(opts, function () {
    if (gateway.authorized) {
      debug('gateway connection established to %s:%d', opts.host, opts.port);
      self.connected = true;
      self.queue.resume();
      self.emit([ 'gateway', 'connect' ], opts.host, opts.port);
      cb();
    } else {
      debug('gateway connection denied to %s:%d', opts.host, opts.port, gateway.authorizationError);
      self.gateway.destroy();
      var err = new errors.GatewayAuthorizationError(gateway.authorizationError);
      self.emit([ 'gateway', 'error' ], err);
      cb(err);
    }
  });

  // handle a disconnection
  gateway.on('close', function () {
    self.queue.pause();
    self.gatewayOpts = null;
    self.gateway = null;

    // if user DID trigger disconnect
    if (!self.connected) {
      debug('gateway connection closed to %s:%d', opts.host, opts.port);
      self.emit([ 'gateway', 'close' ]);
    }

    // if user DID NOT trigger disconnect
    else if (self.connected && self.enabled('reconnect')) {
      debug('gateway connection unexpectedly closed to %s:%d', opts.host, opts.port);
      setTimeout(function () {
        debug('gateway triggering reconnect');
        self.connect(function () {
          var host = self.gatewayOpts.host
            , port = self.gatewayOpts.port;
          debug('gateway reconnected successful to %s:%d', host, port);
          self.emit([ 'gateway', 'reconnect' ], host, port);
        });
      }, self.get('reconnect delay'));
    }

    self.connected = false;
  });

  // emit errors;
  gateway.on('error', function (err) {
    debug('gateway socket error: %s', err.message || 'Unspecified Error');
    self.emit([ 'gateway', 'error' ], err);
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

Agent.prototype.close = function () {
  var host = this.enabled('sandbox')
    ? APNS_SANDBOX
    : APNS_PROD;

  debug('closing gateway connection to %s:%d', host, APNS_PORT);
  this.connected = false;
  this.queue.pause();
  this.gateway.destroy();
};

Agent.prototype.queueIterator = function (buf, next) {
  if (!self.this || !this.connected) {
    debug('socket write queue pausing self');
    this.queue.pause()
    this.queue.push(buf);
    return next();
  }

  debug('writing message to socket');
  this.gateway.write(buf, function () {
    debug('writing message success');
    next();
  });
};
