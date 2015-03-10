var raidar  = require('./index')
  , path    = require('path')
  , fs      = require('fs');

var folder = path.join(process.argv[2] || __dirname, 'dump');

raidar.on('error', function(err) {
  console.log('ERROR', err);
});

raidar.on('message', function(msg) {
  var id    = new Date().getTime()
    , file  = path.join(folder, id + '.readynas');

  console.log('Writing ' + file + '...');

  fs.writeFile(file, msg, function(err) {
    if (err)  console.log('ERROR', err);
    else      console.log('OK');
  });
});

console.log('Creating folder ' + folder + '...');

fs.mkdir(folder, function(err) {
  if (!err) return raidar.request();

  console.log('ERROR', err);
  process.exit();
});

setTimeout(function() {
  console.log('END');
  process.exit();
}, 10000);