describe('action', function(){
  var Action = apnagent.Action;

  describe('.set()', function () {
	  it('should be chainable', function(){
	    var action = new Action();

      action
        .set('id', 'delete')
        .set('title', 'Delete');
	  })

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

        action.should.have.property('id').that.equals('delete');
        action.should.have.property('loc-args').that.deep.equals(['John']);
        action.should.have.property('loc-key').that.equals('REPLYTO');
        action.should.have.property('title').that.equals('Delete');
        action.should.have.property('title-loc-args').that.deep.equals(['play']);
        action.should.have.property('title-loc-key').that.equals('TITLE-LOCKEY');
        action.should.not.have.property('ignore-me');
        action.should.not.have.property('empty');
        // action.should.deep.equal({
        //   'id': 'delete',
        //   'loc-args': ['John'],
        //   'loc-key': 'REPLYTO',
        //   'title': 'Delete',
        //   'title-loc-args': ['play'],
        //   'title-loc-key': 'TITLE-LOCKEY'
        // })
      });

      it('should set accept an object', function () {
        var action = new Action();
        action.set({
          'id': 'delete',
          'title': 'Delete',
          'ignore-me': true
        });

        action.should.have.property('id').that.equals('delete');
        action.should.have.property('title').that.equals('Delete');
        action.should.not.have.property('ignore-me');
      });

      it('should require an array value for args', function(){
        var action = new Action();
        action
          .set('loc-args', 'simple string');

        action.should.not.have.property('loc-args')
      })
    });
})