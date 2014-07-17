
describe('.batch()', function () {
  it('.then()', function (done) {
    var batch = collection.batch()
    batch.insert({
      v: 1
    })
    batch.insert({
      v: 2
    })
    batch.then(function () {
      done()
    })
  })
})

describe('.parallel()', function () {
  it('.then()', function (done) {
    var batch = collection.parallel()
    batch.insert({
      v: 1
    })
    batch.insert({
      v: 2
    })
    batch.then(function () {
      done()
    })
  })
})
