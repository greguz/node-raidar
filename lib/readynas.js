// class definition

var ReadyNAS = function(buffer) {
  if (!(buffer instanceof Buffer)) throw new Error('RAIDar buffer message required!');

  this._buffer    = buffer;
  this._message   = buffer.toString('utf8');

  this._header    = null;

  this._mac       = null;
  this._hostname  = null;
  this._ip        = null;

  this._data      = {};
  this._info      = {};

  this._initHeaderData();
  this._initBodyData();
  this._initFooterData();

  return this;
};



// initialize data from "ini header"
// base info and various

ReadyNAS.prototype._initHeaderData = function() {
  this._header = this._message.substr(0, 28);

  var self      = this,
      firstLine = this._message.substring(28, this._message.indexOf('\n')),
      firstInfo = firstLine.split('\t'),
      otherInfo = firstInfo.slice(3);

  this._mac       = firstInfo[0];
  this._hostname  = firstInfo[1];
  this._ip        = firstInfo[2];

  otherInfo.forEach(function(ini) {
    var info = self._parseInfo(ini);
    if (!self._data[info.name]) self._data[info.name] = [];
    self._data[info.name].push(info);
  });
};



// initialize data from "ini body"
// detailed info

ReadyNAS.prototype._initBodyData = function() {
  var self  = this,
      lines = this._message.split('\n').slice(1);

  lines.forEach(function(line) {
    if (line[0] === '\t') return;

    var info = self._parseInfo(line);
    if (!self._data[info.name]) self._data[info.name] = [];
    self._data[info.name].push(info);
  });
};



// initialize data from "ini body"
// actual status info and ???

ReadyNAS.prototype._initFooterData = function() {
  var lines = this._message.split('\n'),
      line  = lines[ lines.length - 2 ] || '';

  this._info = this._parseInfo(line.split('\t').join(''));
};



// utility to parse netgear ini format

ReadyNAS.prototype._parseInfo = function(str) {
  var arr = str.trim().split('!!'),
      res = { name: arr[0], _status : arr[1] };

  if (!arr[2])
    return res;

  var otherInfo = arr[2].split('::');

  otherInfo.forEach(function(str) {
    var arr   = str.split('='),
        field = arr[0],
        value = arr[1];

    if (value) {
      res[field] = value;
    } else {
      res._status = field;
    }
  });

  return res;
};



// get device ip

ReadyNAS.prototype.ip = function() {
  return this._ip;
};



// get device hostname

ReadyNAS.prototype.hostname = function() {
  return this._hostname;
};



// get device mac address

ReadyNAS.prototype.mac = function() {
  return this._mac;
};



// get info ?

ReadyNAS.prototype.info = function() {
  return this._info._status;
};



// generic utility to get status info

ReadyNAS.prototype.status = function(id, index) {
  var data  = this._data[id],
      res   = null;

  if (data) {
    if (!index && data.length === 1)
      res = data[0];
    else if (typeof index !== 'number')
      res = data;
    else
      res = data[index];
  }

  return res;
};



// export constructor

module.exports = ReadyNAS;