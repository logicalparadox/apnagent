describe('Cache', function () {
  describe('.push', function () {
    describe('(id, obj)', function () {
      it('should add an item to the store', function () {
        var cache = new Cache();
        cache.push(1, 'a');
        cache.should.have.lengthOf(1);
      });
    });

    describe('(id, obj, age)', function () {
      it('should add an item with custom age', function () {
        var cache = new Cache()
          , age = new Date().getTime() - 10000;
        cache.push(1, 'a', age);
        cache.should.have.lengthOf(1);

        cache.store[0].should.deep.equal({
            age: age
          , id: 1
          , obj: 'a'
        });
      });
    });
  });

  describe('.get()', function () {
    it('should return the obj at an id', function () {
        var cache = new Cache()
          , res;
        cache.push(1, 'a');
        cache.push(2, 'b');
        res = cache.get(2);
        should.exist(res);
        res.should.equal('b');
    });

    it('should return undefined if not found', function () {
        var cache = new Cache()
          , res;
        cache.push(1, 'a');
        cache.push(2, 'b');
        res = cache.get(4);
        should.equal(undefined);
    });
  });

  describe('.flush()', function () {
    it('should remove all items from the cache', function () {
      var cache = new Cache();
      cache.push(1, 'a');
      cache.push(2, 'b');
      cache.should.have.lengthOf(2);
      cache.flush();
      cache.should.have.lengthOf(0);
    });
  });

  describe('.sinceId()', function () {
    it('should flush the cache', function () {
      var cache = new Cache();
      cache.push(1, 'a');
      cache.push(2, 'b');
      cache.should.have.lengthOf(2);
      cache.sinceId(3, function () {});
      cache.should.have.lengthOf(0);
    });

    it('should iterate with correct parameters', function () {
      var cache = new Cache()
        , now = new Date().getTime();

      cache.push('one', 'a');
      cache.push('two', 'b');
      cache.push('three', 'c');
      cache.push('four', 'd');

      var spy = chai.spy('iterator', function (obj, id, age) {
        obj.should.be.a('string');
        id.should.be.a('string');
        age.should.be.a('number').gte(now);
      });

      cache.sinceId('two', spy);

      spy.should.have.been.called.twice;
      //spy.should.have.been.called.with.exactly('c', 'three', now);
      //spy.should.have.been.called.with.exactly('d', 'four', now);
    });
  });

  describe('.sinceTime()', function () {
    it('should flush the cache', function () {
      var cache = new Cache();
      cache.push(1, 'a');
      cache.push(2, 'b');
      cache.should.have.lengthOf(2);
      cache.sinceTime(3, function () {});
      cache.should.have.lengthOf(0);
    });

    it('should iterate with correct paramters', function () {
      var cache = new Cache()
        , now = new Date().getTime();

      cache.push('one', 'a', now - 10000);
      cache.push('two', 'b', now - 1000);
      cache.push('three', 'c', now - 100);
      cache.push('four', 'd', now - 10);

      var spy = chai.spy('iterator', function (obj, id, age) {
        obj.should.be.a('string');
        id.should.be.a('string');
        age.should.be.above(now - 500);
      });

      cache.sinceTime(now - 500, spy);

      spy.should.have.been.called.twice;
    });
  });

  describe('.resume()', function () {
    it('should clean objects older than ttl', function (done) {
      var cache = new Cache(50)
        , now = new Date().getTime();

      cache.push('one', 'a', now);
      cache.push('two', 'b', now + 25);
      cache.push('three', 'c', now + 75);

      cache.should.have.lengthOf(3);

      function time (ms, n) {
        setTimeout(function () {
          cache.length.should.be.above(n - 1);
        }, ms);
      }

      time(10, 3);
      time(75, 2);
      time(125, 1);
      time(175, 0);

      setTimeout(function () {
        cache.pause();
        done();
      }, 200);

      cache.resume();
    });
  });

  describe('.pause()', function () {
    it('should pause ttl cleaning', function (done) {
      var cache = new Cache(50)
        , now = new Date().getTime();

      cache.push('one', 'a', now);
      cache.push('two', 'b', now + 25);
      cache.push('three', 'c', now + 75);

      cache.should.have.lengthOf(3);

      function time (ms, n) {
        setTimeout(function () {
          cache.length.should.be.above(n-1);
        }, ms);
      }

      time(10, 3);
      time(75, 2);
      time(125, 1);
      time(175, 1);

      setTimeout(function () {
        cache.pause();
      }, 135);

      setTimeout(function () {
        done();
      }, 200)

      cache.resume();
    });
  });
});
