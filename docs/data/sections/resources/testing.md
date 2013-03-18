---
  title: Testing
  render-file: false
  weight: 70
---

### Testing

- **@see** [Chai Assertion Library](http://chaijs.com)
- **@see** [Mocha Test Runner](http://visionmedia.github.com/mocha)

Tests are writting in Mocha using the Chai `should` BDD assertion library. Clone this repo and install
development dependencies using `npm install`.

#### Normal Testing

The normal testing life-cyle will test all features that do not require a live connection to
the APN service. All tests that require a live connection will have a status of "pending". These
are the tests that are run by [travis-ci](https://travis-ci.org/qualiancy/apnagent).

    make test

#### Live Testing

In order to perform the live tests you will need to provide your key, cert, and device token. These
can be provided within the test folder. Here is the expected folder structure and file names:

    tests
    ├── bootstrap
    │   └── ...
    ├── certs
    │   ├── apnagent-cert.pem
    │   ├── apnagent-key-noenc.pem
    │   └── device.txt
    ├── common
    │   └── ...
    ├── *.js

The key/cert pair should be for a sandbox based application. Furthermore, you should have the application installed
on you device. If you do not have one then use [apnagent-ios](https://github.com/logicalparadox/apnagent-ios).

    make test-live
