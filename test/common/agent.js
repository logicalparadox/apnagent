
module.exports = function (Agent, key, cert, live) {

  function newAgent () {
    var agent = new Agent();
    agent.enable('sandbox');
    agent.set('cert file', cert);
    agent.set('key file', key);
    return agent;
  }

  describe('.nextId()', function () {
    it('should return the next id', function () {
      var agent = newAgent()
        , i1 = agent.nextId()
        , i2 = agent.nextId();
      i1.should.equal(0);
      i2.should.equal(1);
      agent.meta.lastId.should.equal(1);
    });

    it('should reset to 0 when exceeds int32', function () {
      var agent = newAgent()
        , i;
      agent.lastId = 4294967296;
      i = agent.nextId();
      i.should.equal(0);
      agent.meta.lastId.should.equal(0);
    });
  });

  describe('.createMessage()', function () {
    it('should return a new Message', function () {
      var agent = newAgent()
        , msg = agent.createMessage();
      msg.should.be.instanceof(__apnagent.Message);
    });

    it('should default to enhanced codec', function () {
      var agent = newAgent()
        , msg = agent.createMessage();
      agent.get('codec').should.equal('enhanced');
      msg.meta.should.have.property('codec', 'enhanced');
    });

    it('should default to 0 expiration', function () {
      var agent = newAgent()
        , msg = agent.createMessage();
      agent.get('expires').should.equal(0);
      msg.meta.should.have.property('expires', 0);
    });
  });
}
