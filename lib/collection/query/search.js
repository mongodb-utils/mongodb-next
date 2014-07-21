
var Promise = require('native-or-bluebird')

var Query = require('./query')
var utils = require('../../utils')

Query.prototype.find = function (criteria, value) {
  this._find(criteria, value)
  return this
}

Query.prototype.findOne = function (criteria, value) {
  this._find(criteria, value)
  this.limit(-1).batchSize(1)
  this.then = this.thenFindOne
  this._one = true
  return this
}

Query.prototype._find = function (criteria, value) {
  // .find({})
  if (typeof criteria === 'object') this.criteria = criteria
  // .find(key, value)
  else if (value !== undefined) this.criteria[criteria] = value
  return this
}

Query.prototype.count = function () {
  this.then = this.thenCount
  return this
}

Query.prototype.explain = function () {
  this.then = this.thenExplain
  return this
}

// query operators
;[
  'or',
  'and',
].forEach(function (op) {
  var $op = '$' + op
  Query.prototype[op] = function (arr) {
    // .or(<this>).or(<that>)
    // or
    // .or([<this>, <that>])
    var criteria = this.criteria
    criteria[$op] = (criteria[$op] || []).concat(arr)
    return this
  }
})

// create a filter
Query.prototype._cursor = function () {
  return this.collection.find(this.criteria, this.options)
}

Query.prototype._read = function () {
  if (this.closed) return this

  var self = this
  var cursor = this.cursor = this.cursor || this._cursor()

  cursor.nextObject(function (err, doc) {
    if (err) return self.destroy(err)
    if (doc) return self.push(self.transform(doc))

    self.push(null)
    setImmediate(function () {
      // close after the stream emits end
      self.destroy()
    })
  })

  return this
}

Query.prototype.closed = false
Query.prototype.destroy = function (err) {
  if (this.closed) return this
  this.closed = true

  if (err && err instanceof Error) this.emit('error', err)
  var cursor = this.cursor
  // close only if the cursor is not yet closed
  if (cursor && !cursor.isClosed()) cursor.close()
  this.emit('close')
  return this
}

// for .findOne() calls
Query.prototype.thenFindOne = function (resolve, reject) {
  var self = this
  return new Promise(function (resolve, reject) {
    var cursor = self._cursor()
    cursor.nextObject(function (err, doc) {
      cursor.close()
      if (err) return reject(err)
      resolve(self.transform(doc))
    })
  }).then(resolve, reject)
}

Query.prototype.thenExplain = function (resolve, reject) {
  var self = this
  return new Promise(function (resolve, reject) {
    var options = Object.create(self.options)
    options.explain = true
    self.collection.find(self.criteria, options).toArray(function (err, result) {
      if (err) reject(err)
      else resolve(result.shift())
    })
  }).then(resolve, reject)
}

Query.prototype.thenCount = function (resolve, reject) {
  var self = this
  return new Promise(function (resolve, reject) {
    self.collection.count(self.criteria || {}, self.options, function (err, count) {
      if (err) reject(err)
      else resolve(count)
    })
  }).then(resolve, reject)
}

utils.setOptions(Query, [
  'limit',
  'sort',
  'fields',
  'skip',
  'hint',
  'tailableRetryInterval',
  'numberOfRetries',
  'batchSize',
  'maxScan',
  'comment',
  'readPreference',
  'maxTimeMS',
])

utils.enableOptions(Query, [
  'snapshot',
  'timeout',
  'tailable',
  'awaitdata',
  'oplogReplay',
  'exhaust',
  'returnkey',
  'showDiskLoc',
  'raw',
  'partial',
])
