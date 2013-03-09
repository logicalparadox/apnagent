/*!
 * apnagent - Codecs
 * Copyright(c) 2012-2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Codec Storage
 */

var codecs = [];

/**
 * Get one of the interfaces from a selected
 * codec. For example...
 *
 * ```js
 * writer.use(0, exports.getInterface('gateway simple', 'writer'));
 * ```
 *
 * @param {String} codec name
 * @param {String} codec interface
 * @return {Object} lotus reader/writer
 * @api public
 */

exports.getInterface = function (name, interface) {
  var codec = codecs.filter(function (codec) {
    return name === codec.name;
  })[0];

  return codec
    ? codec.mod[interface]
    : undefined;
};

/**
 * Get the id to use when writing to a lotus
 * stream.
 *
 * ```js
 * writer.write(exports.getID('gateway simple'), json);
 * ```
 *
 * @param {String} codec name
 * @return {Number} id
 * @api public
 */

exports.getId = function (name) {
  var codec = codecs.filter(function (codec) {
    return name === codec.name;
  })[0];

  return codec
    ? codec.id
    : undefined;
};

/*!
 * Push `simple` gateway codec
 */

codecs.push({
    name: 'gateway simple'
  , id: 0
  , mod: require('./gateway.simple')
});

/*!
 * Push `enhanced` gateway codec
 */

codecs.push({
    name: 'gateway enhanced'
  , id: 1
  , mod: require('./gateway.enhanced')
});

/*!
 * Push `response` gateway codec
 */

codecs.push({
    name: 'gateway response'
  , id: 8
  , mod: require('./gateway.response')
});

/*!
 * Push `response` feedback codec
 */

codecs.push({
    name: 'feedback response'
  , id: -1
  , mod: require('./feedback.response')
});
