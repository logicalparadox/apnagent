/*!
 * apnagent - Agent (Base)
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:agent-base')
  , EventEmitter = require('drip').EnhancedEmitter
  , facet = require('facet')
  , inherits = require('tea-inherits')
  , lotus = require('lotus')
  , Queue = require('breeze-queue')

/*!
 * Internal dependancies
 */

var codecs = require('../codecs')
  , errors = require('../errors')
  , Message = require('../message');

/*!
 * Primary Export
 */

module.exports = Base;

/**
 * Agent (Base)
 *
 * @api private
 */

function Base () {
  var self = this
    , outgoing, queue;

  EventEmitter.call(this, { delimeter: ':' });

  // configuration
  this.connected = false;
  this.gatewayOpts = null;
  this.disable('sandbox');
  this.set('codec', 'simple');
  this.enable('reconnect');
  this.set('reconnect delay', 3000);

  // queue handles writing buffers to gateway
  queue = new Queue(this.queueIterator.bind(this), 1);

  // emit queue errors on agent
  queue.onerror = function (err) {
    debug('queue error: %s', err.message);
    self.emit([ 'queue', 'error' ], err);
  };

  // emit queue drain on agent
  queue.drain = function () {
    debug('queue has been drained');
    self.emit([ 'queue', 'drain' ]);
  };

  // outgoing handles converting msg json to buffers
  outgoing = lotus.createWriterStream();
  outgoing.use(0, codecs.getInterface('gateway simple', 'writer'));
  outgoing.use(1, codecs.getInterface('gateway enhanced', 'writer'));
  outgoing.on('data', function (buf) {
    debug('pushing message to send queue');
    self.queue.push(buf, self.connected);
  });

  // mount objects
  this.outgoing = outgoing;
  this.queue = queue;
  this.gateway = null;
}

/*!
 * Inherits from EnhancedEmitter
 */

inherits(Base, EventEmitter);

/*!
 * Mount facet helpers
 */

facet(Base);

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

Base.prototype.createMessage = function (codec, enc) {
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

Base.prototype.send = function (msg, cb) {
  cb = cb || function () {};

  var self = this
    , codecStr = msg.meta.codec
    , codec = codecs.getId('gateway ' + codecStr)
    , json;

  // handle error
  function error (err) {
    process.nextTick(function () {
      debug('serialize message failed: %s', err.message);
      cb(err);
    });
  }

  // check for codec
  if (!~[ 0, 1 ].indexOf(codec)) {
    error(new errors.SerializationError('Invalid codec: ' + codecStr, null, arguments.callee));
    return this;
  }

  // serialize the message
  try {
    json = msg.serialize();
  } catch (ex) {
    error(ex);
    return this;
  }

  // write json to outgoing codec stream
  process.nextTick(function () {
    debug('writing message to codec');
    self.outgoing.write(codec, json);
    cb();
  });

  return this;
};

Base.prototype.queueIterator = function (buf, next) {
  next(new Error('Queue iterator not implemented.'));
};

Base.prototype.connect = function (cb) {
  cb = cb || function () {};
  var err = new Error('Gateway connect not implemented.');
  this.emit([ 'gateway', 'error' ], err);
  cb(err);
};

Base.prototype.close = function () {
  throw new Error('Gateway close not implemented');
};
