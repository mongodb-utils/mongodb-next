
var inherits = require('util').inherits
var Readable = require('stream').Readable
var toArray = require('stream-to-array')
var Promise = require('native-or-bluebird')

var utils = require('../utils')

inherits(Aggregate, Readable)
utils.execify(Aggregate)

module.exports = Aggregate

function Aggregate(collection, options) {
  if (!(this instanceof Aggregate)) return new Aggregate(collection, options)

  // readable mode for streaming the cursor
  Readable.call(this, {
    objectMode: true
  })

  this.collection = collection
  this.options = options = options || {}
  options.cursor = options.cursor || {} // we always use a cursor
  this.pipeline = []
}

// all the supported operators
// http://docs.mongodb.org/manual/meta/aggregation-quick-reference/#aggregation-operator-quick-reference
var operators = [
  'project',
  'match',
  'redact',
  'limit',
  'skip',
  'unwind',
  'group',
  'sort',
  'geoNear',
  'out',
]

operators.forEach(function (operator) {
  var key = '$' + operator
  Aggregate.prototype[operator] = function (obj) {
    var o = {}
    o[key] = obj
    this.pipeline.push(o)
    return this
  }
})

// set a transform function
Aggregate.prototype.map = function (fn) {
  this._transform = fn
  return this
}

Aggregate.prototype.toArray = toArray
// .then() is just a shortcut for .toArray()
Aggregate.prototype.then = function (resolve, reject) {
  return toArray(this).then(resolve, reject)
}

// https://github.com/mongodb/node-mongodb-native/blob/master/lib/mongodb/aggregation_cursor.js
// note: the cursor itself is a readable stream, but we reimplement it
// maybe pipe in through here or something...?
Aggregate.prototype._read = function () {
  if (this.destroyed) return
  var self = this
  var cursor =
  this.cursor =
  this.cursor || this.collection.aggregate(this.pipeline, this.options)

  cursor.next(function (err, result) {
    if (err) return self.destroy(err)
    if (!result) return self.push(null)
    var transform = self._transform
    if (transform) result = transform(result)
    self.push(result)
  })
}

Aggregate.prototype.destroyed = false
// close the cursor prematurely
Aggregate.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  if (err && err instanceof Error) this.emit('error', err)
  var cursor = this.cursor
  if (!cursor) return this.emit('close') // not yet opened
  var self = this
  // WOW MONGODB IS BROKEN
  // cursor.close(function (err) {
    // should we even bother emitting this error?
    // if (err) self.emit('error', err)
    self.emit('close')
  // })
  return this
}

Aggregate.prototype.explain = function () {
  this.then = this.thenExplain
  return this
}

Aggregate.prototype.thenExplain = function (resolve, reject) {
  // maybe we should use the same cursor for this?
  var self = this
  return new Promise(function (resolve, reject) {
    self.collection.aggregate(self.pipeline, self.options).explain(function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })
  }).then(resolve, reject)
}
