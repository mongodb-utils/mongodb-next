
var Promise = require('native-or-bluebird')

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

Collection.prototype.count = function (criteria) {
  return Query(this.collection).find(criteria).count()
}

Collection.prototype.aggregate = function (options) {
  return Aggregate(this.collection, options)
}

Collection.prototype.insert = function (documents, options) {
  return Insert(this.collection, documents, options)
}

Collection.prototype.remove = function (criteria, options) {
  return Query(this.collection, options).find(criteria).remove()
}

Collection.prototype.ensureIndex = function (spec, options) {
  var collection = this.collection
  return new Promise(function (resolve, reject) {
    collection.ensureIndex(spec, options || {}, function (err, res) {
      /* istanbul ignore next */
      if (err) return reject(err)
      resolve()
    })
  })
}
