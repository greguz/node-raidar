var raidar = require('./index');

console.log('Sleep for 10 seconds...');

raidar.request(10000, function(err, devices) {
  if (err) {
    console.log(err);
  } else if (!devices.length) {
    console.log('No ReadyNAS devices found...');
  } else {
    console.log('Founded ' + devices.length + ' devices!');
  }

  process.exit();
});