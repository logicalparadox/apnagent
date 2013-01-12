global.chai = require('chai');
global.should = chai.should();

global.apnagent = require('../..');

function req (name) {
  return process.env.APNAGENT_COV
    ? require('../../lib-cov/apnagent/' + name)
    : require('../../lib/apnagent/' + name);
}

global.__apn = {
    Message: req('message')
}
