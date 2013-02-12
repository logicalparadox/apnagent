TESTS = test/*.js
REPORTER = dot
TIMEOUT = 10000

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require ./test/bootstrap \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-live:
	@NODE_ENV=test APNAGENT_LIVE=1 ./node_modules/.bin/mocha \
		--require ./test/bootstrap \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-cov: lib-cov
	@APNAGENT_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov: clean
	@jscoverage lib lib-cov

clean:
	@rm -rf lib-cov
	@rm -f coverage.html

.PHONY: test lib-cov test-cov clean
