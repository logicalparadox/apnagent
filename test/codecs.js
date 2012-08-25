var sample_token = '5b51030d d5bad758 fbad5004 bad35c31 e4e0f550 f77f20d4 f737bf8d 3d5524c6'
  , device = new Buffer(sample_token.replace(/\s/g, ''), 'hex');

describe('codecs', function () {

  describe('simple', function () {
    var msg = new __apn.Message()
      , codec = __apn.codec.byName('simple');

    before(function () {
      msg
        .device(device)
        .set('custom', 'variable')
        .alert('body', 'Hello Universe')
        .badge(1);
    });

    it('can be encoded', function () {
      var encoded = codec.encode(msg);
      encoded[0].should.equal(0);

      var tl = encoded.slice(1,3)
        , tld = tl.readUInt16BE(0);
      tld.should.be.a('number').equal(32);

      var token = encoded.slice(3, 3 + tld);
      token.toString('hex').should.equal(device.toString('hex'));

      var pll = encoded.slice(3 + tld, 3 + tld + 2)
        , plld = pll.readUInt16BE(0)
        , pl = encoded.slice(3 + tld + 2, 3 + tld + 2 + plld);

      (3 + tld + 2 + plld).should.equal(encoded.length);

      var json;
      (function () {
        json = JSON.parse(pl);
      }).should.not.throw();

      json.should.deep.equal({
          custom: 'variable'
        , aps: {
              badge: 1
            , alert: 'Hello Universe'
          }
      });
    });

    it('can be decoded', function () {
      var encoded = codec.encode(msg)
        , decoded = codec.decode(encoded);

      decoded.encoding.should.equal(msg.encoding);
      decoded.settings.should.deep.equal(msg.settings);
      decoded.payload.should.deep.equal(msg.payload)
      decoded.aps.should.deep.equal(msg.aps)
      decoded.meta.device.toString('hex').should.equal(msg.meta.device.toString('hex'));
    });

  });
});
