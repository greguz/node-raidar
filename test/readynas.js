/**
 * dependencies
 */

var chai = require('chai')
var expect = chai.expect
var ReadyNAS = require('../libs/readynas')
var path = require('path')
var fs = require('fs')

/**
 * test definitions
 */

describe('ReadyNAS', function () {

  // instance var
  var dump, nas

  // runs before all tests in this block
  before(function (done) {

    // dump path
    var file = path.join(__dirname, 'dump.readynas')

    // read target file
    fs.readFile(file, function (err, data) {

      // save data
      dump = data

      // handle error
      done(err)

    })

  })

  it('should instance without problems', function () {

    nas = new ReadyNAS(dump)

  })

  it('should serialize to JSON', function () {

    nas.toJSON()

  })

  describe(':: basic data', function () {

    it('should extract MAC address', function () {

      expect(nas.mac()).to.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)

    })

    it('should extract hostname', function () {

      expect(nas.hostname()).to.equal('acme-swhouse')

    })

    it('should extract IP', function () {

      expect(nas.ip()).to.equal('192.168.1.5')

    })

    it('should extract version', function () {

      expect(nas.version()).to.equal('6.6.1')

    })

    it('should extract serial number', function () {

      expect(nas.serial()).to.equal('0123456789ABC')

    })

  })

  describe(':: disks', function () {

    it('should count the number of disks', function () {

      expect(nas.diskCount()).to.equal(2)

    })

    it('should get disk status', function () {

      expect(nas.diskInfo(1)).to.equal('ok')

    })

    it('should get disk channel', function () {

      var channel = 1

      expect(nas.diskInfo(channel, 'channel')).to.equal(channel)

    })

    it('should get disk model', function () {

      expect(nas.diskInfo(1, 'model')).to.equal('WDC_WD40EFRX-68WT0N0 4TB')

    })

    it('should get disk temperature', function () {

      expect(nas.diskInfo(1, 'celsius')).to.be.within(0, 60)
      expect(nas.diskInfo(1, 'fahrenheit')).to.be.within(32, 140)

    })

  })

  describe(':: volumes', function () {

    it('should count the number of volumes', function () {

      expect(nas.volumeCount()).to.equal(1)

    })

    it('should get volume status', function () {

      expect(nas.volumeInfo(1)).to.equal('ok')

    })

    it('should get RAID level', function () {

      expect(nas.volumeInfo(1, 'level')).to.equal('1')

    })

    it('should get volume status description', function () {

      expect(nas.volumeInfo(1, 'message')).to.equal('Redundant')

    })

    it('should get volume size', function () {

      expect(typeof nas.volumeInfo(1, 'size')).to.equal('number')

    })

    it('should get volume used space', function () {

      expect(typeof nas.volumeInfo(1, 'used')).to.equal('number')

    })

  })

})
