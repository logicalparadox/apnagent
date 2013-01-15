var read = require('fs').readFileSync;

describe('Agent', function () {
  it('should be able to connect', function (done) {
    var agent = new apnagent.Agent();
    agent.enable('sandbox');
    agent.set('cert', read(__dirname + '/certs/apnagent-cert.pem'));
    agent.set('key', read(__dirname + '/certs/apnagent-key-noenc.pem'));
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
      should.not.exist(err);

      agent.once([ 'gateway', 'reconnect' ], function () {
        agent.connected.should.be.true;
        done();
      });

      // simulate non-approved disconnect
      agent.gateway.destroy();
    });
  });
});
