/*!
 * apnagent - Errors
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var error = require('tea-error');

/*!
 * Errors Collection
 */

var errs = [
    'GatewayAuthorizationError'
  , 'GatewayNotificationError'
  , 'SerializationError'
];

/*!
 * Mount to exports
 */

errs.forEach(function (err) {
  exports[err] = error(err);
});
