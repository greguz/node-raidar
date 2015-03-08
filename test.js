var raidar = require('./index');

console.log('Testing for 10 seconds...');

raidar.on('error', function(err) {
  console.log('ERROR', err);
});

raidar.on('device', function(device) {
  console.log('Response from ' + device.ip + ' - ' + device.hostname + ' (' + device.mac + ')');
});

raidar.sendMagic();

setTimeout(function() {
  console.log('END');
  process.exit();
}, 10000);