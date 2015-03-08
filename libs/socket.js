// #########################################################################
// dependencies
// #########################################################################

var dgram = require('dgram')
  , _     = require('lodash');



// #########################################################################
// module vars
// #########################################################################

var exports   = {}
  , _options  = null
  , _socket   = null
  , _events   = {};

var _defaultOptions = {
  socketType    : 'udp4',
  portToListen  : 57877,
  targetHost    : '255.255.255.255',
  targetPort    : 22081,
  magicPacket   : new Buffer('0000073e0000000100000000f8d496c3ffffffff0000001c00000000', 'hex')
};



// #########################################################################
// utility functions
// #########################################################################

var notifyEvent = function() {
  var args      = _.values(arguments)
    , event     = args.shift()
    , callback  = _events[event];

  if (typeof callback !== 'function') return;

  callback.apply(this, args);
};

var socketError = function(err) {
  notifyEvent('error', err);
};

var socketMessage = function(msg) {
  notifyEvent('message', msg);
};



// #########################################################################
// exports
// #########################################################################

exports.open = function(options) {
  _options = _.extend(_.clone(_defaultOptions), options);

  _socket = dgram.createSocket(_options.socketType);

  _socket.on('error', socketError);
  _socket.on('message', socketMessage);

  _socket.bind(_options.portToListen, function() {
    _socket.setBroadcast(true);
  });
};

exports.close = function() {
  if (_socket) _socket.close();
  _socket = null;
};

exports.on = function(event, callback) {
  _events[event] = callback;
};

exports.sendMagic = function() {
  if (!_socket) exports.open();

  _socket.send(_options.magicPacket, 0, _options.magicPacket.length, _options.targetPort, _options.targetHost, function(err) {
    if (err) notifyEvent('error', err);
  });
};

module.exports = exports;