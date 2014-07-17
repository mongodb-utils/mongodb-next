
describe('collection.insert()', function () {
  it('(document)', function () {
    return collection.insert({
      name: 'jon'
    }).then(function (doc) {
      assert(doc._id)
      assert(!Array.isArray(doc))
    })
  })

  it('([documents...])', function () {
    return collection.insert([{
      value: 1
    }, {
      value: 2
    }]).then(function (docs) {
      assert(Array.isArray(docs))
      assert.equal(2, docs.length)
      docs.forEach(function (doc, i) {
        assert.equal(doc.value, i + 1)
        assert(doc._id)
      })
    })
  })

  it('.exec()', function (done) {
    collection.insert({
      something: 'asdf'
    }).exec(done)
  })

  it('.w(value)', function () {
    var promise = collection.insert({
      something: 'klajsdlfjk'
    }).w('majority')
    assert.equal('majority', promise.options.w)
  })

  it('.j()', function () {
    var promise = collection.insert({
      something: 'klajsdlfjk'
    }).j()
    assert.equal(true, promise.options.j)
  })
})
