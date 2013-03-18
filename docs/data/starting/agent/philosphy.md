---
  title: Methodology
  render-file: false
  weight: 10
---

### Methodology

Apple insists that a connection "always" be established with the APN service even if there will
be long periods without outbound messages. The `Agent` will maintain this connection and reconnect 
when it is needed. 

The `MockAgent` implements all of the same methods and components as the `Agent` but it does not 
connect to the APN service; It does not need to connect to any service. By using a custom Node.js
[Stream](http://nodejs.org/api/stream.html) the `MockAgent` can simulate an outbound socket without
needing any network resources. Keeping things simple is incredibly adventageous for development 
and test environment, or applications that are deployed through continous integration.

One oddity of the APN service is that if an message error occurs on the service side the connection 
will respond with the error referencing which message it had a problem parsing and then disconnect. Any
messages that were sent after the errored message will not be parsed by APNs and will need to be resent.
_**apn** agent_ uses a number of components to handle this scenario and ensure all messages are 
sent without additional intervention from the user.
