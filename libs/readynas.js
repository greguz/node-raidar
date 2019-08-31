/**
 * dependencies
 */

var bytes = require('bytes')
var deprecate = require('deprecate')

/**
 * each all regex matches
 *
 * @param {RegExp|String} regex
 * @param {String} text
 * @param {Function} callback
 */

function _eachRegExp (regexp, text, callback) {
  // ensure regexp type
  if (typeof regexp === 'string') regexp = new RegExp(regexp, 'g')

  // first parse
  var result = regexp.exec(text)

  // each while regex match
  while (result) {
    // execute callback
    callback(result)

    // get next match
    result = regexp.exec(text)
  }
}

/**
 * parse entity body
 *
 * @param {String} data
 * @param {Number} [index]
 * @return {Object}
 */

function _parseEntity (data, index) {
  // resulting attributes
  var attributes = { _index: index ? parseInt(index, 10) : 0 }

  // split by "::"
  data.split('::').forEach(function (attribute) {
    // split attribute name and value
    attribute = attribute.split('=')

    // save its value
    attributes[attribute[0]] = attribute[1]
  })

  // return attributes
  return attributes
}

/**
 * @class ReadyNAS
 * @constructor
 *
 * @param {Buffer|String} ini   ReadyNAS device .ini
 * @param {String} [encoding]   default 'uft8'
 */

function ReadyNAS (message) {
  // cast buffer to string
  if (message instanceof Buffer) message = message.toString('ascii')

  // save message internally
  this.message = message
}

/**
 * get device MAC address
 *
 * @return {String}
 */

ReadyNAS.prototype.mac = function () {
  // probably....
  return this.message.substr(28, 17)
}

/**
 * get device hostname
 *
 * @return {String}
 */

ReadyNAS.prototype.hostname = function () {
  // probably....
  return /\t(\S+)/.exec(this.message)[1]
}

/**
 * get device IP
 *
 * @return {String}
 */

ReadyNAS.prototype.ip = function () {
  // probably....
  return /\t(\d+.\d+.\d+.\d+)\t/.exec(this.message)[1]
}

/**
 * get all available entities
 *
 * @return {Array}
 */

ReadyNAS.prototype.getEntities = function () {
  // resulting array
  var entities = []

  // each all matches
  _eachRegExp(/(\w+)!!\d+!![^\n\t]*/g, this.message, function (entity) {
    // get entity name
    var name = entity[1]

    // save new entities
    if (entities.indexOf(name) === -1) entities.push(name)
  })

  // return results
  return entities
}

/**
 * get entity data
 *
 * @param {String} entity     entity name
 * @param {Number} [index]    entity index (1 based, default non-array entities)
 * @return {Object|Array}
 */

ReadyNAS.prototype.getEntity = function (entity, index) {
  // set default index
  if (typeof index !== 'number') index = 0

  // create custom regex
  var regex = new RegExp(entity + '!!' + index + '!!([^\\n\\t]*)')

  // ensure entity data
  if (!regex.test(this.message)) throw new Error('Entity not found')

  // return parsed entity data
  return _parseEntity(regex.exec(this.message)[1], index)
}

/**
 * get single entity attribute
 *
 * @param {String} field
 * @param {Number} [index]
 * @param {String} attribute
 * @return {*}
 */

ReadyNAS.prototype.getEntityAttribute = function (field, index, attribute) {
  // handle optional index signature
  if (typeof index === 'string') {
    // get attribute
    attribute = index

    // remove index
    index = undefined
  }

  // parse entity data
  var data = this.getEntity(field, index)

  // return single attribute
  return data[attribute]
}

/**
 * get Object representation of this device
 *
 * @return {Object}
 */

ReadyNAS.prototype.toJSON = function () {
  // resulting array
  var result = {}

  // each all entities
  _eachRegExp(/(\w+)!!(\d+)!!([^\n\t]*)/g, this.message, function (entity) {
    // parse single entity data
    var attributes = _parseEntity(entity[3], entity[2])

    // save entity attributes
    if (attributes._index <= 0) { // handle single entry entities
      // check for previous data
      if (result[entity[1]]) throw new Error('nope')

      // save directly as object
      result[entity[1]] = attributes
    } else { // handle multiple entries entities
      // ensure array
      result[entity[1]] = result[entity[1]] || []

      // push new entry
      result[entity[1]].push(attributes)
    }
  })

  // return serialized object
  return result
}

/**
 * get single disk info
 *
 * statuses found:
 * - ok
 * - warn
 * - dead
 *
 * @param {Number} index    disk index, 1 based
 * @param {String} [info]   'status', 'channel', 'model', 'celsius', 'fahrenheit'
 * @return {String|Number}
 */

ReadyNAS.prototype.diskInfo = function (index, attribute) {
  // parse entity data
  var data = this.getEntity('disk', index)

  // detect request
  switch (attribute) {
    // extract and parse channel from description
    case 'channel':
      return parseInt(/Channel (\d+)/.exec(data.descr)[1], 10)

    // extract HDD model from description
    case 'model':
      return /Channel \d+: (.*),/.exec(data.descr)[1]

    // extract and parse temperature from description
    case 'temp':
    case 'temperature':
    case 'celsius':
    case 'fahrenheit':
      return parseInt(/(\d+)C\/(\d+)F/.exec(data.descr)[attribute === 'fahrenheit' ? 2 : 1], 10)

    // just return entity attribute
    default:
    case 'status':
      return data.status
  }
}

/**
 * count disks
 *
 * @return {Number}
 */

ReadyNAS.prototype.diskCount = function () {
  // return number of disk entities
  return this.message.match(/disk!!\d+!!/g).length
}

/**
 * get device serial number
 *
 * @return {String}
 */

ReadyNAS.prototype.serial = function () {
  // get single attribute from  model entity
  return this.getEntityAttribute('model', 'sn')
}

/**
 * get device firmware version
 *
 * @return {String}
 */

ReadyNAS.prototype.version = function () {
  // get single attribute from  model entity
  return this.getEntityAttribute('model', 'fw')
}

/**
 * get single RAID volume info
 *
 * @param {Number} index
 * @param {String} [attribute]    'status', level', 'message', 'size', 'used', 'free'
 * @return {String|Number}
 */

ReadyNAS.prototype.volumeInfo = function (index, attribute) {
  var data = this.getEntity('volume', index)

  switch (attribute) {
    // extract RAID level
    case 'level':
      return /RAID Level (.*),/.exec(data.descr)[1]

    // extract volume message
    case 'message':
      return /, (.*);/.exec(data.descr)[1]

    // extract and parse used space to bytes
    case 'used':
      return bytes(/; ([^B]*)/.exec(data.descr)[1] + 'B')

    // extract and parse volume size to bytes
    case 'size':
      return bytes(/of ([^B]*)/.exec(data.descr)[1] + 'B')

    // calculate free space in bytes
    case 'free':
      return this.volumeInfo(index, 'size') - this.volumeInfo(index, 'used')

    // just return entity attribute
    default:
    case 'status':
      return data.status
  }
}

/**
 * count RAID volumes
 *
 * @return {Number}
 */

ReadyNAS.prototype.volumeCount = function () {
  // return number of volume entities
  return this.message.match(/volume!!\d+!!/g).length
}

/**
 * DEPRECATED
 */

ReadyNAS.prototype.info = function () {
  // print deprecation warning
  deprecate('ReadyNAS#info() is deprecated')

  // WTF ?
  return this.getEntityAttribute('model', 'descr')
}

/**
 * DEPRECATED
 */

ReadyNAS.prototype.status = function (entity, index) {
  // print deprecation warning
  deprecate('ReadyNAS#status() is deprecated, use ReadyNAS#getEntity() instead')

  // alias of #getEntity()
  return this.getEntity(entity, index)
}

/**
 * @exports ReadyNAS
 */

module.exports = ReadyNAS
