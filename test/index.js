
assert = require('assert')
MongoDB = require('mongodb')
Promise = require('native-or-bluebird')

var wrap = require('..').collection

// collection // wrapped collection
// _collection // raw collection

before(function (done) {
  require('mongodb').MongoClient.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/test', function (err, db) {
      assert.ifError(err)
      assert(db)

      _collection = db.collection('mongodbnext')
      collection = wrap(_collection)
      _collection.drop(function () {
        done()
      })
    }
  )
})

require('./insert')
require('./search')
require('./update')
require('./aggregate')
require('./batch')
