
var Promise = require('native-or-bluebird')

var Collection = require('./collection')

/**
 * To do: wrap these to make the API closer to Query
 */

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
