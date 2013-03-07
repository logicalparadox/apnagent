module.exports = function (Feedback, key, cert, live) {
  function newFeedback () {
    var agent = new Feedback();
    agent.enable('sandbox');
    agent.set('cert file', cert);
    agent.set('key file', key);
    return agent;
  }

  describe('.set(\'concurrency\', n)', function () {
    it('should change the queue\' concurrency', function () {
      var fb = newFeedback();
      fb.set('concurrency', 1);
      fb.queue._concurrency.should.equal(1);
    });

    it('should error on non-numbers', function () {
      var fb = newFeedback();

      (function () {
        fb.set('concurrency', 'string');
      }).should.throw();

      fb.queue._concurrency.should.equal(10);
    });

    it('should error on negative numbers', function () {
      var fb = newFeedback();

      (function () {
        fb.set('concurrency', -1);
      }).should.throw();

      (function () {
        fb.set('concurrency', 0);
      }).should.throw();

      fb.queue._concurrency.should.equal(10);
    });
  });
};
