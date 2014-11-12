var MAX_PAYLOAD_SIZE = 2048;

describe('Message', function () {
  var sample_token = '5b51030d d5bad758 fbad5004 bad35c31 e4e0f550 f77f20d4 f737bf8d 3d5524c6'
    , device = new Buffer(sample_token.replace(/\s/g, ''), 'hex');

  var agent = new apnagent.MockAgent()
    , Message = __apnagent.Message;

  describe('.set()', function () {
    it('should set key/value pairs', function () {
      var msg = new Message()
        , res = msg.set('answer', 42);

      msg.should
        .have.property('payload')
        .an('object')
        .that.deep.equals({ answer: 42 });
      res.should.deep.equal(msg);
    });

    it('should set object', function () {
      var msg = new Message()
        , res = msg.set({ answer: 42, who: 'deep thought' });

      msg.should
        .have.property('payload')
        .an('object')
        .that.deep.equals({
            answer: 42
          , who: 'deep thought'
        });
      res.should.deep.equal(msg);
    });
  });

  describe('.badge()', function () {
    it('should set badge', function () {
      var msg = new Message()
        , res = msg.badge(42);
      msg.should.have.property('settings')
        .and.have.property('badge', 42);
      res.should.deep.equal(msg);
    });
  });

  describe('.contentAvailable(true)', function () {
    it('should set content-available flag', function () {
      var msg = new Message()
        , res = msg.contentAvailable(true);
      msg.should
        .have.property('settings')
        .and.have.property('content-available', 1);
      res.should.deep.equal(msg);
    });
  });

  describe('.contentAvailable(false)', function () {
    it('should set content-available flag to 0', function () {
      var msg = new Message()
        , res = msg.contentAvailable(false);
      msg.should
        .have.property('settings')
        .and.not.have.property('content-available');
      res.should.deep.equal(msg);
    });
  });

  describe('.sound()', function () {
    it('should set sound', function () {
      var msg = new Message()
        , res = msg.sound('bell');
      msg.should
        .have.property('settings')
        .and.have.property('sound', 'bell');
      res.should.deep.equal(msg);
    });
  });

  describe('.alert()', function () {
    it('should set key/value pairs', function () {
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

    it('should set object', function () {
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

  describe('.device()', function () {
    it('should set as buffer', function () {
      var msg = new Message()
        , res = msg.device(device);
      msg.meta.device.toString().should.equal(device.toString('hex'));
      res.should.deep.equal(msg);
    });

    it('should set as string', function () {
      var msg = new Message()
        , res = msg.device(sample_token);
      msg.meta.device.toString().should.equal(device.toString('hex'));
      res.should.deep.equal(msg);
    });

  });

  describe('.serialize()', function () {
    var longBody = new Array(1900).concat([
        'Hello Universe. I am going to make'
      , 'this string really long so that it is truncated'
      , 'when I attempt to convert it to a string. If you are'
      , 'sending messages that are this long then you really'
      , 'need to understand what a notification is.'
    ]).join(' ');

    var longBodyUnicode = new Array(1800).concat([
        'Οσα συμβαίνουν στην Ουκρανία έχουν ανοίξει'
      , 'μια εξαιρετικά ενδιαφέρουσα συζήτηση για το'
      , 'κατά πόσον οδεύουμε προς μια νέα παγκόσμια γεωπολιτική'
      , 'συγκυρία. Κάποιοι πιστεύουν ότι ο χαμένος διπολισμός'
      , 'του Ψυχρού Πολέμου επανέρχεται, άλλοι θεωρούν ότι η'
      , 'σημερινή Ρωσία δεν μπορεί να παίξει τον ρόλο.'
    ]).join(' ');

    it('should get payload when only alert body', function () {
      var msg = new Message();

      msg
        .device('00')
        .set('custom', 'variable')
        .alert('body', 'Hello Universe')
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(MAX_PAYLOAD_SIZE);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert: 'Hello Universe'
            , badge: 1
          }
      });
    });

    it('should get payload for complex alert', function () {
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
        .should.not.be.above(MAX_PAYLOAD_SIZE);

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

    it('should have no alert body when alert not specified', function() {
      var msg = new Message();
      msg.device('00').sound('default');
      var json = msg.serialize();
      json.payload.should.deep.equal({
        aps: {
          sound: 'default'
        }
      });
    });

    it('should truncate when only alert body', function () {
      var msg = new Message();

      msg
        .device('feedface')
        .set('custom', 'variable')
        .alert('body', longBody)
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(MAX_PAYLOAD_SIZE);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert:
                new Array(1900).concat([ 'Hello Universe. I am going to make'
                , 'this string really long so that it is truncated'
                , 'when I...'
                ]).join(' ')
            , badge: 1
          }
      });
    });

    it('should truncate when only alert body (unicode)', function () {
      var msg = new Message();

      msg
        .device('feedface')
        .set('custom', 'variable')
        .alert('body', longBodyUnicode)
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(MAX_PAYLOAD_SIZE);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert:
                new Array(1800).concat([ 'Οσα συμβαίνουν στην Ουκρανία έχουν ανοίξει'
                , 'μια εξαιρετικά ενδιαφέρουσα συζήτηση για το'
                , 'κατά πόσον...'
                ]).join(' ')
            , badge: 1
          }
      });
    });

    it('should truncate for complex alert body', function () {
      var msg = new Message();

      msg
        .device('00')
        .set('custom', 'variable')
        .alert('body', longBody)
        .alert('launch-image', 'img.png')
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(MAX_PAYLOAD_SIZE);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert: {
                  body:
                    new Array(1900).concat([ 'Hello Universe. I am going to make'
                    , 'this string really long...'
                    ]).join(' ')
                , 'launch-image': 'img.png'
              }
            , badge: 1
          }
      });
    });

    it('should truncate for complex alert body (unicode)', function () {
      var msg = new Message();

      msg
        .device('00')
        .set('custom', 'variable')
        .alert('body', longBodyUnicode)
        .alert('launch-image', 'img.png')
        .badge(1);

      var json = msg.serialize();

      Buffer.byteLength(JSON.stringify(json.payload), msg.encoding)
        .should.not.be.above(MAX_PAYLOAD_SIZE);

      json.payload.should.deep.equal({
          custom: 'variable'
        , aps: {
              alert: {
                  body:
                    new Array(1800).concat([ 'Οσα συμβαίνουν στην Ουκρανία έχουν ανοίξει'
                    , 'μια εξαιρετικά ενδιαφέρουσα συζήτηση για...'
                    ]).join(' ')
                , 'launch-image': 'img.png'
              }
            , badge: 1
          }
      });
    });

    it('should throw when too long w/ only alert body', function () {
      var msg = new Message();

      msg
        .device('feedface')
        .set('custom_body', longBody)
        .alert('body', 'Hello Universe')
        .badge(1);

      (function () {
        msg.serialize();
      }).should.throw('Message too long.');
    });

    it('should throw when too long w/ complex alert body', function () {
      var msg = new Message();

      msg
        .device('feedface')
        .set('custom_body', longBody)
        .alert('body', 'Hello Universe')
        .alert('launch-image', 'img.png')
        .badge(1);

      (function () {
        msg.serialize();
      }).should.throw('Message too long.');
    });

    it('should throw when device not specified', function () {
      var msg = new Message();

      (function () {
        msg.serialize();
      }).should.throw('Message device not specified.');
    });

    it('should throw when codec enhanced and no expiration', function () {
      var msg = new Message(null, 'enhanced');

      msg.device('feedface');

      (function () {
        msg.serialize();
      }).should.throw('Message expiration not specified for enhanced codec delivery.');
    });

    it('should throw when codec enhanced and no agent', function () {
      var msg = new Message(null, 'enhanced');

      msg
        .device('feedface')
        .expires('1d');

      (function () {
        msg.serialize();
      }).should.throw('Message agent not specified for enhanced codec delivery.');
    });
  });
});
