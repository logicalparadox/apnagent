describe('action', function(){
  var Action = apnagent.Action;

  describe('constructor', function(){
    it('should pass its parameters to set', function() {
      var action = new Action({'title': 'reply', 'id': 'REPLYTO'});

      action.should.have.property('detail')
      action.detail.should.deep.equals({
        'id': 'REPLYTO'
        ,'title': 'reply'
      })
    });
  })

  describe('.set()', function () {
	  it('should be chainable', function(){
	    var action = new Action();

      action
        .set('id', 'delete')
        .set('title', 'Delete');
	  });

      it('should set key/value pairs', function () {
        var action = new Action();
        action
          .set('id', 'delete')
          .set('loc-args', ['John'])
          .set('loc-key', 'REPLYTO')
          .set('title', 'Delete')
          .set('title-loc-args', ['play'])
          .set('title-loc-key', 'TITLE-LOCKEY')
          .set('ignore-me', true)
          .set('empty');

        action.should.have.property('detail').that.deep.equals({
           'id': 'delete'
          ,'loc-args': ['John']
          ,'loc-key': 'REPLYTO'
          ,'title': 'Delete'
          ,'title-loc-args': ['play']
          ,'title-loc-key': 'TITLE-LOCKEY'
        });
      });

      it('should set accept an object', function () {
        var action = new Action();
        action.set({
           'id': 'delete'
          ,'title': 'Delete'
          ,'ignore-me': true
        });

        action.should.have.property('detail').that.deep.equals({
           'id': 'delete'
          ,'title': 'Delete'
          });
      });

      it('should require an array value for args', function(){
        var action = new Action();
        action
          .set('loc-args', 'simple string');

        action.should.have.property('detail')
        action.detail.should.not.have.property('loc-args')
      })
    });
})