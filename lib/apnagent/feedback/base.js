/*!
 * apnagent - Feedback (Base)
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:feedback-base')
  , EventEmitter = require('drip').EnhancedEmitter
  , facet = require('facet')
  , inherits = require('tea-inherits')
  , lotus = require('lotus')
  , Queue = require('breeze-queue')
  , series = require('breeze-async').forEachSeries;

/*!
 * Internal dependancies
 */

var codecs = require('../codecs')
  , Device = require('../device')
  , errors = require('../errors');

/*!
 * Primary Export
 */

module.exports = Base;

/**
 * ## Feedback API
 *
 * This is the feedback api.
 *
 * @header Feedback API
 * @see #header-feedback Feedback Guide
 */

function Base () {
  EventEmitter.call(this, { delimeter: ':' });
  this.connected = false;
  this.set('interval', '30m');
  this.disable('sandbox');

  this.meta = {};
  this.meta.timer = null;
  this.meta.stack = [ emit ];

  var self = this
    , decoder, queue;

  // queue handles user interaction with responses
  queue = new Queue(function (obj, done) {
    var device = obj.device
      , stack = self.meta.stack
      , timestamp = obj.timestamp;

    // intercept errors so as not to cancel queue
    function finish (err) {
      if (err) {
        debug('(iterate) error - %s', err.message);
        self.emit('iterate:error', err, device, timestamp);
      }

      debug('(iterate) end - %s', device.toString());
      done();
    }

    // start iteration
    debug('(iterate) start - %s', device.toString());
    series(stack, function (fn, next) {
      fn.apply(self, [ device, timestamp, next ]);
    }, finish);
  }, 10);

  // emit queue errors on feedback agent
  queue.onerror = function (err) {
    debug('(queue) error: %s', err.message);
    self.emit('queue:error', err);
  };

  // emit queue drain on feedback agent
  queue.drain = function () {
    debug('(queue) drain');
    self.emit('queue:drain');
  };

  // decoder handing incoming feedback responses
  decoder = lotus.createDecoder();
  decoder.stream(codecs.getInterface('feedback response', 'decode'));
  decoder.stream().on('readable', function () {
    var obj = this.read()
      , res = {};
    res.device = new Device(obj.deviceToken);
    res.timestamp = new Date(obj.timestamp * 1000);
    queue.push(res, true);
  });

  this.decoder = decoder;
  this.feedback = null;
  this.queue = queue;
}

/*!
 * Inherits from EnhancedEmitter
 */

inherits(Base, EventEmitter);

/*!
 * Mount facet helpers
 */

facet(Base.prototype, function (key, value) {
  key = key.toLowerCase();

  // handle queue concurrency change
  if (key === 'concurrency') {
    if ('number' !== typeof value) {
      throw new Error('.set(\'concurrency\') fail: value must be a number');
    }

    if (value <= 0) {
      throw new Error('.set(\'concurrency\') fail: value must be greater than zero');
    }

    this.queue._concurrency = value;
  }
});

Object.defineProperty(Base.prototype, 'length', {
  get: function () {
    return this.queue.length;
  }
});

/**
 * ### .use (fn)
 *
 * @param {Function} fn to add to stack
 * @name use
 * @api public
 */

Base.prototype.use = function (fn) {
  this.meta.stack.push(fn);
  return this;
};

Base.prototype.unsub = function () {};

/**
 * ### .connect ([ callback ])
 *
 *
 * @param {Function} callback
 * @return {this} for chaining
 * @name connect
 * @api public
 */

Base.prototype.connect = function () {
  throw new Error('Feedback connect not implemented.');
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
  throw new Error('Feedback close not implemented.');
};

function emit (device, timestamp, next) {
  debug('(feedback) device - %s', device.toString());
  this.emit('device', device, timestamp);
  next();
}
