/*!
 * apnagent
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * APN Agent version
 */

exports.version = '1.0.5';

/*!
 * Agent
 */

exports.Agent = require('./apnagent/agent/live');
exports.MockAgent = require('./apnagent/agent/mock');

/*!
 * Feedback
 */

exports.Feedback = require('./apnagent/feedback/live');
exports.MockFeedback = require('./apnagent/feedback/mock');

/*!
 * Tools
 */

exports.Device = require('./apnagent/device');
exports.errors = require('./apnagent/errors');
