
exports.trim = function (str, len) {
  var res = str.substr(0, len - 3);
  res = res.substr(0, Math.min(res.length, res.lastIndexOf(' ')));
  return res + '...';
};
