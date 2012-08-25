/*!
 * apnagent - Utilities
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * .merge (a, b)
 *
 * Merge one object to another. The `a`
 * object will be overwritten and returned.
 *
 * Internal use only.
 *
 * @param {Object} a
 * @param {Object} b
 * @api private
 */

exports.merge = function (a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};
