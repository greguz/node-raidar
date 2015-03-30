// #########################################################################
// class definition
// #########################################################################

var ReadyNAS = function(buffer) {
  if (!buffer instanceof Buffer) throw new Error('RAIDar buffer message required!');

  this._buffer    = buffer;
  this._message   = buffer.toString('utf8');

  this._header    = null;

  this._mac       = null;
  this._hostname  = null;
  this._ip        = null;

  this._data      = {};
  this._info      = {};

  this._init();
  return this;
};



// #########################################################################
// private
// #########################################################################

ReadyNAS.prototype._init = function() {
  this._initHeaderData();
  this._initBodyData();
  this._initFooterData();
};

ReadyNAS.prototype._initHeaderData = function() {
  this._header = this._message.substr(0, 28);

  var self      = this
    , firstLine = this._message.substring(28, this._message.indexOf('\n'))
    , firstInfo = firstLine.split('\t')
    , otherInfo = firstInfo.slice(3);

  this._mac       = firstInfo[0];
  this._hostname  = firstInfo[1];
  this._ip        = firstInfo[2];

  otherInfo.forEach(function(ini) {
    var info = self._parseInfo(ini);
    if (!self._data[info.name]) self._data[info.name] = [];
    self._data[info.name].push(info);
  });
};

ReadyNAS.prototype._initBodyData = function() {
  var self  = this
    , lines = this._message.split('\n').slice(1);

  lines.forEach(function(line) {
    if (line[0] === '\t') return;

    var info = self._parseInfo(line);
    if (!self._data[info.name]) self._data[info.name] = [];
    self._data[info.name].push(info);
  });
};

ReadyNAS.prototype._initFooterData = function() {
  var lines = this._message.split('\n')
    , line  = lines[ lines.length - 2 ];

  this._info = this._parseInfo(line.split('\t').join(''));
};

ReadyNAS.prototype._parseInfo = function(str) {
  var arr = str.trim().split('!!')
    , res = { name: arr[0], _status : arr[1] };

  if (!arr[2])
    return res;

  var otherInfo = arr[2].split('::');

  otherInfo.forEach(function(str) {
    var arr   = str.split('=')
      , field = arr[0]
      , value = arr[1];

    if (value) {
      res[field] = value;
    } else {
      res['_status'] = field;
    }
  });

  return res;
};



// #########################################################################
// public
// #########################################################################

ReadyNAS.prototype.ip = function() {
  return this._ip;
};

ReadyNAS.prototype.hostname = function() {
  return this._hostname;
};

ReadyNAS.prototype.mac = function() {
  return this._mac;
};



// #########################################################################
// export
// #########################################################################

module.exports = ReadyNAS;