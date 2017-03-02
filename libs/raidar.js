/**
 * dependencies
 */

var util = require('util')
var dgram = require('dgram')
var EventEmitter = require('events').EventEmitter
var ReadyNAS = require('./readynas')

/**
 * @class Raidar
 * @extends EventEmitter
 * @constructor
 */

function Raidar () {

  // force function context
  this._onSocketClose = this._onSocketClose.bind(this)
  this._onSocketError = this._onSocketError.bind(this)
  this._onSocketMessage = this._onSocketMessage.bind(this)

  // magic packet to broadcast
  this._packet = new Buffer('0000073e0000000100000000f8d496c3ffffffff0000001c00000000', 'hex')

  // create TCP socket
  this.socket = dgram.createSocket('udp4')

}

/**
 * inherit from node.js EventEmitter class
 */

util.inherits(Raidar, EventEmitter)

/**
 * TODO docs
 *
 * @return {Boolean}
 */

Raidar.prototype.isOpen = function () {

  // return the insternal flag
  return !!this._open

}

/**
 * open new socket to listen readynas events
 *
 * @param {Function} [callback]
 * @return {Raidar}
 */

Raidar.prototype.open = function (callback) {

  // ensure callback
  callback = callback || function () { }

  // this instance shortcut
  var self = this

  // socket var shortcut
  var socket = this.socket

  // start listening
  socket.on('error', this._onSocketError)
  socket.on('message', this._onSocketMessage)

  // open socket
  socket.bind(57877, function () {

    // set communication to broadcast
    socket.setBroadcast(true)

    // set "open" flag
    self._open = true

    // monito "close" event
    socket.once('close', self._onSocketClose)

    // emit listening event
    self.emit('listening')

    // execute callback
    callback()

  })

  // return this instance
  return this

}

/**
 * close socket
 *
 * @param {Function} [callback]
 * @return {Raidar}
 */

Raidar.prototype.close = function (callback) {

  // ensure status
  if (!this.isOpen()) throw new Error('Socket is not open')

  // ensure callback
  callback = callback || function () { }

  // stop listening
  this.socket.off('error', this._onSocketError)
  this.socket.off('message', this._onSocketMessage)

  // close socket
  this.socket.close(callback)

  // return this instance
  return this

}

/**
 * triggered on socket close
 * @private
 */

Raidar.prototype._onSocketClose = function () {

  // update close flag
  this._open = false

  // emit event
  this.emit('close')

}

/**
 * triggered on socket error
 * @private
 *
 * @param {Error} err
 */

Raidar.prototype._onSocketError = function (err) {

  // notify error
  this.emit('error', err)

}

/**
 * triggered on remote response
 * @private
 *
 * @param {Buffer} msg
 */

Raidar.prototype._onSocketMessage = function (msg) {

  // notify Raidar message
  this.emit('message', msg)

  // try to parse
  try {

    // instance a ReadyNAS
    var device = new ReadyNAS(msg)

    // notify device
    this.emit('device', device)
    this.emit(device.ip(), device)
    this.emit(device.mac(), device)
    this.emit(device.hostname(), device)

  } catch (err) {

    // handle paring error
    this.emit('fail', err, msg)

  }

}

/**
 * request status to ReadyNAS devices
 *
 * @param {Object} [options]
 * @param {String} [options.host]       request target devices, default '255.255.255.255'
 * @param {Number} [options.timeout]    request timeout, default 10 seconds
 * @param {Function} [callback]
 * @return {Raidar}
 */

Raidar.prototype.request = function (options, callback) {

  // ensure no previous requests
  if (this._request) throw new Error('A previous request is running')

  // ensure socket opened
  if (!this.isOpen()) return this.open(this.request.bind(this, options, callback))

  // flag as running
  this._request = true

  // handle signature
  if (typeof options === 'function') {

    callback = options

    options = {}

  }

  // ensure options
  options = options || {}

  // ensure callback
  callback = callback || function () { }

  // founded devices
  var devices = []

  // davice collector handler
  var handler = function (device) {

    // just push device instance
    devices.push(device)

  }

  // this instance shortcut
  var self = this

  // request timeout (default 10 seconds)
  var timeout = options.timeout || 10000

  // target host (default broadcast)
  var host = options.host || '255.255.255.255'

  // send magic packet
  this.socket.send(this._packet, 0, this._packet.length, 22081, host, function (err) {

    // handle error
    if (err) {

      // clean request flag
      self._request = false

      // notify error
      self.emit('error', err)

      // execute callback
      return callback(err)

    }

    // listen for founded devices
    self.on('device', handler)

    // start a timeout
    setTimeout(function () {

      // clear devices listener
      self.removeListener('device', handler)

      // clean request flag
      self._request = false

      // all done
      callback(null, devices)

    }, timeout)

  })

  // return this instance
  return this

}

/**
 * @exports Raidar
 */

module.exports = Raidar
