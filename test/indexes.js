
describe('.ensureIndex()', function () {
  it('(index, options)', function () {
    return collection.ensureIndex({
      thing: 1
    }, {
      background: true
    })
  })
})
