/*!
 * This example demonstrates apnagent's ability
 * to construct a mock feedback service.
 */

/*!
 * Module dependencies
 */

var apnagent = require('..');

/**
 * Construct Feedback
 */

var feedback = new apnagent.MockFeedback();

/**
 * Provide settings and connect
 */

feedback
.set('interval', '10s')
.set('concurrency', 1)
.connect(function () {
  console.log('[mock] feedback running');
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

/**
 * Simulate unsubscribe for you device.
 */

setTimeout(function () {
  feedback.unsub('feedface00');
  feedback.unsub('feedface01');
}, 1500);
