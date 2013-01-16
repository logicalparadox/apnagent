describe('MockAgent', function () {
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
      should.not.exist(err);

      agent.once([ 'gateway', 'reconnect' ], function () {
        agent.connected.should.be.true;
        done();
      });

      // simulate non-approved disconnect
      agent.gateway.end();
    });
  });
});
