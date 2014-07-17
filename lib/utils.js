
exports.nodeify = function (promise, cb) {
  promise.then(function (res) {
    cb(null, res)
  }, cb)
}
