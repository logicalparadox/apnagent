/*!
 * apnagent
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * APN Agent version
 */

exports.version = '0.4.0';

/*!
 * Agent (Live)
 */

exports.Agent = require('./apnagent/agent/live');

/*!
 * Agent (Mock)
 */

exports.MockAgent = require('./apnagent/agent/mock');

/*!
 * Feedback (Live)
 */

exports.Feedback = require('./apnagent/feedback/live');

/*!
 * Feedback (Mock)
 */

exports.MockFeedback = require('./apnagent/feedback/mock');

/*!
 * Device
 */

exports.Device = require('./apnagent/device');

/*!
 * Errors
 */

exports.errors = require('./apnagent/errors');
