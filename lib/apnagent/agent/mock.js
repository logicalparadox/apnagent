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
    , opts = util.gatewayOptions(this)
    , gateway;

  debug('mock gateway initializing');
  this.gatewayOpts = opts;

  // mock gateway parses the outgoing buffers back to json
  gateway = lotus.createReaderStream();
  gateway.use(0, codecs.getInterface('gateway simple', 'reader'));
  gateway.use(1, codecs.getInterface('gateway enhanced', 'reader'));

  // data event is emitted for each message
  gateway.on('data', function (json) {
    debug('mock gateway incoming message', json);
    self.emit([ 'mock', 'message' ], json);
  });

  // an error is emitted when an incoming message is badly formatted
  gateway.on('error', function (err) {
    debug('mock gateway "socket" error: %s', err.message || 'Unspecified Error');
    self.emit([ 'gateway', 'error' ], err);
  });

  // end is similiar to a socket `close` event
  gateway.on('end', function () {
    self.queue.pause();
    self.gatewayOpts = null;
    self.gateway = null;

    // if user DID trigger disconnect or reconnect disabled
    if (!self.connected || !self.enabled('reconnect')) {
      debug('mock gateway connection closed');
      self.emit([ 'gateway', 'close' ]);
    }

    // if user DID NOT trigger disconnect
    else if (self.connected && self.enabled('reconnect')) {
      debug('mock gateway connection unexpectedly closed');
      setTimeout(function () {
        debug('mock gateway triggering reconnect');
        self.connect(function () {
          debug('mock gateway reconnected successful');
          self.emit([ 'gateway', 'reconnect' ], null, null);
        });
      }, self.get('reconnect delay'));
    }

    self.connected = false;
  });

  // simulate async connect
  process.nextTick(function () {
    debug('mock gateway connection established');
    self.connected = true;
    self.queue.resume();
    self.emit([ 'gateway', 'connect' ], null, null);
    cb();
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

Mock.prototype.close = function () {
  debug('closing mock gateway connection');
  this.connected = false;
  this.queue.pause();
  this.gateway.end();
};

Mock.prototype.queueIterator = function (buf, next) {
  if (!this.gateway || !this.connected) {
    debug('mock write queue pausing self');
    this.queue.pause()
    this.queue.push(buf);
    return next();
  }

  debug('writing message to mock gateway');
  this.gateway.write(buf);
  debug('writing message success');
  process.nextTick(next); // make async
};
