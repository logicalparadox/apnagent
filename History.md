
0.4.0 / 2013-02-15 
==================

  * example: [error.mitigation] remove trim for device
  * device: improve string regexp to remove all non-alphanumeric
  * message: [alert] if only key, set as body
  * message: [device] allow device constructor as set
  * agent: [close] refactor to wait for queue to finish current
  * pgk: update breeze-queue to 0.4.x
  * message: [expires] do unix calculation on set, no serialize
  * Merge branch 'feature/cache'
  * agent: [mock] fix reference errors
  * examples: [error.mitigation] refactor to handle different situations
  * agent: [all] implement cache mechanism
  * test: [cache] increase fuzziness of timing
  * message: [device] if no args, return device
  * code: [gateway response] change status to code.
  * errors: add GatewayNotificationError for apn response errors
  * test: [cache] increase test delays for more leighway
  * codecs: [gateway.response] add gateway response codec
  * cache: store settings on self
  * pgk: [breeze-queue] update to 0.3.x
  * test: resume running all tests
  * test: [cache] add tests for cache constructor
  * cache: add the cache constructor
  * examples: [basic] load key from certs folder
  * agent: [live] remove extraneous console logs"
  * message: fix bug preventing 0 expires to proceed
  * Merge branch 'refactor/defaultEnhanced'
  * makefile: turn live tests off by default
  * test: refactor tests for default enhanced codec
  * message/agent: [codec] make enhanced the default codec
  * test: better naming structure
  * test: [message] increase setters test coverage
  * message: clean up setters
  * docs: note that ios project can be used with tests
  * makefile: allow for custom timeouts
  * Merge branch 'feature/expires'
  * test: [message] add exiration tests
  * message: add support for expiration, enabling enhanced codec
  * dpes: add tea-ms
  * Merge branch 'feature/device'
  * test: [message] refactor to use Device constructor
  * message: refactor to use Device constructor
  * test: [device] add device tests
  * device: add device constructor
  * deps: update lotus to 0.4.x

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
