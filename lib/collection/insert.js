
var Promise = require('native-or-bluebird')

var utils = require('../utils')

module.exports = Insert

utils.execify(Insert)

function Insert(collection, docs, options) {
  if (!(this instanceof Insert)) return new Insert(collection, docs, options)

  this.collection = collection
  this.documents = docs
  this.options = options || {}
}

Insert.prototype.then = function (resolve, reject) {
  var self = this
  var docs = this.documents
  return new Promise(function (resolve, reject) {
    self.collection.insert(docs, self.options, function (err) {
      if (err) reject(err)
      else resolve(docs)
    })
  }).then(resolve, reject)
}

utils.setOptions(Insert, [
  'w',
  'wtimeout',
])

utils.enableOptions(Insert, [
  'fsync',
  'j',
  'serializeFunctions',
  'checkKeys',
  'fullResult',
])
