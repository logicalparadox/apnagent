var read = require('fs').readFileSync;

describe('Agent', function () {
  it('should be able to connect', function (done) {
    var agent = new apnagent.Agent();
    agent.enable('sandbox');
    agent.set('cert', read(__dirname + '/certs/apnagent-cert.pem'));
    agent.set('key', read(__dirname + '/certs/apnagent-key-noenc.pem'));
    agent.connect(function (err) {
      should.not.exist(err);
      done();
    });
  });
});
