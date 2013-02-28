/*!
 * This example demonstrates apnagent's ability
 * to compensate for errors that occur during a
 * send cycle.
 */

/*!
 * Module dependencies
 */

var apnagent = require('..')
  , fs = require('fs')
  , join = require('path').join;

/*!
 * Load cert, key, and valid device
 */

var cert, key, device;

try {
  cert = fs.readFileSync(join(__dirname, '../test/certs/apnagent-cert.pem'));
  key = fs.readFileSync(join(__dirname, '../test/certs/apnagent-key-noenc.pem'));
  device = fs.readFileSync(join(__dirname, '../test/certs/device.txt'), 'utf8');
} catch (ex) {
  console.error('Error loading key/cert/device: %s', ex.message);
  process.exit(1);
}

/**
 * Construct Agent
 */

var agent = new apnagent.Agent();

/**
 * Provide settings
 */

agent
  .set('cert', cert)
  .set('key', key)
  .enable('sandbox');

/**
 * Listen for send errors
 */

agent.on('message:error', function (err, msg) {
  switch (err.name) {
    case 'GatewayMesssageError':
      console.log('  [emitted] gw notification error: %s', err.message);
      if (err.code === 8) {
        console.log('    > %s', msg.device().toString());
      }
      break;
    case 'MessageSerializationError':
      console.log('  [emitted] serialization error: %s', err.message);
      break;
    default:
      console.log('  [emitted] other error: %s', err.message);
      break;
  }
});

/**
 * This message will error because the device is
 * not valid. It will invoke the `notification:error`
 * listener. The `.send()` callback will NOT have an error.
 */

agent.createMessage()
  .device('feedface')
  .alert('body', 'Hello Universe')
  .send(function (err) {
    if (err) console.log('  [cb] If you se me something went terribly wrong.');
  });

/**
 * This message will error because the custom variable
 * made this message way to long. This `.send()`
 * callback will include an error, but it will also
 * be emitted to `notification:error`.
 */

agent.createMessage()
  .device('facefeed')
  .set('custom', new Array(1000).join(' '))
  .send(function (err) {
    if (err) console.log('  [cb] serialization error: %s', err.message);
  });

/**
 * This message will NOT error because everything
 * is valid. If it emits a `notification:error` it
 * is likely because you don't have the client app
 * set up correctly or your not using a valid token.
 */

agent.createMessage()
  .device(device)
  .alert('body', 'Hello Universe')
  .send(function (err) {
    if (err) console.log('  [cb] If you se me something went terribly wrong.');
  });

/**
 * Start the service.
 */

agent.connect();
