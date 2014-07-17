
var Promise = require('native-or-bluebird')
var Aggregate = require('aggregate-stream')

var Query = require('./query')
var Insert = require('./insert')

module.exports = Collection

function Collection(collection) {
  if (!(this instanceof Collection)) return new Collection(collection)
  this.collection = collection
}

Collection.prototype.find = function (criteria, value) {
  return Query(this.collection).find(criteria, value)
}

Collection.prototype.findOne = function (criteria, value) {
  return Query(this.collection).findOne(criteria, value)
}

Collection.prototype.aggregate = function (options) {
  return Aggregate(this.collection, options)
}

Collection.prototype.insert = function (documents, options) {
  return Insert(this.collection, documents, options)
}

// to do: wrap these as well to make it closer to Query
Collection.prototype.batch = function () {
  var batch = this.collection.initializeOrderedBulkOp()
  batch.then = thenExecute
  batch.exec = batch.execute
  return batch
}

Collection.prototype.parallel = function () {
  var batch = this.collection.initializeUnorderedBulkOp()
  batch.then = thenExecute
  batch.exec = batch.execute
  return batch
}

function thenExecute(resolve, reject) {
  var self = this
  return new Promise(function (resolve, reject) {
    self.execute(function (err, result) {
      if (err) reject(err)
      else resolve(result)
    })
  }).then(resolve, reject)
}
