
var Readable = require('stream').Readable
var inherits = require('util').inherits

var utils = require('../../utils')

inherits(Query, Readable)

utils.mapify(Query)
utils.execify(Query)
utils.arrayify(Query)
utils.promisify(Query)
utils.optionify(Query)

module.exports = Query

function Query(collection, options) {
  if (!(this instanceof Query)) return new Query(collection, options)

  Readable.call(this, {
    objectMode: true
  })

  this.collection = collection
  this.criteria = {}
  this.document = {}
  this.options = options || {}
  // which type of .then() is set
  this._then = 'query'
}

// by default, this is a .find() operation
Query.prototype._then = 'query'
// by default, multiple documents are returned
Query.prototype._one = false
