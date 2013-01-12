/*!
 * apnagent - Agent
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:agent')
  , EventEmitter = require('drip').EnhancedEmitter
  , facet = require('facet')
  , lotus = require('lotus')
  , Queue = require('breeze-queue')
  , tls = require('tls')
  , util = require('util');

/*!
 * Internal dependancies
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
 * Agent
 *
 * The agent keeps a constant connection with
 * the apn service. All messages are pass through
 * its open stream. It will manage reconnections
 * and authentication.
 *
 * TODO: reconnections
 *
 * See APNS Documentation
 *
 * @api public
 */

function Agent () {
  var self = this
    , outgoing
    , queue;

  EventEmitter.call(this, { delimeter: '::' });

  // configuration
  this.connected = false;
  this.disable('sandbox');
  this.set('codec', 'simple');

  // queue handles writing of already packaged buffers to gateway
  queue = new Queue(function (buf, next) {
    if (!self.gateway || !self.connected) {
      debug('socket write queue pausing self');
      queue.pause()
      queue.push(buf);
      return next();
    }

    debug('writing message to socket');
    self.gateway.write(buf, function () {
      debug('writing message success');
      next();
    });
  }, 1);

  // outgoing handles converting msg json to buffers
  outgoing = lotus.createWriterStream();
  outgoing.use(0, codecs.getInterface('gateway simple', 'writer'));
  outgoing.use(1, codecs.getInterface('gateway enhanced', 'writer'));
  outgoing.on('data', function (buf) {
    debug('pushing message to send queue');
    queue.push(buf, self.connected);
  });

  // attach objects
  this.outgoing = outgoing;
  this.queue = queue;
  this.gateway = null;
}

/*!
 * Inherits from EnhancedEmitter
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

  // convert CA to array
  copy('ca');
  if (opts.ca) opts.ca = [ opts.ca ];

  debug('initializing connection to %s:%d', opts.host, opts.port);

  // connect to tls service using opts
  gateway = tls.connect(opts, function () {
    if (gateway.authorized) {
      debug('secure connection established to %s:%d', opts.host, opts.port);
      self.connected = true;
      self.queue.resume();
      cb();
    } else {
      debug('secure connection denied to %s:%d', opts.host, opts.port);
      self.gateway.close();
      cb(new Error(gateway.authorizationError));
    }
  });

  // handle a disconnection
  gateway.on('close', function () {
    debug('secure connection closed to %s:%d', opts.host, opts.port);
    self.queue.pause();
    self.connected = false;
    self.gateway = null;
  });

  gateway.on('error', function (err) {
    throw err;
  });

  this.gateway = gateway;
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
  cb = cb || function () {};

  var self = this
    , codecStr = msg.meta.codec
    , codec = codecs.getId('gateway ' + codecStr)
    , json;

  // handle error
  function callback (err) {
    process.nextTick(function () {
      debug('serialize message failed: %s', err.message);
      cb(err);
    });
  }

  // check for codec
  if ('undefined' === typeof codec) {
    callback(new Error('Invalid codec'));
    return this;
  }

  // serialize the message
  try {
    json = msg.serialize();
  } catch (ex) {
    callback(ex);
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
