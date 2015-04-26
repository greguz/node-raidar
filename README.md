# node-raidar: a node.js NetGear RAIDar library

`node-raidar` is a simple to use NetGear RAIDar implementation for node.js.

## Installing

```
npm install --save raidar
```

### Code example

``` js
var raidar = require('raidar');

console.log('Waiting...');

raidar.request('192.168.1.160', function(err, device) {
  if (device) {
    console.log('info', device.info());
    console.log('volume', device.status('volume'));
    console.log('disk 0', device.status('disk', 0));
  } else {
    console.log(err || 'No device found');
  }

  process.exit();
});
```

### Output example

```
Waiting...

info version=4.1.14,time=1412273301

volume {
    name: 'volume',
    _status: '1',
    status: 'warn',
    descr: 'Volume C: RAID Level 1, Not redundant.  A disk failure will render this volume dead.; 750 GB (81%) of 921 GB used'
}

disk 0 {
    name: 'disk',
    _status: '1',
    status: 'dead',
    descr: 'Channel 1: Seagate ST31000528AS 931 GB, 0C/32F[Dead]'
}
```

## Event definition

``` js
var raidar = require('raidar');

// set event for particular device
raidar.on('192.168.1.160', function(device) {
    console.log('Response from:', device.mac(), device.hostname());
});

raidar.request();
```

## Methods

``` js
var raidar = require('raidar');
```

### raidar.open(cb:Function)

Open or reset the UDP socket and fire `cb` callback when socket is open. All arguments are optional.

### raidar.close()

Close UDP socket.

### raidar.request(host:String, timeout:Number, callback:Function)

Send "request status" packet.

### raidar.on(event:String, callback:Function)

Set an event callback.

### raidar.once(event:String, callback:Function)

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

## ReadyNAS class

It is the representation of a ReadyNAS device.

### device.ip()

Return device IP address.

### device.hostname()

Return device Hostname.

### device.mac()

Return device MAC address.

### device.info()

Return machine info. (may vary by ReadyNAS device)

### device.status(part:String, index:Number)

Return the status of a specific part.
The `part` list vary by ReadyNAS device used,
the most common parts are `fan`, `ups`, `volume`, `disk` and `model`.

`index` is used when a part is an Array,
for example `device.status('disk', 1)` return the second hdd (if present),
otherwise `device.status('disk')` return a Collection (if exists more than one disk).

## Installing globally

```
npm install -g raidar
```

### Command line example

```
$ raidar -p
```

### Command line output example

```
Multimedia
version=4.1.14,time=1412273301
ip:     192.168.1.160
mac:    0:0d:a2:02:2e:1d
fan
status  ok
descr   1704RPM
ups
status  not_present
descr   Not present
volume
status  warn
descr   Volume C: RAID Level 1, Not redundant.  A disk failure will render this volume dead.; 750 GB (81%) of 921 GB used
disk
status  dead
descr   Channel 1: Seagate ST31000528AS 931 GB, 0C/32F[Dead]
disk
status  ok
descr   Channel 2: Seagate ST31000528AS 931 GB, 36C/96F
model
mode    home
descr   ReadyNAS Duo
arch    nsp
```

## CLI arguments

### timeout

Use `-t` or `--timeout` to set timeout in seconds for ReadyNAS device to respond, default 10 seconds.

### part

Use `-p` or `--part` to show part info and `-i` or `--index` to particular one.

### dump

Use `-d` or `--dump` to dump original response from ReadyNAS device, accept a path as argument.

ex: `$ raidar -d /home/user/dump`

## Running test

```
npm test
```

## License

MIT