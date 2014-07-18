
var match = {
  agg: true
}

var byValue = {
  _id: '$value',
  count: {
    $sum: 1
  }
}

describe('.aggregate()', function () {
  before(function () {
    return collection.insert([{
      value: 1,
      agg: true
    }, {
      value: 2,
      agg: true
    }, {
      value: 3,
      agg: true
    }])
  })

  it('.match().then()', function () {
    return collection.aggregate().match(match).then(function (docs) {
      assert.equal(3, docs.length)
    })
  })

  it('.match().exec()', function (done) {
    collection.aggregate().match(match).exec(function (err, docs) {
      assert.ifError(err)
      assert.equal(3, docs.length)
      done()
    })
  })

  it('.match().end()', function (done) {
    collection.aggregate().match(match).end(function (err, docs) {
      assert.ifError(err)
      assert.equal(3, docs.length)
      done()
    })
  })

  it('.match().toArray()', function (done) {
    collection.aggregate().match(match).toArray(function (err, docs) {
      assert.ifError(err)
      assert.equal(3, docs.length)
      done()
    })
  })

  describe('.destroy()', function () {
    it('should emit "close"', function (done) {
      var stream = collection.aggregate().match(match).group(byValue)
      // execute the stream
      stream.toArray(noop)

      stream.on('close', done)
      stream.on('error', done)
      stream.destroy()
    })

    it('should still emit "close" if never opened', function () {
      var stream = collection.aggregate().match(match).group(byValue)
      var closed = false
      stream.once('close', function () {
        closed = true
      })
      stream.destroy()
      assert(closed)
    })
  })

  it('.explain()', function () {
    return collection.aggregate().match(match).group(byValue).explain().then(function (doc) {
      assert(doc[0].$cursor)
    })
  })

  it('.map()', function () {
    return collection.aggregate().match(match).map(transform).then(function (docs) {
      assert.equal(3, docs.length)
      assert(transformed(docs))
    })
  })

  it('.setOption(obj)', function () {
    var query = collection.aggregate()
    var options = {}
    query.setOptions(options)
    assert.equal(query.options, options)
  })

  it('.setOption(key, value)', function () {
    var query = collection.aggregate()
    query.setOption('a', true)
    assert.equal(query.options.a, true)
  })
})

function noop() {}

function transform(x) {
  x.transformed = true
  return x
}

function transformed(docs) {
  return docs.every(function (x) {
    return x.transformed
  })
}
