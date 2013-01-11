/*!
 * apnagent - Agent Constructor
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * External module dependancies
 */

var debug = require('sherlock')('apnagent:agent')
  , EventEmitter = require('drip').EnhancedEmitter
  , facet = require('facet')
  , Queue = require('breeze-queue')
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

module.exports = Agent;

/**
 * Agent (constrcutor)
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

function Agent () {
  EventEmitter.call(this, { delimeter: '::' });
  this.disable('sandbox');
  this.set('codec', 'simple');

  this.socket = null;
  this.queue = [];
}

/*!
 * Inherits from EVentEmitter
 */

util.inherits(Agent, EventEmitter);

/*!
 * Mount facet helpers
 */

facet(Agent);

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
  var self = this
    , cert = [ 'key', 'cert', 'ca' ]
    , opts = {}
    , socket;

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
    cert.forEach(copy);
  }

  socket = tls.connect(opts, function (cts) {
    if (cts.authorized) {
      debug('secure connection established to %s:%d', opts.host, opts.port);
      self.connected = true;
      self.queue.process();
      cb();
    } else {
      debug('secure connection denied to %s:%d', opts.host, opts.port);
      self.socket = null;
      cb(cls.authorizationError);
    }
  });

  socket.on('close', function () {
    debug('secure connection closed to %s:%d', opts.host, opts.port);
    self.connected = false;
    self.socket = null;
    self.queue.pause();
  });

  this.socket = socket;
};

/**
 * .create ()
 *
 * Creates a message that can be further modified
 * through chaining.
 *
 * @param {String} codec (simple or enhanced)
 * @param {String} encoding (default: utf8)
 * @name create
 * @api public
 */

Agent.prototype.create = function (codec, enc) {
  codec = codec || this.get('codec');
  return new Message(this, codec, enc);
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

Agent.prototype.send = function (msg, cb) {
  this.queue.push({ msg: msg, cb: cb }, this.connected);
  return this;
};

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
