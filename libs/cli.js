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
 * path parsing for commander
 *
 * @param {String} target
 * @return {String}
 */

function parsePath (target) {

  // handle relative paths
  if (!path.isAbsolute(target)) target = path.join(process.cwd(), target)

  // return resolved path
  return target

}

/**
 * print error to stderr
 *
 * @param {Error} [err]
 */

function printError (err) {

  // print to stderr
  if (err) console.error(err.toString())

}

/**
 * create an error handler with callback on success
 *
 * @param {Function} [success]
 * @return {Function}
 */

function handleError (success) {

  // return handler
  return function (err, result) {

    // print error
    printError(err)

    // execute success callback
    if (!err && success) success(result)

  }

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

  // get target file path
  var file = path.join(program.dump, filename) + '.readynas'

  // write file
  fs.writeFile(file, message, printError)

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

    case 'not_present':
      return chalk.gray('x')

    default:
      return chalk.bold.blue('?')

  }

}

/**
 * commande config
 */

program
  .version(manifest.version)
  .option('-a, --address <address>', 'perform a request to a particular hostname/IP')
  .option('-t, --timeout <n>', 'set a request idle timeout, default 3 seconds', parseInt)
  .option('-f, --fahrenheit', 'display temperature in fahrenheit instead of celsius')
  .option('-d, --dump [path]', 'dump ReadyNAS messages', parsePath)
  .option('-j, --json', 'print JSON format')
  .option('-F, --fake <path>', 'emulate a fake device from dump', parsePath)
  // .option('-v, --verbose', 'enable debug output')
  .parse(process.argv)

// handle optional value
if (program.dump === true) program.dump = parsePath('.')

/**
 * set listeners
 */

// generic errors
raidar.on('error', printError)

// parse failed devices
raidar.on('fail', function (err, message) {

  // log error
  printError(err)

  // execute dump
  dump(message)

})

// successful devices
raidar.on('device', function (nas) {

  // dump message with IP as filename
  dump(nas.message, nas.ip())

  // handle JSON output
  if (program.json) return console.log(JSON.stringify(nas, null, 2))

  // resulting log
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

    var label = program.fahrenheit ? (nas.diskInfo(d, 'fahrenheit') + '°F') : (temp + '°C')

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
 * start program
 */

// first message
if (!program.json) console.log('waiting for response..')

// make fake response
if (program.fake) fs.readFile(program.fake, handleError(raidar._onSocketMessage))

// execute network request
raidar.request(program, process.exit)
