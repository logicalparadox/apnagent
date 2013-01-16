/*!
 * apnagent - util
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
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
  , APNS_SANDBOX = 'gateway.sandbox.push.apple.com';

/**
 * Trim a string to a specific length. It is
 * expected that the string is longer than len.
 *
 * @param {String} string to trim
 * @param {Number} number of characters to include.
 * @return {String}
 * @api public
 */

exports.trim = function (str, len) {
  var res = str.substr(0, len - 3);
  res = res.substr(0, Math.min(res.length, res.lastIndexOf(' ')));
  return res + '...';
};

exports.gatewayOptions = function (agent) {
  var opts = {};

  function copy (key) {
    if (agent.get(key)) opts[key] = agent.get(key);
  }

  function read (file) {
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file);
  }

  // get the tls host based on sandbox
  opts.host = agent.enabled('sandbox')
    ? APNS_SANDBOX
    : APNS_PROD;

  // use default port
  opts.port = APNS_PORT;

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
}
