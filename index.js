// #########################################################################
// dependencies
// #########################################################################

var socket    = require('./libs/socket')
  , ReadyNAS  = require('./libs/readynas')
  , _         = require('lodash');



// #########################################################################
// module vars
// #########################################################################

var _events = {};



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



// #########################################################################
// socket settings
// #########################################################################

socket.on('error', function(err) {
  notifyEvent('error', err);
});

socket.on('message', function(msg) {
  try {
    var device = new ReadyNAS(msg);

    notifyEvent('device', device);
    notifyEvent(device.ip, device);
    notifyEvent(device.hostname, device);
    notifyEvent(device.mac, device);
  } catch(e) {
    notifyEvent('error', e);
  }
});

socket.open();



// #########################################################################
// functions
// #########################################################################

module.exports.options = function(options) {
  socket.close();
  socket.open(options);
};

module.exports.sendMagic = function(options, callback) {
  socket.sendMagic();
};

module.exports.on = function(event, callback) {
  _events[event] = callback;
};