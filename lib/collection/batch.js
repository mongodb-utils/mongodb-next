
var Promise = require('native-or-bluebird')
var memo = require('memorizer')

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
  memo(batch, 'promise', promisify)
  batch.then = then
  batch.catch = _catch
  batch.exec = batch.execute
  return batch
}

function promisify() {
  var batch = this
  return new Promise(function (resolve, reject) {
    batch.execute(function (err, result) {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

function then(resolve, reject) {
  return this.promise.then(resolve, reject)
}

/* istanbul ignore next */
function _catch(reject) {
  return this.promise.catch(reject)
}
