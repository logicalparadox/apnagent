var apnagent = require('..')
  , fs = require('fs')
  , join = require('path').join;

var cert, key;

try {
  cert = fs.readFileSync(join(__dirname, '../test/certs/apnagent-cert.pem'));
  key = fs.readFileSync(join(__dirname, '../test/certs/apnagent-key-noenc.pem'));
} catch (ex) {
  console.error('Error loading key/cert: %s', ex.message);
  process.exit(1);
}

var agent = new apnagent.Agent();

agent
  .set('cert', cert)
  .set('key', key)
  .enable('sandbox');

agent.createMessage()
  .device('5b51030dd5bad758fbad5004bad35c31e4e0f550f77f20d4f737bf8d3d5524c6')
  .alert('body', 'Hello World')
  .send();

agent.createMessage()
  .device('515b030dd5bad758fbad5004bad35c31e4e0f550f77f20d4f737bf8d3d5524c6')
  .alert('body', 'Hello Universe')
  .send();

agent.connect();
