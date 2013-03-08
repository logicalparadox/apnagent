/*!
 * This example demonstrates apnagent's ability
 * to connect to the feedback service. Unless you
 * have feedback response waiting, it probably won't
 * do anything.
 *
 * To trigger a feedback event uninstall your application
 * from the device then send several notifications. It may
 * take some time for your device to show up on feedback.
 */

/*!
 * Module dependencies
 */

var apnagent = require('..')
  , auth = require('./_header').auth;

/**
 * Construct Feedback
 */

var feedback = new apnagent.Feedback();

/**
 * Provide settings and connect
 */

feedback
.set(auth)
.enable('sandbox')
.connect(function (err) {
  if (err && 'FeedbackAuthorizationError' === err.name) {
    console.log('%s: %s', err.name, err.message);
    process.exit(1);
  } else if (err) {
    throw err;
  } else {
    console.log('feedback running');
  }
});

/**
 * Provide first handle
 */

feedback.use(function (device, ts, next) {
  console.log('[feedback-1] %s', device.toString());
  setTimeout(next, 300);
});

/**
 * Provide second handle
 */

feedback.use(function (device, ts, next) {
  console.log('[feedback-2] %s', device.toString());
  setTimeout(next, 300);
});
