/*!
 * apnagent - Feedback (Live)
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:feedback-live')
  , inherits = require('tea-inherits')
  , ms = require('tea-ms')
  , tls = require('tls');

/*!
 * Internal dependancies
 */

var Base = require('./base')
  , errors = require('../errors')
  , util = require('../util');

/*!
 * Primary Export
 */

module.exports = Feedback;

/**
 * Feedback (Live)
 *
 * A feedback connection will be opened on
 * on a schedule to check for devices that have
 * reported they are no longer capabable of
 * receiving push notifications.
 *
 * @api public
 */

function Feedback () {
  Base.call(this);
}

inherits(Feedback, Base);

Feedback.prototype.connect = function (cb) {
  cb = cb || function () {};

  var self = this
    , interval = this.get('interval')
    , opts = util.feedbackOptions(this)
    , feedback;

  // don't try to connect without credentials
  if (!opts.pfx && !opts.key && !opts.cert) {
    process.nextTick(function () {
      var err = new errors.FeedbackAuthorizationError('Insufficient credentials');
      debug('(feedback) error: %s', err.message);
      self.emit('feedback:error', err);
      cb(err);
    });

    return this;
  }

  // how to perform a reconnect
  function reconnect () {
    debug('(feedback) reconnecting');
    self.connect(function (err) {
      if (err) return;
      debug('(feedback) reconnected');
      self.emit('feedback:reconnect');
    });
  }

  // connect to feedback service
  feedback = tls.connect(opts, function () {
    if (feedback.authorized) {
      debug('(feedback) connected - %s:%d', opts.host, opts.port);
      self.connected = true;
      self.emit('feedback:connect');
      cb();
    } else {
      var err = new error.FeedbackAuthorizationError(gateway.authorizationError);
      debug('(feedback) unauthorized - %s:%d', opts.host, opts.port, gateway.authorizationError);
      self.feedback.destroy();
      self.emit('gateway:error', err);
      cb(err);
    }
  });

  // handle a disconnection (expected)
  feedback.on('close', function () {
    self.feedback = null;

    if (self.connected) {
      debug('(feedback) disconnected - %s:%d', opts.host, opts.port);
      self.connected = false;
      self.meta.timer = setTimeout(reconnect, ms(interval));
    } else {
      debug('(feedback) closed - %s:%d', opts.host, opts.port);
      self.connected = false;
      self.emit('feedback:close');
    }
  });

  // handle incoming data
  feedback.on('data', function (buf) {
    debug('(feedback) data: %d bytes', buf.length);
    self.decoder.write(buf);
  });

  // emit errors;
  feedback.on('error', function (err) {
    debug('(feedback) error: %s', err.message || 'Unspecified Error');
    self.emit('feedback:error', err);
  });

  // mount
  this.feedback = feedback;
  return this;
};

Feedback.prototype.close = function (cb) {
  cb = cb || function () {};

  // if not connected, cancel reconnect time
  if (!this.connected || !this.feedback) {
    clearTimeout(this.meta.timer);
    process.nextTick(cb);
    return this;
  }

  // wait for feedback to finish download
  this.feedback.once('end', cb);
  this.connected = false;
  return this;
};
