
var MongoClient = require('mongodb').MongoClient
var Promise = require('native-or-bluebird')
var assert = require('assert')

var wrap = DB.collection = require('./collection')

module.exports = DB

function DB(uri, options) {
  if (!(this instanceof DB)) return new DB(uri, options)

  this.connect = this._connect(uri, options)
}

DB.prototype._connect = function (uri, options) {
  var self = this
  return new Promise(function (resolve, reject) {
    MongoClient.connect(uri, options || {}, function (err, db) {
      /* istanbul ignore if */
      if (err) return reject(err)
      resolve(self.raw = db)
    })
  })
}

DB.prototype.then = function (resolve, reject) {
  return this.connect.then(resolve, reject)
}

/* istanbul ignore next */
DB.prototype.catch = function (reject) {
  return this.connect.catch(reject)
}

DB.prototype.collection = function (name) {
  if (this[name]) return this[name]
  assert(this.raw, 'Wait to connect first!')
  return this[name] = wrap(this.raw.collection(name))
}
