var exists = require('fs').existsSync
  , join = require('path').join
  , read = require('fs').readFileSync;

var cert = join(__dirname, 'certs/apnagent-cert.pem')
  , key = join(__dirname, 'certs/apnagent-key-noenc.pem');

describe('Agent', function () {
  var live = function (fn) { return fn; };

  require('./common/agent')(apnagent.Agent, key, cert);

  if (!exists(cert) || !exists(key)) {
    live = function (fn) { return null; };
    //it('skipping live agent tests. cert/key files missing.');
  }

  describe('.connect()', function () {
    it('should be able to connect', live(function (done) {
      var agent = new apnagent.Agent();
      agent.enable('sandbox');
      agent.set('cert file', cert);
      agent.set('key file', key);
      agent.connect(function (err) {
        should.not.exist(err);
        agent.once([ 'gateway', 'close' ], done);
        agent.close();
      });
    }));

    it('should be able to reconnect', live(function (done) {
      var agent = new apnagent.Agent();
      agent.enable('sandbox');
      agent.set('cert', read(cert));
      agent.set('key', read(key));
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
    }));
  });
});
