
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
  return codecs.filter(function (codec) {
    return name === codec.name;
  })[0].mod[interface];
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
  return codecs.filter(function (codec) {
    return name === codec.name;
  })[0].id;
};

/*!
 * Push `simple` gateway codec
 */

codecs.push({
    name: 'gateway simple'
  , id: 0
  , mod: require('./simple')
});

/*!
 * Push `enhanced` gateway codec
 */

codecs.push({
    name: 'gateway enhanced'
  , id: 1
  , mod: require('./enhanced')
});
