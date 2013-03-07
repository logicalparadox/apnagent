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

var Cache = require('../cache')
  , codecs = require('../codecs')
  , errors = require('../errors')
  , Message = require('../message');

/*!
 * Constants
 */

// max unique ids
var INT32 = 0xffffffff;

// Apple notification error messages
var notifErrors = {
    0: 'No errors encountered'
  , 1: 'Processing error'
  , 2: 'Missing device token'
  , 3: 'Missing topic'
  , 4: 'Missing payload'
  , 5: 'Invalid token size'
  , 6: 'Invalid topic size'
  , 7: 'Invalid payload size'
  , 8: 'Invalid token'
  , 255: 'None (unknown)'
};

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
  EventEmitter.call(this, { delimeter: ':' });
  this.connected = false;

  // default settings
  this.set('cache ttl', '10m');
  this.set('codec', 'enhanced');
  this.set('expires', 0);
  this.enable('reconnect');
  this.set('reconnect delay', 3000);
  this.disable('sandbox');

  // internal storage
  this.meta = {};
  this.meta.lastId = -1;
  this.meta.gatewayError = null;
  this.meta.timer = null;

  var self = this
    , cache, decoder, encoder, queue;

  // temp storage for messages
  cache = new Cache();

  // queue handles writing buffers to gateway
  queue = new Queue(function () {
    debug('(queue) iterate');
    self._queueIterator.apply(self, arguments);
  }, 1);

  // emit queue errors on agent
  queue.onerror = function (err) {
    debug('(queue) error: %s', err.message);
    self.emit('queue:error', err);
  };

  // emit queue drain on agent
  queue.drain = function () {
    debug('(queue) drain');
    self.emit('queue:drain');
  };

  // decoder handles incoming apn errors
  decoder = lotus.createReaderStream();
  decoder.use(8, codecs.getInterface('gateway response', 'reader'));
  decoder.on('data', function (obj) {
    obj.code = obj.code[0];
    var message = notifErrors[obj.code] || 'None (unknown)'
      , err = new errors.GatewayMessageError(message, obj)
      , cached = self.cache.get(obj.identifier)
      , msg = null;

    if (cached) {
      msg = new Message(self, 'enhanced', cached.json.payload);
      msg.device(cached.json.deviceToken);
      msg.meta.expires = cached.json.expiration;
    }

    debug('(message) error: %s', err.message);
    self.meta.gatewayError = err;
    self.emit('message:error', err, msg);
  });

  // encoder handles converting msg json to buffers
  encoder = lotus.createWriterStream();
  encoder.use(0, codecs.getInterface('gateway simple', 'writer'));
  encoder.use(1, codecs.getInterface('gateway enhanced', 'writer'));

  // mount objects
  this.cache = cache;
  this.decoder = decoder;
  this.encoder = encoder;
  this.gateway = null;
  this.queue = queue;
}

/*!
 * Inherits from EnhancedEmitter
 */

inherits(Base, EventEmitter);

/*!
 * Mount facet helpers
 */

facet(Base.prototype);

/**
 * .create ()
 *
 * Creates a message that can be further modified
 * through chaining.
 *
 * @param {String} encoding (default: utf8)
 * @param {String} codec (simple or enhanced)
 * @name create
 * @api public
 */

Base.prototype.createMessage = function (enc, codec) {
  codec = codec || this.get('codec');
  return new Message(this, codec, { enc: enc });
};

/**
 * .nextId ()
 *
 * Increment the `lastId` used and return the new
 * value. This will be called when a message is
 * created with an agent attached.
 *
 * Since apple requires ids to be int32 compatible,
 * if the last id exceeds 4294967296, it will be
 * reset at zero.
 *
 * @return {Number}
 * @api private
 */

Base.prototype.nextId = function () {
  var i = ++this.meta.lastId;

  if (i > INT32) {
    i = this.meta.lastId = 0;
  }

  return i;
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
      debug('(message) error: %s', err.message);
      cb(err);
      self.emit('message:error', err, msg);
    });
  }

  // check for codec
  if (!~[ 0, 1 ].indexOf(codec)) {
    error(new errors.SerializationError('Invalid codec: ' + codecStr));
    return this;
  }

  // serialize the message
  try {
    json = msg.serialize();
  } catch (ex) {
    error(ex);
    return this;
  }

  // write json to to the queue
  debug('(queue) push: %d', json.identifier);
  this.queue.push({ codec: codec, json: json }, cb);
  return this;
};

Base.prototype.queueIterator = function (buf, next) {
  throw new Error('Queue iterator not implemented.');
};

Base.prototype.connect = function (cb) {
  throw new Error('Gateway connect not implemented.');
};

Base.prototype.close = function () {
  throw new Error('Gateway close not implemented');
};
