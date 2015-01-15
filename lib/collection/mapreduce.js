
var Promise = require('native-or-bluebird')
var collection = require('./collection')
var utils = require('../utils')
var memo = require('memorizer')

module.exports = MapReduce

utils.execify(MapReduce)
utils.optionify(MapReduce)
utils.promisify(MapReduce)

function MapReduce(collection, options) {
  if (!(this instanceof MapReduce)) return new MapReduce(collection, options)

  this.collection = collection
  this.options = options = options || {}
}

memo(MapReduce.prototype, 'promise', function () {
  var self = this
  var options = self.options
  if (!options.out) options.out = { inline: 1 }
  return new Promise(function (resolve, reject) {
    var map = options.map
    var reduce = options.reduce
    delete options.map
    delete options.reduce
    self.collection.mapReduce(map, reduce, options, function (err, result) {
      if (err) return reject(err)
      if (Array.isArray(result)) return resolve(result)
      // collection
      resolve(collection(result))
    })
  })
})

var operators = [
  'map',
  'reduce',
  'finalize'
]

operators.forEach(function (operator) {
  MapReduce.prototype[operator] = function (fn) {
    this.options[operator] = fn;
    return this
  }
})

utils.setOptions(MapReduce, [
  'out',
  'sort',
  'query',
  'limit',
  'scope'
])


utils.enableOptions(MapReduce, [
  'jsMode',
  'verbose'
])
