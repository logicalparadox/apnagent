

var debug = require('sherlock')('apnagent:feedbock-mock')
  , inherits = require('tea-inherits');

var Base = require('./base')
  , codecs = require('../codecs')
  , errors = require('../errors');

module.exports = Mock;

function Mock () {
  Base.call(this);
}

inherits(Mock, Base);
