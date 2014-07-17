
var Collection = module.exports = require('./collection')

var Aggregate = require('aggregate-stream')
var Query = require('./query')
var Insert = require('./insert')

require('./batch')

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
