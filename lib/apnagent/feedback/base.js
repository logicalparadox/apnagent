/*!
 * apnagent - Feedback (Base)
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:feedback-base')
  , EventEmitter = require('drip').EnhancedEmitter
  , facet = require('facet')
  , inherits = require('tea-inherits')
  , lotus = require('lotus');

/*!
 * Internal dependancies
 */

var codecs = require('../codes')
  , Device = require('../device')
  , errors = require('../errors');

/*!
 * Primary Export
 */

module.exports = Base;

/**
 * Feedback (Base)
 *
 * @api private
 */

function Base () {
  EventEmitter.call(this, { delimeter: ':' });
  this.connected = false;
  this.set('interval', '30m');
  this.disable('sandbox');

  var self = this
    , decoder;

  decoder = lotus.createReaderStream();
  decoder.use(codecs.getInterface('feedback response', 'reader'));
  decoder.on('data', function (obj) {

  });

  this.decoder = decoder;
  this.feedback = null;
}

/*!
 * Inherits from EnhancedEmitter
 */

inherits(Base, EventEmitter);

/*!
 * Mount facet helpers
 */

facet(Base);

Base.prototype.connect = function () {
  throw new Error('Feedback connect not implemented.');
};

Base.prototype.close = function () {
  throw new Error('Feedback close not implemented.');
};
