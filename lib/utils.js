
var assert = require('assert')
var toArray = require('stream-to-array')

exports.isObjectID = function (obj) {
  if (!obj) return false
  var c = obj.constructor
  /* istanbul ignore if */
  if (!c) return false
  return c.name === 'ObjectID'
}

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
  /* istanbul ignore next */
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

// add all the update operators to a constructor
// call an optional fn on every update
exports.updateify = function (constructor, fname) {
  ;[
    // fields
    'mul',
    'rename',
    'setOnInsert',
    'set',
    'min',
    'max',
    'currentDate',

    // arrays
    'addToSet',
    'pop',
    'pullAll',
    'pull',
    'pushAll',
    'push',

    // other
    'bit',
  ].forEach(function (op) {
    var $op = '$' + op
    constructor.prototype[$op] = function (key, value) {
      if (fname) this[fname]()
      var document = this.document
      if (typeof key === 'object') {
        document[$op] = key
      } else {
        var changes = document[$op] = document[$op] || {}
        changes[key] = value
      }
      return this
    }
    // only set without a $ if it doesn't overwrite another property
    if (!constructor.prototype[op]) constructor.prototype[op] = constructor.prototype[$op]
  })

  // special operators
  // .inc('count') increments by 1 by default
  constructor.prototype.$inc =
  constructor.prototype.inc = function (key, value) {
    if (fname) this[fname]()
    var document = this.document
    if (typeof key === 'object') {
      document.$inc = key
    } else {
      var changes = document.$inc = document.$inc || {}
      changes[key] = value == null ? 1 : value
    }
    return this
  }

  // unsets the fields
  constructor.prototype.$unset =
  constructor.prototype.unset = function (fields) {
    if (fname) this[fname]()
    if (!Array.isArray(fields)) fields = [].slice.call(arguments)
    var document = this.document
    var changes = document.$unset = document.$unset || {}
    fields.forEach(function (field) {
      changes[field] = true
    })
    return this
  }
}

// add .map() with multiple function support
exports.mapify = function (constructor) {
  constructor.prototype._transforms = null
  constructor.prototype.map = function (fn) {
    assert.equal('function', typeof fn)
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
