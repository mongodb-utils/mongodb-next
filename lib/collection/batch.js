
var Promise = require('native-or-bluebird')

var Collection = require('./collection')

/**
 * To do: wrap these to make the API closer to Query
 */

Collection.prototype.batch = function () {
  return wrap(this.collection.initializeOrderedBulkOp())
}

Collection.prototype.parallel = function () {
  return wrap(this.collection.initializeUnorderedBulkOp())
}

function wrap(batch) {
  // why does this have to be a getter!?
  Object.defineProperty(batch, 'promise', {
    get: function () {
      return new Promise(function (resolve, reject) {
        batch.execute(function (err, result) {
          if (err) reject(err)
          else resolve(result)
        })
      })
    }
  })
  batch.then = then
  batch.catch = _catch
  batch.exec = batch.execute
  return batch
}

function then(resolve, reject) {
  return this.promise.then(resolve, reject)
}

function _catch(reject) {
  return this.promise.catch(reject)
}
