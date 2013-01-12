var sample_token = '5b51030d d5bad758 fbad5004 bad35c31 e4e0f550 f77f20d4 f737bf8d 3d5524c6'
  , device = new Buffer(sample_token.replace(/\s/g, ''), 'hex');

describe('messages', function () {
  var Message = __apn.Message;

  it('can be constructed', function () {
    var msg = new Message();
    msg.should.have.property('encoding', 'utf8');
  });

  it('can set custom variables', function () {
    var msg = new Message()
      , res = msg.set('answer', 42);
    msg.should.have.property('payload')
      .an('object').with.property('answer', 42);
    res.should.deep.equal(msg);
  });

  it('can set badge', function () {
    var msg = new Message()
      , res = msg.badge(42);
    msg.should.have.property('settings')
      .and.have.property('badge', 42);
    res.should.deep.equal(msg);
  });

  it('can set sound', function () {
    var msg = new Message()
      , res = msg.sound('bell');
    msg.should.have.property('settings')
      .and.have.property('sound', 'bell');
    res.should.deep.equal(msg);
  });

  describe('alert', function () {

    it('can set key/value pairs', function () {
      var msg = new Message();
      msg
        .alert('body', 'Hello Universe')
        .alert('action-loc-key', 'KEY')
        .alert('loc-key', 'LOCKEY')
        .alert('loc-args', [ 'one', 'two' ])
        .alert('launch-image', 'img.png')
        .alert('ignore-me', true);

      msg.should.have.property('aps').an('object');
      msg.aps.should.not.have.property('ignore-me');
      msg.aps.should.deep.equal({
          'body': 'Hello Universe'
        , 'action-loc-key': 'KEY'
        , 'loc-key': 'LOCKEY'
        , 'loc-args': [ 'one', 'two' ]
        , 'launch-image': 'img.png'
      });
    });

    it('can set object', function () {
      var msg = new Message();

      msg.alert({
          'body': 'Hello Universe'
        , 'action-loc-key': 'KEY'
        , 'loc-key': 'LOCKEY'
        , 'loc-args': [ 'one', 'two' ]
        , 'launch-image': 'img.png'
        , 'ignore-me': true
      });

      msg.should.have.property('aps').an('object');
      msg.aps.should.not.have.property('ignore-me');
      msg.aps.should.deep.equal({
          'body': 'Hello Universe'
        , 'action-loc-key': 'KEY'
        , 'loc-key': 'LOCKEY'
        , 'loc-args': [ 'one', 'two' ]
        , 'launch-image': 'img.png'
      });
    });

  });

  describe('device', function () {
    it('can set as buffer', function () {
      var msg = new Message()
        , res = msg.device(device);
      msg.meta.device.should.be.instanceof(Buffer)
      msg.meta.device.toString('hex').should.equal(device.toString('hex'));
      res.should.deep.equal(msg);
    });

    it('can set as string', function () {
      var msg = new Message()
        , res = msg.device(sample_token);
      msg.meta.device.should.be.instanceof(Buffer);
      msg.meta.device.toString('hex').should.equal(device.toString('hex'));
      res.should.deep.equal(msg);
    });

  });

  describe('.serialize()', function () {
    var longBody = [
        'Hello Universe. I am going to make'
      , 'this string really long so that it is truncated'
      , 'when I attempt to convert it to a string. If you are'
      , 'sending messages that are this long then you really'
      , 'need to understand what a notification is.'
    ].join(' ');

    it('can get payload when only alert body', function () {
      var msg = new Message();

      msg
        .device('00')
        .set('custom', 'variable')
        .alert('body', 'Hello Universe')
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(256);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert: 'Hello Universe'
            , badge: 1
          }
      });
    });

    it('can get payload for complex alert', function () {
      var msg = new Message();

      msg
        .device('00')
        .set('custom', 'variable')
        .alert('body', 'Hello Universe')
        .alert('loc-key', 'SOME_KEY')
        .badge(3)
        .sound('ping');

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(256);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert: {
                  body: 'Hello Universe'
                , 'loc-key': 'SOME_KEY'
              }
            , badge: 3
            , sound: 'ping'
          }
      });
    });

    it('can truncate when only alert body', function () {
      var msg = new Message();

      msg
        .device('00')
        .set('custom', 'variable')
        .alert('body', longBody)
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(256);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert:
                [ 'Hello Universe. I am going to make'
                , 'this string really long so that it is truncated'
                , 'when I attempt to convert it to a string. If you are'
                , 'sending messages that are this long then you really'
                , 'need to...'
                ].join(' ')
            , badge: 1
          }
      });
    });

    it('can truncate for complex alert body', function () {
      var msg = new Message();

      msg
        .device('00')
        .set('custom', 'variable')
        .alert('body', longBody)
        .alert('launch-image', 'img.png')
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(256);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert: {
                  body:
                    [ 'Hello Universe. I am going to make'
                    , 'this string really long so that it is truncated'
                    , 'when I attempt to convert it to a string. If you are'
                    , 'sending messages that are this...'
                    ].join(' ')
                , 'launch-image': 'img.png'
              }
            , badge: 1
          }
      });
    });

    it('will throw when too long w/ only alert body', function () {
      var msg = new Message();

      msg
        .set('custom_body', longBody)
        .alert('body', 'Hello Universe')
        .badge(1);

      (function () {
        msg.serialize();
      }).should.throw('Message too long.');
    });

    it('will throw when too long w/ complex alert body', function () {
      var msg = new Message();

      msg
        .set('custom_body', longBody)
        .alert('body', 'Hello Universe')
        .alert('launch-image', 'img.png')
        .badge(1);

      (function () {
        msg.serialize();
      }).should.throw('Message too long.');
    });

  });
});
