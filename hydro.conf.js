global.chai = require('chai');
global.chai.use(require('chai-spies'));

module.exports = function(hydro) {
  hydro.set({
    attach: global,
    formatter: 'hydro-dot',
    globals: {
      apnagent: require('./lib/apnagent'),
      Cache: require('./lib/apnagent/cache'),
      Message: require('./lib/apnagent/message')
    },
    timeout: 10000,
    plugins: [
      'hydro-bdd',
      'hydro-chai'
    ],
    chai: {
      styles: [ 'should' ],
      showDiff: true
    },
    tests: [
      'test/*.js'
    ]
  });
};
