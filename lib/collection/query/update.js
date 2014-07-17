
var Promise = require('native-or-bluebird')

var Query = require('./query')

Query.prototype.update = function (document, value) {
  if (this._then !== 'update') {
    this.then = this.thenUpdate
    this._then = 'update'
  }
  this._update(document, value)
  return this
}

Query.prototype.updateOne = function (document, value) {
  this.then = this.thenUpdateOne
  this._then = 'update'
  this._update(document, value)
  return this
}

Query.prototype.upsert = function (document) {
  this.then = this.thenUpdateOne
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
  'inc',
  'mul',
  'rename',
  'setOnInsert',
  'set',
  'unset',
  'min',
  'max',
  'currentDate'
].forEach(function (op) {
  var $op = '$' + op
  Query.prototype[op] = function (key, value) {
    if (this._then !== 'update') this.then = this.thenUpdate
    var document = this.document
    var changes = document[$op] = document[$op] || {}
    changes[key] = value
    return this
  }
})

Query.prototype.new = function () {
  this.then = this.thenUpdateOne
  this._then = 'update'
  this.options.new = true
  return this
}

Query.prototype.remove = function () {
  this.then = this.thenUpdateOne
  this._then = 'update'
  this.options.remove = true
  return this
}

// for .update()s with .multi()
Query.prototype.thenUpdate = function (resolve, reject) {
  var self = this
  var options = self.options
  options.multi = true
  return new Promise(function (resolve, reject) {
    self.collection.update(self.criteria, self.document, options, function (err, results) {
      if (err) reject(err)
      else resolve(results)
    })
  }).then(resolve, reject)
}

// for .findAndModify(), .findAndRemove(), and .update() without .multi()
Query.prototype.thenUpdateOne = function (resolve, reject) {
  var self = this
  var options = self.options
  options.multi = false
  var isNew = options.new
  return new Promise(function (resolve, reject) {
    self.collection.findAndModify(self.criteria, self.options.sort || [], self.document, options, function (err, doc) {
      if (err) return reject(err)
      if (isNew && self._transform) doc = self._transform(doc)
      resolve(doc)
    })
  }).then(resolve, reject)
}
