
var Promise = require('native-or-bluebird')

var Query = require('./query')
var utils = require('../../utils')

Query.prototype.setThenToUpdate = function () {
  if (this._then === 'update') return
  this.__promise_function = this.promiseUpdate
  this._then = 'update'
}

Query.prototype.update = function (document, value) {
  if (this._then !== 'update') {
    this.__promise_function = this._one ? this.promiseUpdateOne : this.promiseUpdate
    this._then = 'update'
  }
  this._update(document, value)
  return this
}

Query.prototype.updateOne = function (document, value) {
  this.__promise_function = this.promiseUpdateOne
  this._one = true
  this._then = 'update'
  this._update(document, value)
  return this
}

Query.prototype.upsert = function (document) {
  this.__promise_function = this.promiseUpdateOne
  this._one = true
  this._then = 'update'
  this.options.upsert = true
  this._update(document)
  return this
}

Query.prototype._update = function (document, value) {
  // .update({})
  if (typeof document === 'object') this.document = document
  // .update(key, value)
  else if (value != null) this.document[document] = value
  return this
}

// update operators
;[
  // fields
  'mul',
  'rename',
  'setOnInsert',
  'set',
  'min',
  'max',
  'currentDate',

  // arrays
  'addToSet',
  'pop',
  'pullAll',
  'pull',
  'pushAll',
  'push',

  // other
  'bit',
].forEach(function (op) {
  var $op = '$' + op
  Query.prototype[$op] = function (key, value) {
    this.setThenToUpdate()
    var document = this.document
    var changes = document[$op] = document[$op] || {}
    changes[key] = value
    return this
  }
  if (!Query.prototype[op]) Query.prototype[op] = Query.prototype[$op]
})

// special operators
// .inc('count') increments by 1 by default
Query.prototype.inc = function (key, value) {
  this.setThenToUpdate()
  var document = this.document
  var changes = document.$inc = document.$inc || {}
  changes[key] = value == null ? 1 : value
  return this
}

// unsets the fields
Query.prototype.unset = function (fields) {
  this.setThenToUpdate()
  if (!Array.isArray(fields)) fields = [].slice.call(arguments)
  var document = this.document
  var changes = document.$unset = document.$unset || {}
  fields.forEach(function (field) {
    changes[field] = true
  })
  return this
}

// this only works for a single object
Query.prototype.new = function () {
  this.__promise_function = this.promiseUpdateOne
  this._one = true
  this._then = 'update'
  this.options.new = true
  return this
}

Query.prototype.remove = function () {
  if (this._one) return this.removeOne()
  this.__promise_function = this.promiseRemove
  this._then = 'remove'
  return this
}

Query.prototype.removeOne = function () {
  this.__promise_function = this.promiseUpdateOne
  this._then = 'update'
  this.options.remove = true
  return this
}

// for .update()s with .multi()
Query.prototype.promiseUpdate = function () {
  var self = this
  var options = self.options
  options.multi = true
  return new Promise(function (resolve, reject) {
    self.collection.update(self.criteria, self.document, options, function (err, results) {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

// for .findAndModify(), .findAndRemove(), and .update() without .multi()
Query.prototype.promiseUpdateOne = function () {
  var self = this
  var options = self.options
  options.multi = false
  var isNew = options.new
  return new Promise(function (resolve, reject) {
    self.collection.findAndModify(self.criteria, self.options.sort || [], self.document, options, function (err, doc) {
      if (err) return reject(err)
      if (isNew && self.transform) doc = self.transform(doc)
      resolve(doc)
    })
  })
}

// for any .remove() command except .findAndRemove()
Query.prototype.promiseRemove = function () {
  var self = this
  var options = self.options
  options.single = this._one
  return new Promise(function (resolve, reject) {
    self.collection.remove(self.criteria, options, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

utils.setOptions(Query, [
  'w',
  'wtimeout',
])

utils.enableOptions(Query, [
  'fsync',
  'j',
  'serializeFunctions',
  'checkKeys',
  'fullResult',
])
