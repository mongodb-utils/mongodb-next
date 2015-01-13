
var Promise = require('native-or-bluebird')

var Query = require('./query')
var utils = require('../../utils')

utils.updateify(Query, 'setThenToUpdate')

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
      if (err) return reject(err)
      var result = results.result || results
      if (result.nModified != null) return resolve(result.nModified)
      resolve(result)
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
      if (isMongoDB2Result(doc)) doc = doc.value
      if (isNew && self.transform) doc = self.transform(doc)
      resolve(doc)
    })
  })
}

function isMongoDB2Result(doc) {
  return doc && 'value' in doc && 'ok' in doc
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
