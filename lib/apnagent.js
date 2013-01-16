/*!
 * apnagent - Message Constructor
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * APN Agent version
 */

exports.version = '0.3.0';

/*!
 * Agent (Live)
 */

exports.Agent = require('./apnagent/agent/live');

/*!
 * Agent (Mock)
 */

exports.MockAgent = require('./apnagent/agent/mock');

/*!
 * Errors
 */

exports.errors = require('./apnagent/errors');
