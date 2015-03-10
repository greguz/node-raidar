# node-raidar: a node.js NetGear RADIar library

`node-raidar` is a simple to use NetGear RAIDar implementation for node.js.

# Example

``` js
var raidar = require('raidar');

// send request, wait 10000 ms, and return founded devices
raidar.request(10000, function(err, devices) {
    if (err)
        console.log('ERROR', err);
    else
        console.log('Founded devices: ' + devices.length);
});
```

# Methods

``` js
var raidar = require('raidar')
```

## raidar.open(opt:Object, cb:Function)

Open new UDP socket with given `opt` options and fire `cb` callback when socket is open.
All arguments are optional.
Default options:
- `socketType` : socket type to use ('udp4' or 'udp6'), default `udp4`
- `portToListen` : port to listen, default `57877`
- `targetHost` : target host to send "request info" packet, default `255.255.255.255`
- `targetPort` : target port to send "request info" packet, default `22081`

## raidar.close()

Close UDP socket.

## raidar.request(timeout:Number, callback:Function)

Send "request info" broadcast packet.
If at least `callback` function is passed, it will execute after `timeout` ms, default 5000 ms.
The event fires with `callback(err, devices)`.
`err` is set in case of errors and `devices` is an array of all devices found.

## raidar.on(event:String, callback:Function)

Set an event callback.

## raidar.once(event:String, callback:Function)

Set an event callback that execute only one time.

## Events

List of possible events.

### raidar.on('device', callback:Function)

Generic ReadyNAS device response.
This event fires with `callback(device)` where `device` is an instance of `ReadyNAS` class.

### raidar.on(id:String, callback:Function)

Specific device response callback where `id` is IP or Hostname or MAC address.
This event fires with `callback(device)` where `device` is an instance of `ReadyNAS` class.

### raidar.on('error', callback:Function)

Generic Error.
This event fires with `callback(err)` where `err` is an instance of `Error` class.

### raidar.on('fail', callback:Function)

Fail to parse response data.
This event fires with `callback(msg, err)` where `msg` is the response buffer and `err` is an instance of `Error` class.

# ReadyNAS class

...

## Property

...

## Methods

...

# License: MIT