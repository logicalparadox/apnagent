/*!
 * apnagent - Feedback (Base)
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
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
 * Feedback (Base)
 *
 * @api private
 */

function Base () {
  EventEmitter.call(this, { delimeter: ':' });
  this.connected = false;
  this.set('interval', '30s');
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
  decoder = lotus.createReaderStream();
  decoder.use(codecs.getInterface('feedback response', 'reader'));
  decoder.on('data', function (obj) {
    queue.push({
        device: new Device(obj.deviceToken)
      , timestamp: new Date(obj.timestamp * 1000)
    }, true);
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

facet(Base);

Object.defineProperty(Base.prototype, 'length', {
  get: function () {
    return this.queue.length;
  }
});

Base.prototype.use = function (fn) {
  this.meta.stack.push(fn);
  return this;
};

Base.prototype.unsub = function () {};

Base.prototype.connect = function () {
  throw new Error('Feedback connect not implemented.');
};

Base.prototype.close = function () {
  throw new Error('Feedback close not implemented.');
};

function emit (device, timestamp, next) {
  debug('(feedback) device - %s', device.toString());
  this.emit('device', device, timestamp);
  next();
}
