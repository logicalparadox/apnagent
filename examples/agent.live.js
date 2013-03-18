/*!
 * This example demonstrates apnagent's ability
 * to connect to the apn gateway and send messages.
 *
 * This examples requires certificates and a valid device.
 */

/*!
 * Module dependencies
 */

var apnagent = require('..')
  , settings = require('./_header')
    , auth = settings.auth
    , device = settings.device;

/**
 * Construct Agent
 */

var agent = new apnagent.Agent();

/**
 * Provide settings
 */

agent
.set(auth)
.enable('sandbox')
.connect(function (err) {
  if (err && 'GatewayAuthorizationError' === err.name) {
    console.log('%s: %s', err.name, err.message);
    process.exit(1);
  } else if (err) {
    throw err;
  } else {
    console.log('gateway connected');
  }
});

/**
 * Listen for send errors
 */

agent.on('message:error', function (err, msg) {
  switch (err.name) {
    case 'GatewayMessageError':
      console.log('[emitted] gw notification error: %s', err.message);
      if (err.code === 8) {
        console.log('  > %s', msg.device().toString());
      }
      break;
    case 'MessageSerializationError':
      console.log('[emitted] serialization error: %s', err.message);
      break;
    default:
      console.log('[emitted] other error: %s', err.message);
      break;
  }
});

/**
 * This message will error because the device is
 * not valid. It will invoke the `message:error`
 * listener. The `.send()` callback will NOT have an error.
 */

agent.createMessage()
  .device('feedface')
  .alert('body', 'Hello Universe')
  .send(function (err) {
    if (err) console.log('[cb] If you se me something went terribly wrong.');
  });

/**
 * This message will error because the custom variable
 * made this message way to long. This `.send()`
 * callback will include an error, but it will also
 * be emitted to `notification:error`.
 */

agent.createMessage()
  .device(device)
  .set('custom', new Array(1000).join(' '))
  .send(function (err) {
    if (err) console.log('[cb] serialization error: %s', err.message);
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
  .badge(3)
  .send(function (err) {
    if (err) console.log('[cb] If you se me something went terribly wrong.');
  });
