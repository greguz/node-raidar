// #########################################################################
// dependencies
// #########################################################################

var dgram         = require('dgram')
  , EventEmitter  = require('events').EventEmitter
  , _             = require('lodash')
  , ReadyNAS      = require('./readynas');



// #########################################################################
// module vars
// #########################################################################

var _defaultOptions = {
  socketType    : 'udp4',
  portToListen  : 57877,
  targetHost    : '255.255.255.255',
  targetPort    : 22081,
  magicPacket   : new Buffer('0000073e0000000100000000f8d496c3ffffffff0000001c00000000', 'hex')
};

var _socket   = null
  , _options  = null
  , _events   = new EventEmitter();



// #########################################################################
// utility functions
// #########################################################################

var firstValueByType = function(obj, type) {
  for (var i in obj) {
    if (typeof obj[i] === type)
      return obj[i];
  }
};

var firstNumber = function(obj) {
  return firstValueByType(obj, 'number');
};

var firstFunction = function(obj) {
  return firstValueByType(obj, 'function');
};

var firstObject = function(obj) {
  return firstValueByType(obj, 'object');
};



// #########################################################################
// socket functions
// #########################################################################


var socketError = function(err) {
  _events.emit('error', err);
};

var socketMessage = function(msg) {
  _events.emit('message', msg);

  try {
    var device = new ReadyNAS(msg);
    [ 'device', device.ip, device.hostname, device.mac ].forEach(function(e) {
      _events.emit(e, device);
    });
  } catch(e) {
    _events.emit('fail', msg, e);
  }
};

var openNewSocket = function() {
  var options   = firstObject(arguments)
    , callback  = firstFunction(arguments);

  _options = _.extend(_.clone(_defaultOptions), options);

  _socket = dgram.createSocket(_options.socketType);

  _socket.on('error', socketError);
  _socket.on('message', socketMessage);

  _socket.bind(_options.portToListen, function() {
    _socket.setBroadcast(true);
    if (callback) callback();
  });
};

var closeSocket = function() {
  if (_socket) _socket.close();
  _socket = null;
};

var sendMagic = function() {
  var callback = firstFunction(arguments);

  var send = function() {
    _socket.send(_options.magicPacket, 0, _options.magicPacket.length, _options.targetPort, _options.targetHost, function(err) {
      if (callback) callback(err);
    });
  };

  if (!_socket) openNewSocket(send); else send();
};



// #########################################################################
// exports
// #########################################################################

module.exports.on = function(event, callback) {
  return _events.on(event, callback.bind(_events));
};

module.exports.once = function(event, callback) {
  return _events.once(event, callback.bind(_events));
};

module.exports.open = openNewSocket;

module.exports.close = closeSocket;

module.exports.request = function() {
  var timeout   = firstNumber(arguments)
    , callback  = firstFunction(arguments)
    , founded   = [];

  if (!callback) return sendMagic();

  var cbDevice = function(device) {
    founded.push(device);
  };

  sendMagic(function(err) {
    if (err) return callback(err);

    _events.on('device', cbDevice);

    setTimeout(function() {
      _events.removeListener('device', cbDevice);
      callback(null, founded);
    }, timeout || 5000);
  });
};