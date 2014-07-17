
describe('.aggregate()', function () {
  it('.match().then()', function () {
    return collection.aggregate().match({
      name: 'taylor'
    }).then(function (docs) {
      assert.equal(1, docs.length)
    })
  })
})
