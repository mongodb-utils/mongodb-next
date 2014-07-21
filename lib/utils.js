
var assert = require('assert')
var toArray = require('stream-to-array')

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

// proxy the promise function
exports.promisify = function (constructor) {
  constructor.prototype.then = function (resolve, reject) {
    return this.promise.then(resolve, reject)
  }
  constructor.prototype.catch = function (reject) {
    return this.promise.catch(reject)
  }
}

exports.arrayify = function (constructor) {
  constructor.prototype.__promise_function =
  constructor.prototype.toArray = toArray
  Object.defineProperty(constructor.prototype, 'promise', {
    get: promiseFunction
  })
}

function promiseFunction() {
  return this.__promise_function()
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

  constructor.prototype.transform = function (x) {
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
