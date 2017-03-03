#! /usr/bin/env node

/**
 * dependencies
 */

var manifest = require('../package.json')
var program = require('commander')
var raidar = require('..')
var path = require('path')
var fs = require('fs')
var chalk = require('chalk')

/**
 * commande config
 */

program
  .version(manifest.version)
  .option('-a, --address <address>', 'perform a request to a particular hostname/IP')
  .option('-t, --timeout <n>', 'set a request idle timeout, default 3 seconds', parseInt)
  .option('-f, --fahrenheit', 'display temperature in fahrenheit instead of celsius')
  .option('-d, --dump [path]', 'dump ReadyNAS messages')
  .option('-j, --json', 'print JSON format')
  .option('-F, --fake <path>', 'emulate a fake device from dump')
  // .option('-v, --verbose', 'enable debug output')
  .parse(process.argv)

/**
 * error handler util
 *
 * @param {Error} [err]
 */

function handleError (err) {

  // print to stderr
  if (err) console.error(err.toString())

}

/**
 * dump feature
 *
 * @param {String|Buffer} message
 * @param {String} [filename]
 */

function dump (message, filename) {

  // ensure process dump actived
  if (!program.dump) return

  // set default filename
  filename = filename || (new Date()).getTime().toString()

  // get CLI argument
  var dir = program.dump

  // set default target dir
  if (dir === true) dir = process.cwd()

  // handle relative paths
  if (!path.isAbsolute(dir)) dir = path.join(process.cwd(), dir)

  // get target file path
  var file = path.join(dir, filename) + '.readynas'

  // write file
  fs.writeFile(file, message, handleError)

}

/**
 * get colored icon to print by status code
 *
 * @param {String} status
 * @return {String}
 */

function statusIcon (status) {

  switch (status) {

    case 'ok':
      return chalk.green('✓')

    case 'warn':
      return chalk.bold.yellow('!')

    case 'dead':
      return chalk.bold.red('x')

    default:
      return chalk.bold.blue('?')

  }

}

/**
 * set listeners
 */

// generic errors
raidar.on('error', handleError)

// parse failed devices
raidar.on('fail', function (err, message) {

  // log error
  handleError(err)

  // execute dump
  dump(message)

})

// successful devices
raidar.on('device', function (nas) {

  // dump message with IP as filename
  dump(nas.message, nas.ip())

  // handle JSON output
  if (program.json) return console.log(JSON.stringify(nas, null, 2))

  var str = '\n'

  str += nas.getEntityAttribute('model', 'descr') + ' - ' + nas.serial() + '\n'
  str += chalk.yellow('  mac\t') + chalk.grey(nas.mac()) + '\n'
  str += chalk.yellow('  ip\t') + chalk.grey(nas.ip()) + '\n'
  str += chalk.yellow('  name\t') + chalk.grey(nas.hostname()) + '\n'
  str += chalk.yellow('  fw\t') + chalk.grey(nas.version()) + '\n'

  str += '  Disks\n'

  for (var d = 1; d <= nas.diskCount(); d++) {

    str += '  ' + statusIcon(nas.diskInfo(d, 'status'))

    str += chalk.grey(' ' + nas.diskInfo(d, 'model') + ' - ')

    var temp = nas.diskInfo(d, 'celsius')

    var label = temp + '°C'

    if (program.fahrenheit) label = nas.diskInfo(d, 'fahrenheit') + '°F'

    if (temp < 25) {

      str += chalk.bgBlue(label)

    } else if (temp < 41) {

      str += chalk.grey(label)

    } else if (temp < 51) {

      str += chalk.bgYellow(label)

    } else {

      str += chalk.bgRed(label)

    }

    str += '\n'

  }

  str += '  Volumes\n'

  for (var v = 1; v <= nas.volumeCount(); v++) {

    str += '  ' + statusIcon(nas.volumeInfo(v, 'status'))
    str += chalk.grey(' RAID lv.' + nas.volumeInfo(v, 'level') + ' - ')

    var usage = parseInt(nas.volumeInfo(v, 'used') / nas.volumeInfo(v, 'size') * 100)

    if (usage < 50) {

      str += chalk.grey(usage + '%')

    } else if (usage < 75) {

      str += chalk.bgBlue(usage + '%')

    } else if (usage < 90) {

      str += chalk.bgYellow(usage + '%')

    } else {

      str += chalk.bgRed(usage + '%')

    }

    str += chalk.grey(' used\n')
    str += '    ' + chalk.grey(nas.volumeInfo(v, 'message')) + '\n'

  }

  // print to stdout
  console.log(str)

})

/**
 * handle fake request
 */

// detect "fake" argument
if (program.fake) {

  // get target file
  var file = program.fake

  // resolve relative paths
  if (!path.isAbsolute(file)) file = path.join(process.cwd(), file)

  // read data from file
  fs.readFile(file, function (err, data) {

    // print error
    handleError(err)

    // fake the message
    if (!err) raidar._onSocketMessage(data)

  })

}

/**
 * execute request
 */

if (!program.json) console.log('waiting for response..')

raidar.request({
  address: program.address,
  timeout: program.timeout
}, process.exit)
