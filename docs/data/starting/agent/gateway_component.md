---
  title: Gateway Component
  render-file: false
  weight: 30
---

### Gateway Component

The gateway component represents the connection to the APN service. For the live agent it is Node.js 
[tls](http://nodejs.org/api/tls.html) socket. For the mock agent it is a writable stream. A new gateway is 
constructed on every connect or reconnect attempt.

> Core contributors to the `apnagent` module should familiarize themselves with the 
> [lotus](https://github.com/qualiancy/lotus) module.

#### Settings

**key file, cert file, ca file, pfx file** _{String}_ - Set security credentials for the APN service 
connection by filename. Must use full path. These options are ignored by the `MockAgent`.

**key, cert, ca, pfx** _{Buffer}_ - Set the raw security credentials for connect to the APN service. 
These options are ignored by the `MockAgent`.

**passphrase** _{String}_ - For use with certificates if they are secured with a password. This option 
ignored by the `MockAgent`.

**sandbox** _{Boolean}_ (default: _false_) Should agent connect to the APN sandbox gateway. This option 
is ignored by the `MockAgent`.

**reconnect delay** _{Number|String}_ (default: _3s_) - Milliseconds after a disconnect that a reconnect 
should be attempted.  Can also be set as string using `s`, `m`, `h` for _seconds_, _minutes_, _hours)_ 
respectively.

#### Events

**gateway:connect** - Emitted every time a gateway connection is established. Since Apple closes the connection 
when it cannot process a message, this event may be emitted numerous times in an applications life-cycle.

**gateway:reconnect** - Emitted after a connection has been re-established after Apple had forcefully closed 
the connection. May be emitted numerous times in an application's life-cycle.

**gateway:error (err)** - Emitted if there is a client-side error with gateway. This includes authorization 
errors or TLS socket errors. An authorization error will be an instance of `GatewayAuthorizationError`.
