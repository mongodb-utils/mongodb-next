
describe('collection.find()', function () {
  it('(criteria)', function () {
    return collection.find({
      name: 'jon'
    }).then(function (docs) {
      assert(docs.length)
      assert(docs.every(function (doc) {
        return doc.name === 'jon'
      }))
    })
  })

  it('(ObjectID)', function () {
    var doc = {
      qwer: 1
    }
    return collection.insert(doc).then(function (doc) {
      assert(doc._id)
      return collection.findOne(doc._id)
    }).then(function (res) {
      assert(res._id.equals(doc._id))
    })
  })

  it('(key, value)', function () {
    return collection.find('name', 'jon').then(function (docs) {
      assert(docs.length)
      assert(docs.every(function (doc) {
        return doc.name === 'jon'
      }))
    })
  })

  it('.pipe()', function (done) {
    var stream = collection.find()
    var value = false
    stream.resume()
    stream.on('data', function () {
      value = true
    })
    stream.on('error', done)
    stream.on('end', function () {
      assert(value)
      done()
    })
  })

  it('.exec()', function (done) {
    collection.find().exec(function (err, arr) {
      assert.ifError(err)
      assert(Array.isArray(arr))
      assert(arr.length)
      done()
    })
  })

  it('.then()', function () {
    return collection.find().then(function (arr) {
      assert(Array.isArray(arr))
      assert(arr.length)
    })
  })

  it('.destroy()', function (done) {
    var stream = collection.find()
    stream.once('readable', function () {
      stream.destroy()
      assert(stream.cursor.isClosed())
      done()
    })
    stream.on('error', done)
  })

  it('.map()', function () {
    collection.find().map(function (x) {
      x.transformed = true
      return x
    }).then(function (docs) {
      assert(docs.every(function (x) {
        return x.transformed
      }))
    })
  })

  it('.explain()', function () {
    return collection.find().explain().then(function (doc) {
      assert(doc.cursor)
      assert(doc.n)
    })
  })

  it('.explain().exec()', function (done) {
    collection.find().explain().exec(function (err, doc) {
      assert.ifError(err)
      assert(doc.cursor)
      assert(doc.n)
      done()
    })
  })

  it('.count()', function () {
    return collection.find().count()
    .then(function (count) {
      assert(count)
      assert('number', typeof count)
    })
  })

  it('.count().exec()', function () {
    collection.find().explain().count(function (err, count) {
      assert.ifError(err)
      assert(count)
      assert('number', typeof count)
      done()
    })
  })

  it('.limit()', function () {
    return collection.find().limit(-1).then(function (docs) {
      assert.equal(1, docs.length)
    })
  })

  it('.or()', function () {
    return collection.insert([{
      r: 1
    }, {
      r: 2
    }]).then(function () {
      return collection.find().or({
        r: 1
      }).or({
        r: 2
      }).count()
    }).then(function (count) {
      assert.equal(2, count)
    })
  })
})

describe('collection.findOne()', function () {
  it('.then()', function () {
    return collection.findOne().then(function (doc) {
      assert(!Array.isArray(doc))
      assert(doc._id)
    })
  })

  it('.map().then()', function () {
    return collection.findOne().map(function (x) {
      x.transformed = true
      return x
    }).then(function (doc) {
      assert(!Array.isArray(doc))
      assert(doc._id)
      assert(doc.transformed)
    })
  })
})
