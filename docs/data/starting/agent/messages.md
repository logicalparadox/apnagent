---
  title: Sending Messages
  render-file: false
  weight: 60
---

### Sending Messages

- Jump to: [Message Builder API](#header-message_builder_api)

To create a new message invoke the `.createMessage` method from an agent. This will return a 
constructed message that can be modified via chainable methods and then sent. 


```js
agent.createMessage()
  .device(token)
  .alert('Hello Universe')
  .send();
```

#### Message Expiration

- Jump to: [Message#expires()](#message_builder_api-expires)

It is unnecissary to cover in this section all of the chainable methods that can be used to 
custom your outbound messages, but one that deserves a bit of attention is handling message 
expiration. By default all messages have an expiration value of `0` (zero). This indicates to
Apple that if you cannot deliver the message immediately after processing then it should be
discarded. For example, if the default is kept then messages to devices which are off or out
of service range would not be delivered.

Though useful in some application contexts there are many cases where it is not. A social networking
application may wish to deliver at any time or a calendar application for an event that occurs within
the next hour. For this you may modify the default expiration value or change it on a per-message basis.

```js
// set default to one day
agent.set('expires', '1d');

// use custom for 1 hour
agent.createMessage()
  .device(token)
  .alert('New Event @ 4pm')
  .expires('1h')
  .send();

// set custom no expiration
agent.createMessage()
  .device(token)
  .alert('Event happening now!')
  .expires(0)
  .send();
```

#### Send Confirmation

- Jump to: [Error Mitigation]()

As you might have noticed in the above `.createMessage()` examples a callback was not specified
for the `.send()` method though the [Message#send()](#message_builder_api-send) api
allows for one to be set. Since the APN service does not provide confirmation that every
message has been successfully parsed managing a callback flow can be tricky. Here are rules governing
when the message `.send(cb)` callback will be invoked.

1. When `.send()` is invoked it immediately attempts the serialize the message into a JSON payload. It then
validates the payload based on a series of rules to mimimize APN-side errors. Issues such as a message missing
a token or being to long to send will be captured as a new `MessageSerializationError`. If a
`.send()` callback exists it will be invoked with the error as the first argument. This error
will also be emitted on the `agent` as a `message:error` event.

2. The message will then be placed in the queue and wait for itself to be sent. Once the message has been processed
by the queue and been successfully written to and flushed from the gateway the callback will then be invoked without
any arguments.

3. If the message cannot be parsed on the APN-side, Apple will inform the `agent`. The `agent` will construct an
`GatewayMessageError` based on Apple's response. The `agent` will also attempt to reconstruct the original
message if it is still present in the cache. The error and possible message will then be emitted on the `agent` as
the `message:error` event. The callback WILL NOT be invoked again.

Since any error occurance will be emitted as a `message:error` it may not always be necissary to specify a `.send()`
callback unless your flow needs to wait until the message has confirmed valid serialization. If possible, keep your
code DRY and use the `message:error` event instead.

#### Mock Agent Enhancement

One unfortunate downside to APNs implementation is that it cannot be determined when a message has been 
successfully parsed by Apple, only when a message has failed. To minimize the occurance of APN-side
errors each message passes through a set of validation rules prior to being transferred over the wire.
As a result of this implementation the reasonable assumption is that any message that is transferred
over the wire when using the `MockAgent` class can be assumed to be a successful message. 

The only difference between the `Agent` and `MockAgent` implementations is that when data is written
to the `MockAgent`'s gateway, that data will be decoded into a JSON object that represents the original
payload. This object will then be emitted on the `agent` as the `mock:message` event. Users can listen
for this event during tests to confirm that their applications have successfully implemented sending
mechanisms.

#### Settings

**expires** _{String|Number}_ (default: _0_) - Set this value on the `agent` to modify the default message expiration value. 
Can also be set as string using `s`, `m`, `h`, `d` for _seconds_, _minutes_, _hours_, _days_ respectively.

```js
agent.set('expires', '1d');
```

#### Events

**message:error (err[, msg])** - Listen for this event on the `agent` for when a message cannot be sent or 
has errored after sending. Visit [Error Mitigation]() for a complex example of how to work 
with the error emitted.

**mock:message (obj)** - Listen for this event on a constructed `MockAgent`. Will be emitted when the 
mock gateway stream has decoded a message that was sent over the "wire".
