module.exports = process.env.APNAGENT_COV
  ? require('./lib-cov/apnagent')
  : require('./lib/apnagent');
