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
        // action.aps.should.deep.equal({
        //     'body': 'Hello Universe'
        //   , 'action-loc-key': 'KEY'
        //   , 'loc-key': 'LOCKEY'
        //   , 'loc-args': [ 'one', 'two' ]
        //   , 'launch-image': 'img.png'
        //   , 'title': 'Greeting'
        //   , 'title-loc-key': 'TITLE-LOCKEY'
        //   , 'title-loc-args': ['three', 'four']
        //   , 'actions': [
        //       {
        //          "id" : "delete",
        //          "title" : "Delete"
        //       },
        //       {
        //          "id" : "reply-to",
        //          "loc-key" : "REPLYTO",
        //          "loc-args" : ["Jane"]
        //       }]
        // });
      });
    });
})