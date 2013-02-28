/*!
 * This example demonstrates apnagent's ability
 * to connect to the feedback service.
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

var cert, key;

try {
  cert = fs.readFileSync(join(__dirname, '../test/certs/apnagent-cert.pem'));
  key = fs.readFileSync(join(__dirname, '../test/certs/apnagent-key-noenc.pem'));
  device = fs.readFileSync(join(__dirname, '../test/certs/device.txt'), 'utf8');
} catch (ex) {
  console.error('Error loading key/cert/device: %s', ex.message);
  process.exit(1);
}

/**
 * Construct Feedback
 */

var feedback = new apnagent.Feedback();

/**
 * Provide settings
 */

feedback
  .set('cert', cert)
  .set('key', key)
  .enable('sandbox');

feedback.connect();

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

agent.on('notification:error', function (err, msg) {
  switch (err.name) {
    case 'GatewayNotificationError':
      console.log('  [emitted] notification error: %s', err.message);
      if (err.code === 8) {
        console.log('    > %s', msg.device().toString());
      }
      break;
    case 'SerializationError':
      console.log('  [emitted] serialization error: %s', err.message);
      break;
    default:
      console.log('  [emitted] other error: %s', err.message);
      break;
  }
});

/**
 * In order to trigger the feedback, we need to send a
 * message to a device that did have our application
 * installed but no longer does.
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
