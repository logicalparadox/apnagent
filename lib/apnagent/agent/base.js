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
 * ## Agent / MockAgent API
 *
 * #### Gateway Component
 *
 * The gateway component represents the connection to the
 * Apple Push Notification service. For the live agent it
 * is a TLS socket and for the mock agent it is a writable
 * stream.
 *
 * #### Queue Component
 *
 * The queue component stores outgoing messages until the socket is
 * ready to written. Messages are serialized before being placed in
 * the queue.
 *
 * #### Cache Component
 *
 * The cache component maintains a limited ordered history of all outgoing messages
 * should they need to be resent. If the APN service deems a message invalid
 * it will not process any further message, respond with the unique ID and error
 * code for the message that failed, then disconnect. The agent will use
 * the cache to requeue messages that were sent after the failed message.
 *
 * To control memmory usage the cache employs a time-to-live (ttl) mechanism
 * to remove items which are beyond a certain age and are therefor have
 * presumably been processed by apple.
 *
 * @header Agent & MockAgent API
 */

/**
 * ### Settings
 *
 * Settings can be modified using `.set()`, `.enable()`, or `.disable()`
 * and are chainable. For example:
 *
 * ```js
 * agent
 *   .set('cert file', join(__dirname, 'certs/cert.pem'))
 *   .set('key file', join(__dirname, 'certs/key.pem'))
 *   .enable('sandbox');
 * ```
 *
 * #### All Available Settings
 *
 * - **key**, **cert**, **ca**, **pfx** _{Buffer}_ - set the raw security
 * credentials for connect to the APN service. These options are ignored
 * by the `MockAgent`.
 *
 * - **key file**, **cert file**, **ca file**, **pfx file** _{String}_ - an
 * alternative method to set security credentials for the APN service
 * connection by filename. Must use full path. These options are ignored
 * by the `MockAgent`.
 *
 * - **passphrase** _{String}_ - for use with certificates if they are secured
 * with a password. This option ignored by `MockAgent`.
 *
 * - **sandbox** _{Boolean}_ - should agent connect to the APN sandbox
 * environment (default _false_). This option is ignored by the `MockAgent`.
 *
 * - **reconnect** _{Boolean}_ - should agent reconnect on disconnect
 * (default _true_). This should always be enabled for production
 * environments.
 *
 * - **reconnect delay** _{Number|String}_ - milliseconds after a disconnect
 * that a reconnect should be attempted (default: `3s`).
 *
 * - **cache ttl** _{Number|String}_ - time elapsed for a message where
 * it should be considered successfully parsed by the APN service (default:
 * `10m`).
 *
 * @name Settings
 */

/**
 * ### Events
 *
 * - **gateway:connect** - emitted every time a gateway connection
 * is established. Since Apple closes the connection when it
 * cannot process a message, this event may be emitted numerous
 * times in an applications life-cycle.
 *
 * - **gateway:reconnect** - emitted after a connection has been
 * re-established after Apple had forcefully closed the connection.
 * May be emitted numerous times in an application's life-cycle.
 *
 * - **gateway:error (err)** - emitted if there is a client-side error with
 * gateway. This includes authorization errors or TLS socket errors.
 * An authorization error will be an instance of
 * `apnagent.errors.GatewayAuthorizationError`.
 *
 * - **message:error (err)** - emitted if Apple deems a message malformed for
 * any given reason or if apnagent has an issues serialization an
 * outgoing message.
 *
 * - **queue:flush** - emitted when the queue has finished processessing
 * all stored messages. May be emitted numerous times in the application's
 * life-cycle.
 *
 * @name Events
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
