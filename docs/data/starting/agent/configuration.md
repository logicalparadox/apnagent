---
  title: Configuration
  render-file: false
  weight: 20
---

### Configuration

> All settings and event are documented later on a per-component basis.

#### Settings

_**apn** agent_ uses methods to provide granular setting configuraton. Value based Settings can be 
modified using `.set()` and boolean based settings cen be modified using  `.enable()`, or `.disable()`.
Furthermore, methods that modify settings are chainable. For example:

```js
agent
  .set('cert file', join(__dirname, 'certs/cert.pem'))
  .set('key file', join(__dirname, 'certs/key.pem'))
  .enable('sandbox');
```

> Core contributors to the `apnagent` module should familiarize themselves with the
> [facet](https://github.com/qualiancy/facet) module.

#### Events

Like most Node.js modules, _**apn** agent_'s `Agent` and `MockAgent` classes implement the Node.js-style
EventEmitter paradigm. Event listeners can be added with `.on` or `.addListener`, removed with `.off`
or `.removeListener` and emitted using `.emit`. 

```js
agent.on('message:error', function (err, msg) {
  // We'll discuss error mitigation later.
});
```

> Core contributors to the `apnagent` module should familiarize themselves with the
> [drip](https://github.com/qualiancy/drip) module's `EnhancedEmitter` class.
