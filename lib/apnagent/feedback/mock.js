

var debug = require('sherlock')('apnagent:feedbock-mock')
  , inherits = require('tea-inherits')
  , ms = require('tea-ms')
  , lotus = require('lotus');

var Base = require('./base')
  , codecs = require('../codecs')
  , Device = require('../device')
  , errors = require('../errors')
  , util = require('../util');

module.exports = Mock;

function Mock () {
  Base.call(this);
  this.meta.outgoing = [];
}

inherits(Mock, Base);

Mock.prototype.connect = function (cb) {
  cb = cb || function () {};

  var self = this
    , interval = this.get('interval')
    , opts = util.feedbackOptions(this)
    , feedback;

  // how to perform a reconnect
  function reconnect () {
    debug('(feedback) reconnecting');
    self.connect(function (err) {
      if (err) return;
      debug('(feedback) reconnected');
      self.emit('feedback:reconnect');
    });
  }

  // mock feedback writes mock unsubs to decoder
  feedback = lotus.createEncoder();
  feedback.stream(codecs.getInterface('feedback response', 'encode'));

  // simulate async connect
  debug('(feedback) connecting - mock');
  process.nextTick(function () {
    debug('(feedback) connected - mock');
    self.connected = true;
    self.emit('feedback:connect');
    cb();

    // send simulated data
    setTimeout(function () {
      var outgoing = self.meta.outgoing
        , stream = feedback.stream()
        , line;

      debug('(mock) simulating [%d] unsubs', outgoing.length);
      while (outgoing.length) {
        line = outgoing.shift();
        debug('(mock) writing unsub - %s', line.deviceToken.toString('hex'));
        stream.write(line);
      }

      debug('(mock) writing complete');
      stream.end();
    }, 10);
  });

  // handle "incoming" data
  feedback.on('data', function (buf) {
    debug('(feedback) data: %d bytes, buf.length');
    self.decoder.write(buf);
  });

  // emit errors;
  feedback.on('error', function (err) {
    debug('(feedback) error: %s', err.message || 'Unspecified Error');
    self.emit('feedback:error', err);
  });

  // end is similiar to a socket `close` event
  feedback.on('end', function () {
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

  // mount
  this.feedback = feedback;
  return this;
};


Mock.prototype.unsub = function (token, ts) {
  var device = new Device(token)
    , timestamp;

  // figure out time
  if (ts && 'number' === typeof ts) {
    timestamp = ts;
  } else if (ts && 'string' === typeof ts) {
    timestamp = ms.unix(ts);
  } else if (ts && ts instanceof Date) {
    timestamp = ts.getTime() / 1000;
  } else {
    timestamp = ms.unix('-1s');
  }

  // add to outgoing queue
  this.meta.outgoing.push({
      deviceToken: device.toBuffer()
    , timestamp: timestamp
  });

  return this;
};

Mock.prototype.close = function (cb) {
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
