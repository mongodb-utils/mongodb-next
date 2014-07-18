
var Collection = module.exports = require('./collection')

var Query = require('./query')
var Insert = require('./insert')
var Aggregate = require('./aggregate')

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
