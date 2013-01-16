var join = require('path').join
  , read = require('fs').readFileSync;

describe('Agent', function () {
  it('should be able to connect', function (done) {
    var agent = new apnagent.Agent();
    agent.enable('sandbox');
    agent.set('cert file', join(__dirname, '/certs/apnagent-cert.pem'));
    agent.set('key file', join(__dirname, '/certs/apnagent-key-noenc.pem'));
    agent.connect(function (err) {
      should.not.exist(err);
      agent.once([ 'gateway', 'close' ], done);
      agent.close();
    });
  });

  it('should be able to reconnect', function (done) {
    var agent = new apnagent.Agent();
    agent.enable('sandbox');
    agent.set('cert', read(__dirname + '/certs/apnagent-cert.pem'));
    agent.set('key', read(__dirname + '/certs/apnagent-key-noenc.pem'));
    agent.connect(function (err) {
      var reconnected = false;

      should.not.exist(err);

      agent.once([ 'gateway', 'reconnect' ], function () {
        reconnected = true;
        agent.connected.should.be.true;
        agent.close();
      });

      agent.once([ 'gateway', 'close' ], function () {
        reconnected.should.equal.true;
        done();
      });

      // simulate non-approved disconnect
      agent.gateway.destroy();
    });
  });
});
