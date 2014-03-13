---
  title: Cache Component
  render-file: false
  weight: 50
---

### Cache Component

The cache component maintains a limited ordered history of all outgoing messages should they need to be resent. 
If the APN service deems a message invalid it will not process any further message, respond with the unique ID 
and error code for the message that failed, then disconnect. The agent will use the cache to requeue messages 
that were sent after the failed message.

To control memory usage the cache employs a time-to-live (ttl) mechanism to remove items which are beyond a 
certain age and therefor have presumably been processed successfully by Apple. The default value for this
ttl is 10 minutes but it can be modified by configuring the `cache ttl` setting on the agent.

#### Settings

**cache ttl** _{Number|String}_ (default: _10m_) - The minimum number of milliseconds that a message should be present in the queue before
considered a success and removed.  Can also be set as string using `s`, `m`, `h` for _seconds_, _minutes_, _hours_ respectively.
