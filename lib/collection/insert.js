
var Promise = require('native-or-bluebird')

var utils = require('../utils')

module.exports = Insert

utils.execify(Insert)
utils.optionify(Insert)
utils.promisify(Insert)

function Insert(collection, docs, options) {
  if (!(this instanceof Insert)) return new Insert(collection, docs, options)

  this.collection = collection
  this.documents = docs
  this.options = options || {}
}

Object.defineProperty(Insert.prototype, 'promise', {
  get: function () {
    var self = this
    return new Promise(function (resolve, reject) {
      var docs = self.documents
      self.collection.insert(docs, self.options, function (err) {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }
})

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
