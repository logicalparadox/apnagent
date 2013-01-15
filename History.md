
0.2.0 / 2013-01-15 
==================

  * docs: update readme and package contribs
  * message: [send] pseudo-alias to msg._agent.send(this, cb)
  * Merge branch 'feature/reconnect'
  * test: [agent] should be able to reconnect
  * agent: [connect] support for reconnnect
  * Merge branch 'feature/events'
  * agent: events, custom errors, and improved codec lookup
  * errors: add custom errors and expose via exports.errors

0.1.1 / 2013-01-12 
==================

  * Add public method for closing the connection
  * Close -> destroy
  * Fix the way we build a codec name

0.1.0 / 2013-01-12 
==================

  * lib: comment updates
  * codecs: [index] create lookup methods
  * agent: code cleanup
  * agent: [send] pass through codec to socket
  * message: [serialize] matches codec's expectations
  * codecs: renaming from protocol
  * agent: [connect] estabish and test connection to apple gateway
  * gitignore: add test/certs and ignore contents
  * test: normalize bootstrap
  * lib: rename provider to agent
  * util: add file util
  * message: clean up code
  * add facet
  * adding tea
  * further cleanup of codec
  * using lotus protocol building
  * expose provider factory
  * allow for overwrite of default provider codec
  * added comments to provider
  * added provider
  * add idris time manager
  * release notice in readme
  * message constructor, simple codec, utilities, tests
  * Initial commit
