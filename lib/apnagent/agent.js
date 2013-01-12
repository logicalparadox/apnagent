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
  , lotus = require('lotus')
  , Queue = require('breeze-queue')
  , tls = require('tls')
  , util = require('util');

/*!
 * Internal module dependancies
 */

var codecs = require('./codecs')
  , Message = require('./message')

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
  var self = this
    , outgoing = lotus.createWriterStream()
    , queue;

  EventEmitter.call(this, { delimeter: '::' });

  this.connected = false;
  this.disable('sandbox');
  this.set('codec', 'simple');

  queue = new Queue(function (buf, next) {
    if (!self.socket || !self.connected) {
      debug('socket write queue pausing self');
      queue.pause()
      queue.push(buf);
      return next();
    }

    debug('writing message to socket');
    self.socket.write(buf, function () {
      debug('writing message success');
      next();
    });
  }, 1);

  outgoing.use(0, codecs.simple.writer);
  outgoing.use(1, codecs.enhanced.writer);
  outgoing.on('data', function (buf) {
    debug('pushing message to send queue');
    queue.push(buf, self.connected);
  });

  this.outgoing = outgoing;
  this.queue = queue;
  this.socket = null;
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
    [ 'key', 'cert', 'ca' ].forEach(copy);
  }

  // convert CA to array
  if (opts.ca) {
    opts.ca = [ opts.ca ];
  }

  debug('initializing connection to %s:%d', opts.host, opts.port);

  // connect to tls service using opts
  socket = tls.connect(opts, function () {
    if (socket.authorized) {
      debug('secure connection established to %s:%d', opts.host, opts.port);
      self.connected = true;
      self.queue.resume();
      cb();
    } else {
      debug('secure connection denied to %s:%d', opts.host, opts.port);
      self.socket = null;
      cb(new Error(socket.authorizationError));
    }
  });

  // handle a disconnection
  socket.on('close', function () {
    debug('secure connection closed to %s:%d', opts.host, opts.port);
    self.connected = false;
    self.socket = null;
    self.queue.pause();
  });

  socket.on('error', function (err) {
    throw err;
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
  var self = this
    , codecStr = msg.meta.codec
    , codecMap = {
          simple: 0
        , enhanced: 1
      }
    , codec, json;

  function returnError (err) {
    process.nextTick(function () {
      debug('send message failed: %s', err.message);
      cb(err);
    });

    return self;
  }

  try {
    json = msg.serialize();
  } catch (ex) {
    return returnError(ex);
  }

  codec = codecMap[codecStr];

  if ('undefined' === typeof codec) {
    return returnError(new Error('Invalid codec'));
  }

  this.outgoing.write(codec, json);
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
