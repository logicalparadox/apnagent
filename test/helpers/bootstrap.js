global.chai = require('chai');
global.Should = chai.Should();

global.apn = require('../..');

function req (name) {
  return process.env.APNAGENT_COV
    ? require('../../lib-cov/apnagent/' + name)
    : require('../../lib/apnagent/' + name);
}

global.__apn = {
    Message: req('message')
  , codec: req('codec')
}
