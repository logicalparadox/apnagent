/*!
 * apnagent - util
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module Dependencies
 */

var fs = require('fs');

/*!
 * APN Service Constants
 */

var APNS_PORT = 2195
  , APNS_PROD = 'gateway.push.apple.com'
  , APNS_SANDBOX = 'gateway.sandbox.push.apple.com'
  , FEED_PORT = 2196
  , FEED_PROD = 'feedback.push.apple.com'
  , FEED_SANDBOX = 'feedback.sandbox.push.apple.com';

/**
 * Trim a string to a specific bytes length. It is
 * expected that the string bytes is longer than len.
 *
 * @param {String} string to trim
 * @param {Number} number of bytes to include.
 * @return {String}
 * @api public
 */

exports.trim = function (str, len) {
  var origLen = Buffer.byteLength(str)
    , expLen = len - 3
    , words = str.split(' ')
    , res = words.shift();

  while (Buffer.byteLength(res + words[0]) < expLen - 2) {
    res += ' ' + words.shift();
  }
  return res + '...';
};

exports.gatewayOptions = function (agent) {
  var opts = {};

  // get the tls host based on sandbox
  opts.host = agent.enabled('sandbox')
    ? APNS_SANDBOX
    : APNS_PROD;

  // use default port
  opts.port = APNS_PORT;

  // pull in tls options
  exports.tlsOptions(agent, opts);

  return opts;
};

exports.feedbackOptions = function (agent) {
  var opts = {};

  // get the tls host based on sandbox
  opts.host = agent.enabled('sandbox')
    ? FEED_SANDBOX
    : FEED_PROD;

  // use default port
  opts.port = FEED_PORT;

  // pull in tls options
  exports.tlsOptions(agent, opts);

  return opts;
};

exports.tlsOptions = function (agent, opts) {
  opts = opts || {};

  function copy (key) {
    if (agent.get(key)) opts[key] = agent.get(key);
  }

  function read (file) {
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file);
  }

  // get our tls certificates
  if (agent.get('pfx') || agent.get('pfx file')) {
    opts.pfx = agent.get('pfx file')
      ? read(agent.get('pfx file'))
      : agent.get('pfx');
  } else {
    opts.key = agent.get('key file')
      ? read(agent.get('key file'))
      : agent.get('key');
    opts.cert = agent.get('cert file')
      ? read(agent.get('cert file'))
      : agent.get('cert');
  }

  // apply ca certificate
  if (agent.get('ca')) {
    copy('ca');
    opts.ca = [ opts.ca ];
  }

  // include passphrase
  copy('passphrase');

  return opts;
};
