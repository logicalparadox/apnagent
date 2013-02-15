describe('Device', function () {
  var re = /[^a-z0-9]/gi
    , sample_token = '<5b51030d d5bad758 fbad5004 bad35c31 e4e0f550 f77f20d4 f737bf8d 3d5524c6>'
    , sample_device = new Buffer(sample_token.replace(re, ''), 'hex');

  var Device = apnagent.Device;

  describe('.toBuffer()', function () {
    it('should return a buffer', function () {
      var device = new Device(sample_token);
      device.toBuffer()
        .should.be.instanceof(Buffer)
        .and.deep.equal(sample_device);
    });
  });

  describe('.toString()', function () {
    it('should return a string', function () {
      var device = new Device(sample_device);
      device.toString()
        .should.be.a('string')
        .and.equal('5b51030dd5bad758fbad5004bad35c31e4e0f550f77f20d4f737bf8d3d5524c6');
    });
  });

  describe('.equal()', function () {
    it('should test equality when compared to a Device', function () {
      var dev1 = new Device(sample_token)
        , dev2 = new Device(sample_device)
        , dev3 = new Device('feedface');
      dev1.equal(dev2).should.be.true;
      dev2.equal(dev1).should.be.true;
      dev1.equal(dev3).should.be.false;
      dev2.equal(dev3).should.be.false;
      dev3.equal(dev1).should.be.false;
      dev3.equal(dev2).should.be.false;
    });

    it('should test equality when compared to a String', function () {
      var dev = new Device(sample_device);
      dev.equal(sample_token).should.be.true;
      dev.equal('feedface').should.be.false;
    });

    it('should test equality when compared to a Buffer', function () {
      var dev = new Device(sample_token);
      dev.equal(sample_device).should.be.true;
      dev.equal(new Buffer('feedface', 'hex')).should.be.false;
    });
  });
});
