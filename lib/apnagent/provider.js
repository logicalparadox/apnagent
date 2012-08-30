var EventEmitter = require('events').EventEmitter
  , tls = require('tls')
  , util = require('util');

var codec = require('./codec');

var APNS_PORT = 2196
  , APNS_PROD = 'gateway.push.apple.com'
  , APNS_SANDBOX = 'gateway.sandbox.push.apple.com';

module.exports = Provider;

function Provider () {
  EventEmitter.call(this);
  this.codec = null;
  this.connected = false;
  this.queue = [];
  this.settings = {};
  this.disable('sandbox');
  this.set('codec', 'simple');
}

util.inherits(Provider, EventEmitter);

Provider.prototype.set = function (key, value) {
  if (1 === arguments.length) {
    for (var name in key) {
      this.settings[name] = key[name];
    }
  } else {
    this.settings[key] = value;
  }

  return this;
};

Provider.prototype.get = function (key) {
  return this.settings[key];
};

Provider.prototype.enable = function (key) {
  return this.set(key, true);
};

Provider.prototype.disable = function (key) {
  return this.set(key, false);
};

Provider.prototype.enabled = function (key) {
  return !! this.get(key);
};

Provider.prototype.disabled = function (key) {
  return ! this.get(key);
};

Provider.prototype.connect = function (cb) {
  if (this.connected) return cb(new Error('Cannot connect more than once.'));
  var opts = buildOptions.call(this);
  this.socket = tls.connect(opts);
  this.socket.on('secureConnect', connectHandler.call(this, cb));
  this.socket.on('error', errorHandler.bind(this));
};

Provider.prototype.create = function () {

};

Provider.prototype.send = function (msg) {
  if (!this.connected) {
    this.queue.push(msg);
  } else {
    writeItem.call(this, msg);
  }
};

function buildOptions () {
  var opts = {
      // get the tls host based on sandbox
      host: (this.enabled('sandbox')
        ? APNS_SANDBOX
        : APNS_PROD)
      // use default port
    , port: APNS_PORT
      // do our key/cert/ca || pfx require a passphrase
    , passphrase: this.get('passphrase') || null
  }

  // get our tls certificates
  if (this.get('pfx')) {
    opts.pfx = this.get('pfx');
  } else {
    [ 'key', 'cert', 'ca' ].forEach(function (name) {
      if (this.get(name)) {
        opts[name] = this.get(name);
      }
    });
  }

  return opts;
}

function connectHandler (cb) {
  var self = this;
  return function handle () {
    self.codec = codec.byName(self.get('codec'));
    self.queue.forEach(writeMessage.bind(self));
    self.connected = true;
    self.emit('connect');
    cb();
  }
}

function errorHandler (err) {
  this.emit('error', err);
}

function writeMessage (msg) {
  var buf = this.codec.encode(msg);
  this.socket.write(buf);
}
