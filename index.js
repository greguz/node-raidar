// get dependencies
var Raidar = require('./libs/raidar')
var ReadyNAS = require('./libs/readynas')

// export default instance
module.exports = new Raidar()

// export constructors
module.exports.Raidar = Raidar
module.exports.ReadyNAS = ReadyNAS
