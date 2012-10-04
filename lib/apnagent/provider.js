/*!
 * apnagent - Provider Constructor
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * External module dependancies
 */

var EventEmitter = require('events').EventEmitter
  , facet = require('facet')
  , tls = require('tls')
  , util = require('util');

/*!
 * Internal module dependancies
 */

var Message = require('./message');

/*!
 * APN Service Constants
 */

var APNS_PORT = 2196
  , APNS_PROD = 'gateway.push.apple.com'
  , APNS_SANDBOX = 'gateway.sandbox.push.apple.com';

/*!
 * Primary Export
 */

module.exports = Provider;

/**
 * Provider (constrcutor)
 *
 * The provier keeps a constant connection with
 * the apn service. All messages are pass through
 * its open stream. It will manage reconnections
 * and authentication.
 *
 * See APNS Documentation
 *
 * @api public
 */

function Provider () {
  EventEmitter.call(this);
  facet.init(this);
  this.codec = null;
  this.connected = false;
  this.queue = [];
  this.disable('sandbox');
  this.set('codec', 'simple');
}

/*!
 * Inherits from EVentEmitter
 */

util.inherits(Provider, EventEmitter);

/*!
 * Mount facet helpers
 */

facet.bind(Provider);

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

Provider.prototype.connect = function (cb) {
  if (this.connected) return cb(new Error('Cannot connect more than once.'));
  var opts = buildOptions.call(this);
  this.socket = tls.connect(opts);
  this.socket.on('secureConnect', connectHandler.call(this, cb));
  this.socket.on('error', errorHandler.bind(this));
};

/**
 * .create ()
 *
 * Creates a message that can be further modified
 * through chaining.
 *
 * @name create
 * @api public
 */

Provider.prototype.create = function (cdec) {
  var msg = new Message();
  if (cdec) msg.codec(cdec);
  return this;
};

/**
 * .send (message)
 *
 * If connected, convert a message to buffer and send
 * over the wire. If not currently connected, place
 * the message in a queue for later departure.
 *
 * @param {Object} apnsagent message
 * @name send
 * @api public
 */

Provider.prototype.send = function (msg) {
  if (!this.connected) {
    this.queue.push(msg);
  } else {
    writeItem.call(this, msg);
  }
};

/*!
 * buildOptions
 *
 * Examine the current setting of the provider
 * and provide an object that can be used as
 * the options for `tls.connect`.
 *
 * @returns {Object}
 * @api private
 */

function buildOptions () {
  var opts = {};

  // get the tls host based on sandbox
  opts.host = this.enabled('sandbox')
    ? APNS_SANDBOX
    : APNS_PROD;

  // use default port
  opts.port = APNS_PORT;

  // provide a passphrase
  if (this.get('passphrase')) {
    opts.passphrase = this.get('passphrase');
  }

  // get our tls certificates
  if (this.get('pfx')) {
    opts.pfx = this.get('pfx');
  } else {
    [ 'key', 'cert', 'ca' ].forEach(function (name) {
      if (this.get(name)) {
        opts[name] = this.get(name);
      }
    });
  }

  return opts;
}

/*!
 * connectHandler (callback)
 *
 * Retrun a function that can be used the the connect
 * handler upon tls connect.
 *
 * This handler will process the queue and emit
 * events.
 *
 * @param {Function} callback
 * @returns {Function} connection handler
 */

function connectHandler (cb) {
  var self = this;
  return function handle () {
    while (self.queue.length) {
      var msg = self.queue.shift();
      writeMessage.call(self, msg);
    }

    self.connected = true;
    self.emit('connect');
    cb();
  }
}

/*!
 * errorHandler (err)
 *
 * Error listener for connected tls socket.
 *
 * @param {Error} error being emitted
 * @api private
 */

function errorHandler (err) {
  this.emit('error', err);
}

/*!
 * writeMessage (msg)
 *
 * Given a messages codec, convert it to a buffer
 * and write it to the currently connected
 * TLS socket.
 *
 * @param {Message} apnsagent message
 * @api private
 */

function writeMessage (msg) {
  var mcdec = msg.meta.codec || this.get('codec')
    , encode = codec.byName(mcdec)
    , buf = encode(msg);
  this.socket.write(buf);
}
