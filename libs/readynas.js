// #########################################################################
// class definition
// #########################################################################

var ReadyNAS = function(buffer) {
  if (!buffer instanceof Buffer) throw new Error('RAIDar buffer message required!');

  this.buffer   = buffer;
  this.message  = buffer.toString('utf8');

  this.header   = null;

  this.mac      = null;
  this.hostname = null;
  this.ip       = null;

  this.info     = {};

  this.initInfo();

  return this;
};



// #########################################################################
// private
// #########################################################################

ReadyNAS.prototype.initInfo = function() {
  this.initHeaderInfo();
  this.initBodyInfo();
  this.initFooterInfo();
};

ReadyNAS.prototype.initHeaderInfo = function() {
  this.header = this.message.substr(0, 28);

  var self      = this
    , firstLine = this.message.substring(28, this.message.indexOf('\n'))
    , firstInfo = firstLine.split('\t')
    , otherInfo = firstInfo.slice(3);

  this.mac      = firstInfo[0];
  this.hostname = firstInfo[1];
  this.ip       = firstInfo[2];

  otherInfo.forEach(function(info) {
    self.parseInfo(info);
  });
};

ReadyNAS.prototype.initBodyInfo = function() {
  var self  = this
    , lines = this.message.split('\n').slice(1);

  lines.forEach(function(line) {
    if (line[0] === '\t') return;
    self.parseInfo(line);
  });
};

ReadyNAS.prototype.initFooterInfo = function() {

  // TODO write footer data initialization

};

ReadyNAS.prototype.parseInfo = function(str) {
  var arr     = str.split('!!')
    , name    = arr[0]
    , info    = { _info : arr[1] };

  if (!this.info[name]) this.info[name] = [];
  if (!arr[2]) return this.info[name].push(info);

  var otherInfo = arr[2].split('::');

  otherInfo.forEach(function(str) {
    var arr   = str.split('=')
      , field = arr[0]
      , value = arr[1];

    if (value) {
      info[field] = value;
    } else {
      info['_status'] = field;
    }
  });

  return this.info[name].push(info);
};



// #########################################################################
// public
// #########################################################################

ReadyNAS.prototype.toJSON = function(string) {
  var res = {
    message   : this.message,
    mac       : this.mac,
    hostname  : this.hostname,
    ip        : this.ip,
    info      : this.info
  };

  return string === true ? JSON.stringify(res) : res;
};



// #########################################################################
// export
// #########################################################################

module.exports = ReadyNAS;