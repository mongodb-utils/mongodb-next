
describe('.remove()', function () {
  it('(obj)', function () {
    return collection.insert([{
      remove: true,
      value: 1
    }, {
      remove: true,
      value: 2
    }]).then(function () {
      return collection.remove({
        remove: true
      })
    }).then(function () {
      return collection.find({
        remove: true
      }).count()
    }).then(function (count) {
      assert.equal(0, count)
    })
  })
})

describe('.find().remove()', function () {
  it('(document)', function () {
    return collection.insert([{
      remove: true,
      value: 1
    }, {
      remove: true,
      value: 2
    }]).then(function () {
      return collection.find({
        remove: true
      }).remove()
    }).then(function () {
      return collection.find({
        remove: true
      }).count()
    }).then(function (count) {
      assert.equal(0, count)
    })
  })
})

describe('.findOne().remove()', function () {
  it('(document)', function () {
    var value
    return collection.insert([{
      remove: true,
      value: 1
    }, {
      remove: true,
      value: 2
    }]).then(function () {
      return collection.findOne({
        remove: true
      }).remove()
    }).then(function (doc) {
      assert(doc.remove)
      assert(value = doc.value)

      return collection.find({
        remove: true
      })
    }).then(function (docs) {
      assert.equal(1, docs.length)
      assert(docs.shift().value !== value)
    })
  })
})
