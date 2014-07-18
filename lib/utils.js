
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

// add .toArray() and the default .then()
exports.arrayify = function (constructor) {
  constructor.prototype.toArray = toArray
  constructor.prototype.then =
  constructor.prototype.thenFind = function (resolve, reject) {
    return toArray(this).then(resolve, reject)
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
