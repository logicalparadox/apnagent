---
  title: Queue Component
  render-file: false
  weight: 40
---

### Queue Component

The queue component stores outgoing messages until the socket is ready to written. Messages are serialized 
before being placed in the queue to minimize APNs-side errors. 

User created messages are placed at the end of the queue such that it will operate with a first-in/first-out 
strategy. In the event of a connection error, messages that need to be resent will be placed in the beginning 
of the queue to best mimic the user's intended send order. 

> Core contributors to the `apnagent` module should familiarize themselves with the 
> [breeze-queue](https://github.com/qualiancy/breeze-queue) module.

#### Events

**queue:drain** - Emitted after the queue has process all messages through the gateway. This does not guarantee 
that all messages sent have been processed by the APN service or received by the device.
