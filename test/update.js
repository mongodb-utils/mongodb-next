
describe('.find().update()', function () {
  it('(document)', function () {
    return collection.find().update({
      $set: {
        asdf: 1
      }
    }).then(function () {
      return collection.find()
    }).then(function (docs) {
      assert(docs.length > 1)
      assert(docs.every(function (doc) {
        return doc.asdf === 1
      }))
    })
  })

  it('(key, value)', function () {
    return collection.find().update('$set', {
      asdf: 2
    }).then(function () {
      return collection.find()
    }).then(function (docs) {
      assert(docs.length > 1)
      assert(docs.every(function (doc) {
        return doc.asdf === 2
      }))
    })
  })

  it('.set(key, value)', function () {
    return collection.find().set('asdf', 3).then(function () {
      return collection.find()
    }).then(function (docs) {
      assert(docs.length > 1)
      assert(docs.every(function (doc) {
        return doc.asdf === 3
      }))
    })
  })

  it('.j()', function () {
    var promise = collection.find().update().j()
    assert(promise.options.j)
  })
})

describe('.find().updateOne()', function () {
  it('.set()', function () {
    return collection.find().updateOne().set('asdf', 4).then(function (doc) {
      assert(!Array.isArray(doc))
      return collection.find()
    }).then(function (docs) {
      assert(docs.length > 1)
      assert.equal(1, docs.filter(function (x) {
        return x.asdf === 4
      }).length)
    })
  })
})

describe('.find().upsert()', function () {
  it('(document)', function () {
    return collection.find({
      name: 'taylor'
    }).upsert({
      name: 'taylor',
      value: 100
    }).then(function (doc) {
      return collection.find('name', 'taylor').count()
    }).then(function (count) {
      assert.equal(1, count)
    })
  })

  it('.new()', function () {
    return collection.find({
      name: 'taylor2'
    }).upsert({
      name: 'taylor2',
      value: 100
    }).new().then(function (doc) {
      assert.equal('taylor2', doc.name)
      assert.equal(100, doc.value)
      return collection.find('name', 'taylor2').count()
    }).then(function (count) {
      assert.equal(1, count)
    })
  })
})

describe('.find().update().new()', function () {
  it('(document)', function () {
    return collection.find({
      name: 'taylor'
    }).update({
      $set: {
        value: 101
      }
    }).new().then(function (doc) {
      assert.equal('taylor', doc.name)
      assert.equal(101, doc.value)
      return collection.find('name', 'taylor').find('value', 101).count()
    }).then(function (count) {
      assert.equal(1, count)
    })
  })

  it('.map()', function () {
    return collection.find({
      name: 'taylor'
    }).update({
      $set: {
        value: 102
      }
    }).new().map(function (x) {
      x.transformed = true
      return x
    }).then(function (doc) {
      assert.equal('taylor', doc.name)
      assert.equal(102, doc.value)
      assert(doc.transformed)
      return collection.find('name', 'taylor').count()
    }).then(function (count) {
      assert.equal(1, count)
    })
  })
})

describe('.find().update().remove()', function () {
  it('(document)', function () {
    return collection.find({
      name: 'taylor2'
    }).remove().then(function () {
      return collection.find('name', 'taylor2').count()
    }).then(function (count) {
      assert.equal(0, count)
    })
  })
})

describe('.find().new().update()', function () {
  // order matters
  it('(document)', function () {
    return collection.find({
      name: 'taylor'
    }).new().update({
      $set: {
        qqqq: 1
      }
    }).then(function (doc) {
      assert.equal('taylor', doc.name)
      assert.equal(1, doc.qqqq)
      return collection.find('name', 'taylor').find('qqqq', 1).count()
    }).then(function (count) {
      assert.equal(1, count)
    })
  })
})
