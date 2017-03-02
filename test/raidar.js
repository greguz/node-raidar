/**
 * dependencies
 */

var ReadyNAS = require('../libs/readynas')
var Raidar = require('../libs/raidar')
var chai = require('chai')
var expect = chai.expect

/**
 * test definitions
 */

describe('Raidar', function () {

  // default raidar instance
  var raidar

   // runs after each test in this block
  afterEach(function () {

    // close connection
    if (raidar) {

      // clean listeners
      raidar.removeAllListeners()

      // close socket
      if (raidar.isOpen()) raidar.close()

    }

  })

  it('should load without problems', function () {

    // just  require the lib
    raidar = require('..')

  })

  it('should have ReadyNAS constructor', function () {

    // ensure exported ReadyNAS constructor
    expect(raidar.ReadyNAS).to.equal(ReadyNAS)

  })

  it('should have Raidar constructor', function () {

    // ensure exported Raidar constructor
    expect(raidar.Raidar).to.equal(Raidar)

  })

  describe('#isOpen', function () {

    it('should be false on start', function () {

      // perform check
      expect(raidar.isOpen()).to.equal(false)

    })

    it('should be false after closing', function (done) {

      // initiali check
      expect(raidar.isOpen()).to.equal(false)

      // open socket
      raidar.open(function () {

        // mid check
        expect(raidar.isOpen()).to.equal(true)

        // close socket
        raidar.close(function () {

          // final check
          expect(raidar.isOpen()).to.equal(false)

          // all done
          done()

        })

      })

    })

  })

  describe('#request', function () {

    it('should auto-open the socket', function (done) {

      // perform check
      expect(raidar.isOpen()).to.equal(false)

      // exec request
      raidar.request({

        // idle timeout to one second
        timeout: 1000

      }, function (err) {

        // perform check
        expect(raidar.isOpen()).to.equal(true)

        // handle error
        done(err)

      })

    })

  })

})
