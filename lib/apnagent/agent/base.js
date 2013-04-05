/*!
 * apnagent - Agent (Base)
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
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
 * ## Agent API
 *
 * This API section covers both the `Agent` and `MockAgent`
 * classes. The architecture was developed to provide
 * feature parity for not just available methods but the
 * events emitted and processing methodology. Any significant
 * differences have already been outlined in the Agent Guide.
 *
 * @header Agent API
 * @see #header-agent Agent Guide
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

  // start in paused state
  cache.pause();
  queue.pause();

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
  decoder = lotus.createDecoder();
  decoder.stream(8, codecs.getInterface('gateway response', 'decode'));

  // listen for responses
  decoder.stream(8).on('readable', function () {
    var obj = this.read();
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
  encoder = lotus.createEncoder();
  encoder.stream(0, codecs.getInterface('gateway simple', 'encode'));
  encoder.stream(1, codecs.getInterface('gateway enhanced', 'encode'));

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
 * ### .createMessage ([encoding])
 *
 * Creates a message that can be further modified
 * through chaining. Do not provide arguments unless
 * you know what you are doing.
 *
 * @param {String} encoding (default: utf8)
 * @return {Message} new message
 * @name create
 * @api public
 * @see #agent-messages Agent Guide - Sending Messages
 * @see #header-message_builder_api Message Builder API
 */

Base.prototype.createMessage = function (enc) {
  var codec = this.get('codec');
  return new Message(this, codec, { enc: enc });
};

/*!
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
 * ### .send (message[, callback])
 *
 * Serialize the message and catch any validation errors
 * that might occur. If validation passes add the message
 * to the send queue. Messages can also be sent by invoking
 * the message instance's `.send()` method.
 *
 * ```js
 * var message = agent.createMessage();
 *
 * message
 *   .device(token)
 *   .alert('Hello Universe');
 *
 * agent.send(message);
 * ```
 *
 * @param {Message} message to send
 * @param {Function} callback to invoke
 * @return {this} for chaining
 * @name send
 * @api public
 * @see #agent-messages Agent Guide - Sending Messages
 * @see #message_builder_api-send Message#send()
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
  this.queue.push({ codec: codec, json: json }, cb, true);
  return this;
};

Base.prototype._queueIterator = function (buf, next) {
  throw new Error('Queue iterator not implemented.');
};

/**
 * ### .connect ([ callback ])
 *
 * Open an active gateway connection. Once the connection
 * is established the outgoing message queue will begin
 * to process items.
 *
 * @param {Function} callback
 * @return {this} for chaining
 * @name connect
 * @api public
 */

Base.prototype.connect = function () {
  throw new Error('Gateway connect not implemented.');
};

/**
 * ### .close ([ callback ])
 *
 * Close the active gateway connection or cancel
 * further reconnect attempts. If the queue is currently
 * processing a message it will wait for the current
 * message to finish before closing.
 *
 * Apple recommends that a connection always remains open
 * even when there are no messages to process. Production
 * deployments should use this sparingly.
 *
 * @param {Function} callback
 * @return {this} for chaining
 * @name close
 * @api public
 */

Base.prototype.close = function () {
  throw new Error('Gateway close not implemented');
};
