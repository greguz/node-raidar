var raidar = require('./index');

console.log('Setting up callbacks...');

raidar.on('error', function(err) {
  console.log('ERROR', err);
});

raidar.on('device', function(device) {
  console.log('Response from ' + device.ip + ' - ' + device.hostname + ' (' + device.mac + ')');
});

console.log('Opening UDP socket...');

raidar.open(function() {

  console.log('Testing for 10 seconds...');

  raidar.request();

  setTimeout(function() {
    process.exit();
  }, 10000);

});