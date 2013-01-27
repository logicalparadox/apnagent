
0.3.1 / 2013-01-27 
==================

  * npmignore: ignore examples folder
  * examples: [basic] add basic example
  * deps: update lotus to 0.3.x, fixes writer dsl push bug

0.3.0 / 2013-01-16 
==================

  * test: [agent] add common agent tests that run for both mock and live
  * test: [travis] only test node 0.8.x
  * test: [live-agent] change tests to only run if key/cert is available
  * Merge branch 'feature/msgid'
  * test: [agent] nextId and agent integration
  * agent: [nextId] add nextId method and message.id getter
  * Merge branch 'feature/mockagent'
  * test: [mockagent] normalize reconnect process against live
  * test: [mock-agent] add tests for mock agent
  * agent: [mock] add mock agent
  * agent: [util] normalize prep of gateway options
  * agent: rename live agent from agent.js to live.js
  * agent: add base class and live agent extends base class
  * deps: update with tea-inherits
  * agent: [old] remove single class agent

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
