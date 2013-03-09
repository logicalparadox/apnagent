/*!
 * apnagent - Cache
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var debug = require('sherlock')('apnagent:cache')
  , ms = require('tea-ms');

/*!
 * Primary Export
 */

module.exports = Cache;

/**
 * Cache
 *
 * A constructed cache is used to keep track of what messages
 * have been sent out and in what order. This is required as
 * Apple will disconnect and not attempt to parse any messages
 * after one has failed.
 *
 * Furthermore, this cache employs a ttl mechanism to conserve
 * memory. Items older than a specific age (default: 10 mins)
 * will be assumed successfully sent and removed from the cache.
 *
 * @param {String|Number} time to live (default: 10 mins)
 * @api public
 */

function Cache (ttl) {
  this.store = [];
  this.timer = null;
  this.ttl = ttl || '10m';
}

/**
 * .length
 *
 * Property which allows quick access to the length of
 * the internal storage. Probably only useful during
 * tests.
 *
 * @return {Number} count of items in the storage
 * @api public
 */

Object.defineProperty(Cache.prototype, 'length', {
  get: function () {
    return this.store.length;
  }
});

/**
 * .push (id, object[, age])
 *
 * Add an item to the cache. The `id` can be any arbitrary
 * string or number, provided it is unique relative to
 * the items in the cache. The `object` can be of any data
 * type. The `age` should be a number specifing the ms since
 * epoch. It is used internally by the ttl cleaner to ensure
 * items in the index retain their age when flushing since
 * a time. It is also used by the tests to construct scenarios.
 *
 * @param {String|Number} id unique
 * @param {Mixed} object to store
 * @param {Number} timestamp of object creation
 * @return {this} for chaining
 * @api public
 */

Cache.prototype.push = function (id, obj, age) {
  debug('(store) push: %s', id + '');
  this.store.push({
      age: age || new Date().getTime()
    , id: id
    , obj: obj
  });

  return this;
};

/**
 * .get (id)
 *
 * Get the object stored at a specific `id`. This method
 * does not modify the cache. If more than one object
 * has the same id, the first match will be returned.
 *
 * @param {String|Number} id unique
 * @return {Mixed} object at id
 * @api public
 */

Cache.prototype.get = function (id) {
  var i = 0
    , res = undefined
    , store = this.store;

  for (; i < store.length; i++){
    if (store[i].id === id) {
      res = store[i].obj;
      break;
    }
  }

  return res;
};

/**
 * .flush ()
 *
 * Remove all items from the internal storage.
 *
 * @return {this} for chaining
 * @api public
 */

Cache.prototype.flush = function () {
  debug('(store) flush');
  this.store = [];
  return this;
};

/**
 * .sinceId (id, iterator)
 *
 * Invoke an iterator on all entries in the cache
 * that were added since a specific id. The object
 * with the matching id will not be included in iteration.
 *
 * Warning: Using this method will flush the cache prior
 * to iteration.
 *
 * Iterator can accept up to three parameters:
 * - `object` - the entry's object
 * - `id` - the entry's id
 * - `age` - the entry's creation timestamp
 *
 * @param {String|Number} id unique
 * @param {Function} iterator
 * @return {this} for chaining
 * @api public
 */

Cache.prototype.sinceId = function (id, iterator) {
  var pos = -1
    , store = this.store
    , i = 0
    , l;

  this.flush();

  // find where to start
  for (; i < store.length; i++) {
    if (store[i].id === id) {
      pos = i;
      break;
    }
  }

  // iterate with the rest
  if (pos !== -1) {
    pos++; // we don't want the match
    for (; pos < store.length; pos++) {
      l = store[pos];
      iterator(l.obj, l.id, l.age);
    }
  }

  return this;
};

/**
 * .sinceTime (id, iterator)
 *
 * Invoke an iterator on all entries in the cache
 * that were added after a specific timestamp. Iteration
 * will respect the original ordering, however if an entry
 * does not match the criteria, it will be skipped.
 *
 * Warning: Using this method will flush the cache prior
 * to iteration.
 *
 * Iterator can accept up to three parameters:
 * - `object` - the entry's object
 * - `id` - the entry's id
 * - `age` - the entry's creation timestamp
 *
 * @param {String|Number} id unique
 * @param {Function} iterator
 * @return {this} for chaining
 * @api public
 */

Cache.prototype.sinceTime = function (age, iterator) {
  var store = this.store
    , i = 0
    , l;

  this.flush();

  // iterate for all that match
  for (; i < store.length; i++) {
    l = store[i];
    if (l.age > age) {
      iterator(l.obj, l.id, l.age);
    }
  }

  return this;
};

/**
 * .resume ()
 *
 * Resume the TTL-based cleaning timer. An initial clean
 * will be performed upon the initial invocation of this
 * method.
 *
 * @return {this} for chaining
 * @ap public
 */

Cache.prototype.resume = function () {
  var self = this
    , ttl = ms(this.ttl);

  // re-add new objects
  function push (obj, id, age) {
    self.push(id, obj, age);
  }

  // get older than and iterate
  function clean () {
    debug('(timer) clean older than %dms', ttl);
    self.sinceTime(new Date().getTime() - ttl, push);
    self.timer = setTimeout(clean, ttl);
  }

  // do first cleaning
  debug('(timer) resume');
  clean();
  return this;
};

/**
 * .pause ()
 *
 * Pause the TTL-based cleaning timer.
 *
 * @return {this} for chaining
 * @ap public
 */

Cache.prototype.pause = function () {
  debug('(timer) pause')
  clearTimeout(this.timer);
  return this;
};
