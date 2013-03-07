describe('MockFeedback', function () {
  var live = function (fn) { return fn; };

  require('./common/feedback')(apnagent.MockFeedback, null, null, live);

  describe('.connect()', function () {
    it('should be able to connect', function (done) {
      var feedback = new apnagent.MockFeedback();
      feedback.enable('sandbox');
      feedback.connect(function (err) {
        should.not.exist(err);
        feedback.close(done);
      });
    });

    it('should be able to reconnect', function (done) {
      var feedback = new apnagent.MockFeedback();
      feedback.set('interval', '0.25s');
      feedback.connect(function (err) {
        var reconnected = false;
        should.not.exist(err);

        feedback.once('feedback:reconnect', function (){
          reconnected = true;
          feedback.connected.should.be.true;
          feedback.close();
        });

        feedback.once('feedback:close', function () {
          reconnected.should.be.true;
          done();
        });
      });
    });
  });

  describe('.unsub()', function () {
    it('should simulate a feedback [device] event', function (done) {
      var feedback = new apnagent.MockFeedback()
        , devSpy = chai.spy('event:device', function (device, ts) {
            device.should.be.instanceof(apnagent.Device);
            ts.should.be.instanceof(Date);
          });

      feedback.unsub('feedface');
      feedback.on('device', devSpy);

      feedback.connect(function (err) {
        should.not.exist(err);
        feedback.close(function () {
          setTimeout(function () {
            devSpy.should.have.been.called.once;
            done();
          }, 100);
        });
      });
    });
  });

  describe('.use()', function () {
    it('should allow for custom event iterators', function (done) {
      var feedback = new apnagent.MockFeedback()
        , devSpy = chai.spy('event:device', function (device, ts, next) {
            device.should.be.instanceof(apnagent.Device);
            ts.should.be.instanceof(Date);
            next.should.be.a('function');
            process.nextTick(next);
          });

      feedback.unsub('feedface');
      feedback.use(devSpy);
      feedback.use(devSpy);

      feedback.connect(function (err) {
        should.not.exist(err);
        feedback.close(function () {
          setTimeout(function () {
            devSpy.should.have.been.called.twice;
            done();
          }, 100);
        });
      });
    });

    it('should bail on errored custom event iterators', function (done) {
      var ierr = new Error('bad error')
        , feedback = new apnagent.MockFeedback()
        , failSpy = chai.spy('iterate:fail', function (device, ts, next) {
            device.should.be.instanceof(apnagent.Device);
            ts.should.be.instanceof(Date);
            next.should.be.a('function');
            next(ierr);
          })
        , errSpy = chai.spy('iterate:error', function (err, device, ts) {
            err.should.deep.equal(ierr);
            device.should.be.instanceof(apnagent.Device);
            ts.should.be.instanceof(Date);
          })
        , noopSpy = chai.spy('iterate:noop');

      feedback.unsub('feedface');
      feedback.use(failSpy);
      feedback.use(noopSpy);
      feedback.on('iterate:error', errSpy);

      feedback.connect(function (err) {
        should.not.exist(err);
        feedback.close(function () {
          setTimeout(function () {
            failSpy.should.have.been.called.once;
            errSpy.should.have.been.called.once;
            noopSpy.should.have.not.been.called();
            done();
          }, 100);
        });
      });
    });
  });
});
