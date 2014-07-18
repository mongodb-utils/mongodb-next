
var toArray = require('stream-to-array')
var assert = require('assert')

// add a .end(cb) or .exec(cb) function
exports.execify = function (constructor) {
  constructor.prototype.end =
  constructor.prototype.exec = function (cb) {
    this.then(function (res) {
      cb(null, res)
    }, cb)
    return this
  }
}

// add .setOption() and .setOptions() to each constructor
exports.optionify = function (constructor) {
  constructor.prototype.setOption =
  constructor.prototype.setOptions = function (key, value) {
    if (typeof key === 'object') {
      this.options = key
      return this
    }

    this.options[key] = value
    return this
  }
}

// add .toArray() and the default .then()
exports.arrayify = function (constructor) {
  constructor.prototype.toArray = toArray
  constructor.prototype.then =
  constructor.prototype.thenFind = function (resolve, reject) {
    return toArray(this).then(resolve, reject)
  }
}

// add .map() with multiple function support
exports.mapify = function (constructor) {
  constructor.prototype._transforms = null
  constructor.prototype.map = function (fn) {
    assert('function', typeof fn)
    var transforms = this._transforms = this._transforms || []
    transforms.push(fn)
    return this
  }

  constructor.prototype._transform = function (x) {
    var transforms = this._transforms
    if (!transforms) return x
    for (var i = 0; i < transforms.length; i++)
      x = transforms[i].call(this, x)
    return x
  }
}

// #[option](value)
exports.setOptions = function (constructor, options) {
  options.forEach(function (option) {
    constructor.prototype[option] = function (value) {
      this.options[option] = value
      return this
    }
  })
}

// #[option]() to enable
exports.enableOptions = function (constructor, options) {
  options.forEach(function (option) {
    constructor.prototype[option] = function (value) {
      this.options[option] = value !== false
      return this
    }
  })
}
