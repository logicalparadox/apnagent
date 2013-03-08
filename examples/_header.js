/*!
 * This header is used to load the key, cert, device
 * for all of the examples
 */

var fs = require('fs')
  , join = require('path').join;

/*!
 * Load cert, key, and valid device
 */

var cert, key, device;

try {
  cert = fs.readFileSync(join(__dirname, '../test/certs/apnagent-cert.pem'));
  key = fs.readFileSync(join(__dirname, '../test/certs/apnagent-key-noenc.pem'));
  device = fs.readFileSync(join(__dirname, '../test/certs/device.txt'), 'utf8');
} catch (ex) {
  console.error('Error loading key/cert/device: %s', ex.message);
  process.exit(1);
}

/*!
 * Primary export
 */

module.exports = {
    device: device
  , auth: {
        key: key
      , cert: cert
    }
}
