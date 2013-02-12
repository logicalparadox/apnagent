describe('MockAgent', function () {
  var live = function (fn) { return fn; };

  require('./common/agent')(apnagent.MockAgent, null, null, live);

  describe('.connect()', function () {
    it('should be able to connect', function (done) {
      var agent = new apnagent.MockAgent();
      agent.enable('sandbox');
      agent.connect(function (err) {
        should.not.exist(err);
        agent.once([ 'gateway', 'close' ], done);
        agent.close();
      });
    });

    it('should be able to reconnect', function (done) {
      var agent = new apnagent.MockAgent();
      agent.enable('sandbox');
      agent.connect(function (err) {
        var reconnected = false;

        should.not.exist(err);

        agent.once([ 'gateway', 'reconnect' ], function () {
          reconnected = true;
          agent.connected.should.be.true;
          agent.close();
        });

        agent.once([ 'gateway', 'close' ], function () {
          reconnected.should.be.true;
          done();
        });

        // simulate non-approved disconnect
        agent.gateway.end();
      });
    });
  });
});
