#! /usr/bin/env node


// dependencies

var path      = require('path'),
    fs        = require('fs'),
    chalk     = require('chalk'),
    minimist  = require('minimist'),
    raidar    = require('./raidar');


// print with tabs utility

var print = function() {
  var args = [];
  for (var i in arguments) {
    args.push(arguments[i]);
  }
  console.log(args.join('\t'));
};


// exit from process

var exit = function(err) {
  if (err) console.log(chalk.red(err));
  print();
  raidar.close();
  process.exit(err ? 1 : 0);
};


// status print utility

var printStatus = function(status) {
  print(chalk.yellow(status.name));

  for (var field in status) {
    if (field[0] === '_' || field === 'name') continue;
    print(field, status[field]);
  }
};


// vars

var argv    = minimist(process.argv.slice(2)),
    timeout = (argv.timeout || argv.t || 10) * 1000,
    part    = argv.part || argv.p,
    index   = argv.index || argv.i,
    dump    = argv.dump || argv.d;

dump = dump === true ? '.' : dump;


// start request

raidar.request(timeout, exit);


// on error end

raidar.on('error', exit);


// print info

raidar.on('device', function(device) {
  print();
  print(chalk.bold.yellow(device.hostname()));
  print(device.info());
  print('ip:', device.ip());
  print('mac:', device.mac());

  var status = device.status(part, index);

  if (status instanceof Array) {
    status.forEach(printStatus);
  } else if (status) {
    printStatus(status);
  }

  if (part === true) {
    for (var name in device._data) {
      device._data[name].forEach(printStatus);
    }
  }

  if (dump) {
    var file    = device.ip() + '.readynas',
        target  = path.join(dump, file);

    fs.writeFile(target, device._message, function(err) {
      if (err) console.log(chalk.red(err));
    });
  }
});