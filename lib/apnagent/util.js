/*!
 * apnagent - util
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * Trim a string to a specific length. It is
 * expected that the string is longer than len.
 *
 * @param {String} string to trim
 * @param {Number} number of characters to include.
 * @return {String}
 * @api public
 */

exports.trim = function (str, len) {
  var res = str.substr(0, len - 3);
  res = res.substr(0, Math.min(res.length, res.lastIndexOf(' ')));
  return res + '...';
};
