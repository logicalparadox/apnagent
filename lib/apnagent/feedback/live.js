
var debug = require('sherlock')('apnagent:feedback-live')
  , inherits = require('tea-inherits')
  , tls = require('tls');

var Base = require('./base')
  , errors = require('../errors');

module.exports = Feedback;

function Feedback () {
  Base.call(this);
}

inherits(Feedback, Base);
