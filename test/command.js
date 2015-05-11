
describe('.command()', function () {
  it('(options)', function () {
    return db.command({
      count: 'mongodbtest'
    }).then(function (result) {
      assert(result.n)
    })
  })
})
