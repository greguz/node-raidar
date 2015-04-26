// dependencies

var util      = require('util'),
    dgram     = require('dgram'),
    events    = require('events'),
    ReadyNAS  = require('./readynas');



// class definition

var Raidar = function() {
  this._options = {
    socketType    : 'udp4',
    portToListen  : 57877,
    targetPort    : 22081,
    magicPacket   : new Buffer('0000073e0000000100000000f8d496c3ffffffff0000001c00000000', 'hex')
  };
};



// inherits from node EventEmitter

util.inherits(Raidar, events.EventEmitter);



// add link to readynas constructor

Raidar.prototype.ReadyNAS = ReadyNAS;



// open new socket to listen readynas events

Raidar.prototype.open = function(cb) {
  this.close();

  this._socket = dgram.createSocket(this._options.socketType);

  this._socket.on('message', this._socketMessage.bind(this));
  this._socket.on('error', this._socketError.bind(this));

  this._socket.bind(this._options.portToListen, function() {
    this.setBroadcast(true);
    if (typeof cb === 'function') cb();
  });
};



// private socket received message callback

Raidar.prototype._socketMessage = function(msg) {
  this.emit('message', msg);

  try {
    var device  = new ReadyNAS(msg),
        self    = this;
    [ 'device', device.ip(), device.hostname(), device.mac() ].forEach(function(e) {
      self.emit(e, device);
    });
  } catch(e) {
    this.emit('fail', msg, e);
  }
};



// private socket error callback

Raidar.prototype._socketError = function(err) {
  this.emit('error', err);
};



// close socket

Raidar.prototype.close = function() {
  if (this._socket) {
    this._socket.close();
  }
};



// private function to send "magic" packet
// to request status to all
// readynas devices

Raidar.prototype.request = function() {
  var self      = this,
      args      = [],
      opt       = this._options,
      timeout   = 10000,
      host      = '255.255.255.255',
      callback  = function() { },
      devices   = [];

  for (var i in arguments){
    args.push(arguments[i]);
  }

  if (!this._socket) return this.open(function() {
    self.request.apply(self, args);
  });

  args.forEach(function(arg) {
    switch(typeof arg) {
      case 'number':
        timeout = arg; break;
      case 'string':
        host = arg; break;
      case 'function':
        callback = arg; break;
    }
  });

  var cbDevice = function(device) {
    devices.push(device);
  };

  this._socket.send(
    opt.magicPacket,
    0,
    opt.magicPacket.length,
    opt.targetPort,
    host,
    function(err) {
      if (err) {
        self.emit('error', err);
        callback(err);
      } else {
        self.on('device', cbDevice);
        setTimeout(function() {
          self.removeListener('device', cbDevice);
          callback(null, host === '255.255.255.255' ? devices : devices[0]);
        }, timeout);
      }
    }
  );
};



// exports class instance

module.exports = new Raidar();