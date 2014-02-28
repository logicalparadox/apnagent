var Device = require('../lib/apnagent/device');

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

  describe('.setBadDevices()', function () {
    it('should throw error when passing a string', function (done) {
      var agent = new apnagent.MockAgent();
      try {
        agent.setBadDevices("a token");
        false.should.be.ok("We should not get here");
      } catch(err) {
        err.should.be.an.instanceOf(Error);
        done();
      }
    });

    it('should throw error when passing an array of strings', function (done) {
      var agent = new apnagent.MockAgent();
      try {
        agent.setBadDevices([ "a token", "another token" ]);
        false.should.be.ok("We should not get here");
      } catch(err) {
        err.should.be.an.instanceOf(Error);
        done();
      }
    });

    it('should throw error when passing a single Device', function (done) {
      var agent = new apnagent.MockAgent();
      try {
        agent.setBadDevices(new Device("aa bb cc"));
        false.should.be.ok("We should not get here");
      } catch(err) {
        err.should.be.an.instanceOf(Error);
        done();
      }
    });

    it('should succeed when passing an array of Device', function (done) {
      var agent = new apnagent.MockAgent();
      agent.setBadDevices([ new Device("aa bb cc") ]);
      done();
    });
  });

  describe('.send()', function () {
    var agent;
    var token = "87DB0CC7384019AB17C8AC9A6C2415C59354117B4D78585074AA1497E37F7500";

    var sendMessage = function () {
      agent
        .createMessage()
        .device(token)
        .alert("Bah")
        .send();
    };

    beforeEach(function (done) {
      agent = new apnagent.MockAgent();
      agent.enable('sandbox');
      agent.connect(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should emit a mock:message event when message is sent', function (done) {
      agent.once([ 'mock', 'message' ], function(msg) {
        msg.should.have.property('payload').an('object');
        msg.payload.should.have.property('aps').an('object');
        msg.should.have.property('deviceToken').an.instanceOf(Buffer);

        var sentDevice = new Device(token)
          , receivedDevice = new Device(msg.deviceToken);

        sentDevice.equal(receivedDevice).should.be.ok
        
        agent.once([ 'gateway', 'close' ], done);
        agent.close();
      });

      sendMessage()
    });

    it('should emit a message:error when message is sent to a bad device', function (done) {
      agent.setBadDevices([ new Device(token) ]);
        
      agent.once([ 'message', 'error' ], function(err, msg) {
        err.should.be.instanceOf(Error);
        err.should.have.property('code').and.be.equal(8);
        err.should.have.property('name').and.be.equal('GatewayMessageError');
        err.should.have.property('message').and.be.equal('Invalid token');

        msg.should.have.property('payload').an('object');
        msg.payload.should.have.property('aps').an('object');
        msg.should.have.property('deviceToken').an.instanceOf(Buffer);

        var sentDevice = new Device(token)
          , receivedDevice = new Device(msg.deviceToken);

        sentDevice.equal(receivedDevice).should.be.ok
        done();
      });

      sendMessage();
    });

    it('should reconnect after message error is received', function (done) {
      agent.setBadDevices([ new Device(token) ]);
      agent.once([ 'gateway', 'reconnect' ], done);
      sendMessage();
    });
    
    it('should resend message after an error and reconnection', function (done) {
      agent.setBadDevices([ new Device(token) ]);
      agent.once([ 'gateway', 'reconnect' ], function(err, msg) {

        // Reset bad devices, now message should pass just fine
        agent.once([ 'mock', 'message' ], function (msg) {
          msg.should.have.property('payload').an('object');
          msg.payload.should.have.property('aps').an('object');
          msg.should.have.property('deviceToken').an.instanceOf(Buffer);
          done();  
        });

        agent.setBadDevices([]);
        sendMessage();
      });

      sendMessage();
    });

  });
});
