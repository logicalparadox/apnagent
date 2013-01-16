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

  describe('.id', function () {
    it('should get an id', function () {
      var agent = new apnagent.MockAgent()
        , i1 = agent.nextId()
        , i2 = agent.nextId()
        , i3;
      i1.should.equal(0);
      i2.should.equal(1);
      agent.lastId = 4294967296;
      i3 = agent.nextId();
      i3.should.equal(0);
      agent.lastId.should.equal(0);
    });
  });
});
