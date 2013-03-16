/*!
 * This example demonstrates apnagent's ability
 * to connect to [mock] apn gateway and send messages.
 *
 * This example does NOT require certificates or a valid device.
 */

/*!
 * Module dependencies
 */

var apnagent = require('..');

/**
 * Construct Agent
 */

var agent = new apnagent.MockAgent();

/**
 * Provide settings
 */

agent.connect(function (err) {
  if (err) throw err; // this shouldn't happen
  console.log('[mock] gateway connected');
});

/**
 * Mock Only: Log messages that have been sent.
 */

agent.on('mock:message', function (raw) {
  var device = new apnagent.Device(raw.deviceToken);
  console.log('');
  console.log('==> %d - %s', raw.identifier, device.toString());
  console.log(JSON.stringify(raw.payload, null, 2));
});

/**
 * Listen for send errors
 */

agent.on('message:error', function (err, msg) {
  switch (err.name) {
    case 'GatewayMesssageError':
      console.log('[emitted] gw notification error: %s', err.message);
      if (err.code === 8) {
        console.log('    > %s', msg.device().toString());
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
 * Unlike the live counterpart, `feedface` is a valid token.
 * Therefor, this message will simulate a send.
 */

agent.createMessage()
  .device('feedface00')
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
  .device('feedface01')
  .set('custom', new Array(1000).join(' '))
  .send(function (err) {
    if (err) console.log('[cb] serialization error: %s', err.message);
  });

/**
 * This message will NOT error because everything is valid.
 */

agent.createMessage()
  .device('feedface02')
  .alert('body', 'Hello Universe')
  .badge(3)
  .send(function (err) {
    if (err) console.log('[cb] If you se me something went terribly wrong.');
  });
