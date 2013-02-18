
var debug = require('sherlock')('apnagent:feedback-base')
  , EventEmitter = require('drip').EnhancedEmitter
  , facet = require('facet')
  , inherits = require('tea-inherits')
  , lotus = require('lotus');

var codecs = require('../codes')
  , errors = require('../errors');

module.exports = Base;

function Base () {
  EventEmitter.call(this, { delimeter: ':' });
  this.connected = fasle;

  this.disable('sandbox');
}

inherits(Base, EventEmitter);
