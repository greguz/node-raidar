# node-raidar: a Node.js NetGear RAIDar library

`node-raidar` is a simple to use NetGear RAIDar implementation for Node.js.



## Installing

### NPM

```
npm install --save raidar
```

### Yarn

```
yarn add raidar
```



## Examples

### One shot

``` js
// require lib
var raidar = require('raidar')

// request devices
raidar.request(function (err, devices) {

  // handle error
  if (err) console.error(err)

  // do something useful
  else console.log('ReadyNAS devices found:', devices.length)

})
```

### Events

``` js
// require lib
var raidar = require('raidar')

// listen for all devices
raidar.on('device', function (device) {

  // do something cool
  console.log('Reponse from', device.hostname())

})

// handle all errors
raidar.on('error', function (err) {

  // log error
  console.error(err)

})

// listen single device by IP
raidar.on('192.168.1.10', function (device) { ... })

// listen single device by hostname
raidar.on('nas-acme', function (device) { ... })

// listen single device by MAC address
raidar.on('aa:bb:cc:dd:ee:ff', function (device) { ... })

// perform request
raidar.request()
```



## ReadyNAS (device) class

Representation of a ReadyNAS device.

### Device info APIs

#### mac() : {String}

Get device MAC address.

#### hostname() : {String}

Get device hostname.

#### ip() : {String}

Get device IP.

#### serial() : {String}

Get device serial number.

#### version() : {String}

Get loaded firmware version.

### Disks info APIs

#### diskCount() : {Number}

Get number of loaded disks.

#### diskInfo({Number} index, {String} [attribute='status']) : {String|Number}

Get info of a particular disk.

| Attribute   | Return type | Description               |
| ----------- | ----------- | ------------------------- |
| status      | {String}    | 'ok', 'warn', 'dead' or ? |
| channel     | {Number}    | HDD channel               |
| model       | {String}    | HDD model                 |
| celsius     | {Number}    | temperature in celsius    |
| fahrenheit  | {Number}    | temperature in fahrenheit |

### Volumes info APIs

#### volumeCount() : {Number}

Get number of configured volumes.

#### volumeInfo({Number} index, {String} [attribute='status']) : {String|Number}

Get info of a particular volume.

| Attribute | Return type | Description               |
| --------- | ----------- | ------------------------- |
| status    | {String}    | 'ok', 'warn', 'dead' or ? |
| level     | {String}    | RAID level                |
| message   | {String}    | Status description        |
| size      | {Number}    | Volume size in bytes      |
| used      | {Number}    | Used space in bytes       |
| free      | {Number}    | Free space in bytes       |

### Other APIs

#### getEntities() : {Array}

Get all device entities.

#### getEntity({String} entity, {Number} [index]) : {Object}

Get entity data.

#### getEntityAttribute({String} entity, {Number} [index], {String} attribute) : {*}

Get single entity attribute.

#### toJSON() : {Object}

Get {Object} representation of ReadyNAS device.



## RAIDar class

Handle network data collection.

### APIs

#### raidar.isOpen() : {Boolean}

Check if the UDP socket is open.

#### raidar.open({Function} [callback])

Open a new UPD socket, *callback* has no arguments.

#### raidar.close({Function} [callback])

Close the UDP socket, *callback* has no arguments.

#### raidar.request({Object} [options], {Function} [callback])

Perform a new ReadyNAS request, if the socket is closed it will be opened.

*callback* is called as `callback({Error} [err], {Array} devices)`.

| Option  | Type      | Description                           |
| ------- | --------- | ------------------------------------- |
| address | {String}  | Do request to a specific IP/hostname  |
| timeout | {Number}  | Idle timeout to stop request          |

### Events

#### raidar.on('listening', function () { ... })

Triggered whenever a socket begins listening for datagram messages.

#### raidar.on('close', function () { ... })

Triggered after a socket is closed with *#close()* API.

#### raidar.on('error', function ({Error} err) { ... })

Triggered where an error occurs.

#### raidar.on('fail', function ({Error} err, {Buffer} message) { ... })

Triggered after a error on ReadyNAS instance.

#### raidar.on('message', function ({Buffer} message) { ... })

Clean reponse from a ReadyNAS device.

#### raidar.on('device', function (device) { ... })

Triggered when a ReadyNAS device is found, with a instance of ReadyNAS class.

#### raidar.on('[IP]', function (device) { ... })

Same as *device* event, but triggered when a specific device is found.

#### raidar.on('[hostname]', function (device) { ... })

Same as *device* event, but triggered when a specific device is found.

#### raidar.on('[MAC address]', function (device) { ... })

Same as *device* event, but triggered when a specific device is found.



## CLI

### Usage

```
Usage: raidar [options]

Options:
  -h, --help               output usage information
  -V, --version            output the version number
  -a, --address <address>  perform a request to a particular hostname/IP
  -t, --timeout <n>        set a request idle timeout, default 3 seconds
  -f, --fahrenheit         display temperature in fahrenheit instead of celsius
  -d, --dump [path]        dump ReadyNAS messages
  -j, --json               print JSON format
```

### Output

```
ReadyNAS 104 - 0123456789ABC
  mac   aa:bb:cc:dd:ee:ff
  ip    192.168.1.5
  name  acme-swhouse
  fw    6.6.1
  Disks
  ✓ WDC_WD40EFRX-68WT0N0 4TB - 55°C
  ✓ WDC_WD40EFRX-68WT0N0 4TB - 40°C
  Volumes
  ✓ RAID lv.1 - 27% used
    Redundant
```

PS: the output is colored ;)



## Help me, bro !

* Have some problems ?
* Have over 9000 NetGear NASses ?
* Have some strange errors with some APIs ?

Dump all ReadyNAS messages and send it to me to help me to understand the ReadyNAS protocol.



## Test

```
npm run test
```


## License

Copyright 2017 Giacomo Gregoletto

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
