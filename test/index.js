
assert = require('assert')
MongoDB = require('mongodb')
Promise = require('native-or-bluebird')

DB = require('..')
db = new DB(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')

before(function () {
  return db.then(function () {
    collection = db.collection('mongodbtest')
    collection2 = DB.collection(db.raw.collection('mongodbtest2'))
  })
})

before(function (done) {
  db.raw.dropDatabase(done)
})

require('./insert')
require('./search')
require('./update')
require('./remove')
require('./aggregate')
require('./batch')
require('./indexes')
