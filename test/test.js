var assert    = require('assert'),
    raidar    = require('../lib/raidar'),
    ReadyNAS  = raidar.ReadyNAS;

describe('ReadyNAS', function() {
  it('should work', function() {
    var nas = new ReadyNAS(new Buffer(0));

    assert.equal(true, nas instanceof ReadyNAS);
  });
});