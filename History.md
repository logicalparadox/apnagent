
1.1.3 / 2014-10-08 
==================

 * Merge pull request #22 from Speicher210/master
 * Replace const by var.
 * travis using node .10 and .11
 * Increase the max payload size according to the not-yet-documented change for APN (256bytes->2048bytes). Centralise the value in a constant Update the test case for truncation and exceptions

1.1.2 / 2014-10-08 
==================

 * pgk: add serve command
 * Merge pull request #18 from phgrey/master
 * formatting && making the method private
 * correcting jsdocs
 * some memory leaks fixing
 * Merge pull request #11 from codeHatcher/master
 * fixing alert example when setting multiple values
 * alert example for object incorrect, fixing

1.1.1 / 2014-03-24 
==================

  * Merge pull request #9 from TassosD/unicodetrim
  * Fix payload trim for unicode alert text
  * Merge pull request #8 from jonasrauber/master
  * Travis SVG badge
  * Merge pull request #7 from jonasrauber/master
  * removed incorrect parentheses and added missing dash in documentation

1.1.0 / 2014-03-11 
==================

  * bug: streams emit empty reads in node 0.11
  * Merge pull request #6 from lemonlabs/ft/mockagent
  * Extend MockAgent so it can simulate msg rejection on Apple side (err 8)

1.0.5 / 2013-11-21 
==================

 * Merge pull request #4 from nrcmedia/master
 * Not adding an alert key to the aps if the alert is not set

1.0.4 / 2013-11-19 
==================

 * Merge pull request #3 from nrcmedia/master
 * Destroy the gateway connection on error, so reconnection works also when the connection is dropped instead of closed.

1.0.3 / 2013-10-26 
==================

 * Merge pull request #2 from nrcmedia/content-available-support
 * Added support for content-available flag

1.0.2 / 2013-04-16 
==================

  * deps: [lotus] force version gte 1.0.1

1.0.1 / 2013-04-04 
==================

  * agent: [base] queue/cache start in pause state
  * docs: add link to tutorial article

1.0.0 / 2013-03-27 
==================

  * pkg: update description
  * docs: update
  * feedback: [base] change default interval
  * agent: [all] reconnect now cancelled by .close()
  * docs: add resources section
  * docs: color scheme
  * docs: checkpoint - agent docs ready for proofread
  * agent: [base] documentation
  * agent: [mock/live] fix reference to stored gateway error
  * Merge branch 'refactor/node10'
  * feedback: [base/mock] convert to new lotus api
  * examples: [agent] fix small typos
  * agent: [all] upgrade to use lotus 1.0.x
  * codecs: [all] change exports for lotus compatibility
  * pkg: [lotus] update to 1.0.x
  * docs: add site folder
  * lib: documentation
  * grep: change to qualiancy project
  * Merge branch 'refactor/examples'
  * agent: [mock] fix scoping bug
  * examples: add mock examples for agent/feedback
  * examples: update live examples
  * test: [feedback] test for change of concurrency
  * feedback: [base] add set handle for concurrency change
  * deps: [facet] update and migrate to 0.4.x
  * message: documentation
  * device: add comments

0.5.0 / 2013-02-28 
==================

  * readme: update feature set
  * examples: refactor with new error names
  * errors: normalize naming convention
  * agent: [base] incoming errors emitted as message:error
  * agent: [base] send emits message error, not notification error
  * agent: [base] required methods throw instead of respond
  * agent: store lastId and gatewayError in meta storage
  * agent: [live] connect returns this
  * tests: turn all tests back on
  * Merge branch 'feature/feedback'
  * feedback: [mock] add tests
  * feedback: finish base/live/mock implementation
  * codec: [feedback.response] add write definition
  * examples: [feedback] add basic feedback example
  * feedback: add base, mock, live feedback agents
  * codec: [feedback] add feedback response codec
  * pkg: add breeze-async dep
  * errors: add feedback auth error
  * util: add feedback options parser to utils
  * feedback: [base] add default settings and methods
  * feedback: add constructors
  * agent: [iterator] check for connection after encoder data

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
