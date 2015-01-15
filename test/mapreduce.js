
var assert = require('assert')

describe('.mapReduce()', function () {
  var map = function () {
    emit(this.name, this.score)
  }
  var reduce = function (key, values) {
    return Array.sum(values)
  }
  var out = {
    replace: 'mongodbtest3'
  }

  before(function () {
    return collection.insert([{
      name: 'A',
      score: 11
    }, {
      name: 'A',
      score: 12
    }, {
      name: 'B',
      score: 13
    }, {
      name: 'B',
      score: 14
    }])
  })

  it('.map().reduce().then()', function () {
    return collection.mapReduce().map(map).reduce(reduce).then(function (result) {
      assertResult(result)
    })
  })

  it('.map().reduce().out(opt).then()', function () {
    return collection.mapReduce()
      .map(map)
      .reduce(reduce)
      .out(out)
      .then(function (col) {
        assert.equal(col.collection.s.name, 'mongodbtest3')
        return col.findOne({
          _id: 'A'
        }).then(function (doc) {
          assert.equal(doc.value, 23)
        })
      })
  })

  it('.map().reduce().out(name).then()', function () {
    return collection.mapReduce()
      .map(map)
      .reduce(reduce)
      .out('mongodbtest4')
      .then(function (col) {
        assert.equal(col.collection.s.name, 'mongodbtest4')
        return col.findOne({
          _id: 'A'
        }).then(function (doc) {
          assert.equal(doc.value, 23)
        })
      })
  })

  it('.map().reduce().exec()', function (done) {
    collection.mapReduce().map(map).reduce(reduce).exec(function (err, result) {
      assert.ifError(err)
      assertResult(result)
      done()
    })
  })

  it('.map().reduce().end()', function (done) {
    collection.mapReduce().map(map).reduce(reduce).end(function (err, result) {
      assert.ifError(err)
      assertResult(result)
      done()
    })
  })

  it('.setOption(obj)', function () {
    var mapReduce = collection.mapReduce()
    var options = {
      map: map,
      reduce: reduce,
      out: out
    }
    mapReduce.setOptions(options)
    assert.deepEqual(mapReduce.options, options)
  })

  it('.setOption(key, value)', function () {
    var mapReduce = collection.mapReduce()
    mapReduce.setOption('out', out)
    assert.deepEqual(mapReduce.options.out, out)
  })

  it('.[enableOption](value)', function () {
    var mapReduce = collection.mapReduce()
    mapReduce.verbose(true)
    assert.equal(mapReduce.options.verbose, true)
  })

  function assertResult(result) {
    assert(Array.isArray(result))

    var total = 0;
    result.forEach(function (obj) {
      if (obj._id === 'A' || obj._id === 'B') total += obj.value
    })
    assert.equal(total, 50)
  }
})
