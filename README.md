# node-raidar



Define error callback:

```
raidar.on('error', function(err) {
  console.log('ERROR', err);
});
```



Define device info callback:

```
raidar.on('device', function(device) {
    console.log(device.ip, device.hostname, device.mac,  device.info.disk[0].status);
});
```



To request information from ReadyNAS devices:

```
raidar.sendMagic();
```


License: MIT