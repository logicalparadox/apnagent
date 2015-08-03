(function(){
  'use strict'
/*!
 * apnagent - Action
 * Copyright(c) 2015 Jim Argeropoulos <jim@goodmeetingapp.com>
 * MIT Licensed
 */

/*!
 * Primary export
 */

  module.exports = Action;

/**
 * ## Action API
 *
 * A small constructor to easily encapsulate a the action
 * properties that are available beginning in iOS 8.
 *
 * A message can take an array of custom actions. Commonly
 * when you have custom actions, you will aslo want to set
 * the category property of the message.
 *
 * ```js
 * var Action = require('apnagent').Action;
 * var delete = new Action()
 *                   .set('id', 'reply-to')
 *                   .set('loc-key', 'REPLYTO')
 *                   .set('loc-args', ['Jane'])
 * ```
 *
 * @header Action API
 */
  function Action(){

  }

  /**
 * ### .set (key, value)
 *
 * Set extra key values that will be incuded
 * as part of the payload. `aps` is reserved by
 * Apple and `enc` is reserved by apnagent.
 *
 * Is a key/value you pair is provided it will
 * be set. If an object is provided, all data points
 * will be merged into the current payload.
 *
 * ```js
 * // single value
 * msg.set('key', 'value');
 *
 * // multiple values
 * msg.set({
 *     key1: 'value1'
 *   , key2: 'value2'
 * });
 *
 * // or chainable
 * msg
 *   .set('key1', 'value1')
 *   .set('key2', 'value2');
 * ```
 *
 * @param {String|Object} string key or object of custom settings
 * @param {Mixed} value (when first argument is string)
 * @returns {this} for chaining
 * @api public
 * @name set
 */

  Action.prototype.set = function (key, value) {
    var allowed = [
        'id'
      , 'loc-key'
      , 'loc-args'
      , 'title'
      , 'title-loc-key'
      , 'title-loc-args'
    ];
    var valueMustBeArray = [
      , 'actions'
      , 'loc-args'
      , 'title-loc-args'
    ];
   // if ('object' === typeof key) {
    //   for (var name in key) {
    //     this.set(name, key[name]);
    //   }
    // } else {
      if(value === undefined) return this;
      if (!~allowed.indexOf(key)) return this;
      // if (~valueMustBeArray.indexOf(key) && !Array.isArray(value)) return this;
      this[key] = value;
    // }

    return this;
  };
}())
