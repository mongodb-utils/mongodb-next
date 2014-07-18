
# mongodb-next

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]

A MongoDB API wrapper with:

- A fluent, chaining API
- Promise support
- Streams2 support
- Bulk write support

All methods return promises, so your code now looks like this:

```js
var wrap = require('mongodb-next').collection
var collection = wrap(db.collection('test'))

var batch = collection.batch() // ordered batched writes
batch.insert({a: 1})
batch.insert({b: 2})
batch.then(function () {
  return collection.findOne('a', 1).readPreference('secondaryPreferred')
}).then(function (doc) {
  return collection.find(doc._id).updateOne('a', 2).w('majory')
})
```

Or if you use something like [co](https://github.com/visionmedia/co):

```js
co(function* () {
  var batch = collection.batch()
  batch.insert({a: 1})
  batch.insert({b: 2})
  yield batch
  var doc = yield collection.findOne('a', 1).readPreference('secondaryPreferred')
  var doc2 = collection.find(doc._id).updateOne('a', 2).w('majory').new()
})()
```

This is similar to [mquery](https://github.com/aheckmann/mquery),
but has proper Promise/yieldable support and avoids long method names
like `.findOneAndRemove()`. It's also much fewer lines of code.

## Context

[Christian](https://github.com/christkv),
the maintainer of [node-mongodb-native](https://github.com/mongodb/node-mongodb-native),
is interested in a version of the MongoDB driver that supports native promises
as well as other ES6+ features. However, this won't remotely be a possibility
until after v3.0 of the driver is out (we're still on v1).

I expressed my interest in creating a well defined API, and this is
what I consider ideal. As Christian is [refactoring the driver](https://github.com/christkv/mongodb-core),
this may, in the future, be an alternative API.

## Compatibility

This library uses promises extensively. Currently, it uses [bluebird](https://github.com/petkaantonov/bluebird),
but it will eventually switch to native promises.

This library also only supports MongoDB 2.6+, but most commands will
still work with MongoDB 2.4 and any MongoDB driver that shims
various 2.6 commands for 2.4.

## API

```js
var wrap = require('mongodb-next').collection
```

For now, this module only wraps MongoDB collections,
meaning you still need the `mongodb` library to connect to your
database and such.

### wrap(collection)

The primary constructor wraps a MongoDB Collection.

```js
var collection = wrap(db.collection('test'))
```

### Entry Points

Only a few methods are available on `collection` itself:

- `.find()` - for searching or updating multiple documents
- `.findOne()` - for searching or updating a single document
- `.insert()` - for inserting documents
- `.remove()` - remove documents, shortcut for `.find().remove()`
- `.aggregate()` - for aggregations
- `.batch()` - to create sequential bulk writes
- `.parallel()` - to create parallel bulk writes

The API is somewhat subject to change so they won't be documented thoroughly.
If what you "expect" to work does not work, please let us know so we can
figure out how to improve the API. If you're in doubt, look at the code.

### Options

Most options are available as chainable methods.

```js
collection.insert({
  name: 'username'
}).w('majority'))
```

Update operators are also methods with the `$` prefix as well as without
if there are no conflicts:

```js
collection.find({
  name: 'username'
}).set('name', 'new_username').w('majority')

// there's no .push() because that's a streams2 API method name
collection.find({
  name: 'username'
}).$push('names', 'new_username')
```

### Promises

All methods have `.then()`.

```js
collection.find().then(function (docs) {

}, function (err) {

})
```

These are __NOT__ real promise implementations, just a `.then()` method.
In other words, there is no `.catch()` or `.finally()` method you can use.
However, `.then()` returns a proper Promise that you can `.then()` and `.catch()`.

### Streams

The `.find()` method, when not used with any `.update()` or `.remove()` commands,
returns a stream.

```js
collection.find().pipe(JSONStream.stringify()).pipe(process.stdout)
```

### Callbacks

Callbacks are only supported using the `.exec()` or `.end()` commands.

```js
collection.find().end(function (err, doc) {

})
```

### Transforms

You may chain transforms, equivalent to `[].map()`:

```js
collection.find().map(function (x) {
  x.transform1 = true
  return x
}).map(function (x) {
  x.transform2 = true
  return x
})
```

### Options

You may set options yourself using the `.setOption()` or `.setOptions()` methods:

```js
collection.find().setOptions({})
collection.find().setOption('key', 'value')
```

## Examples

Insert with write concern:

```js
collection.insert([{
  name: 'jon'
}, {
  name: 'mary'
}]).w('majority')
```

Find both of the above documents and pipe:

```js
var stringify = require('JSONStream').stringify

collection
.find()
// create $or: [], though a `name: {$in: []}` would probably be better here
.or('name', 'jon')
.or('name', 'mary')
.readPreference('secondaryPreferred')
.pipe(stringify)
.pipe(process.stdout)
```

Equivalent of `.findAndModify()` and returning the new object:

```js
collection
.find('name', 'jon')
.set('name', 'Jonathan')
.new()
```

Do a `multi` update, which is by default unless `.new()` or `.remove()` are chained or `.updateOne()` is used`:

```js
collection
.find('species', 'human')
.set('ancestor', 'neanderthal')
.w('majority')
```

Do an aggregation:

```js
collection.aggregate()
.match({
  type: 'human'
})
.group({
  _id: '$value',
  count: {
    $sum: 1
  }
})
.limit(10)
```

Paginate:

```js
function query(options) {
  options = options || {}
  collection.find()
  .skip(options.skip || 0)
  .limit(options.limit || 25)
}
```

[npm-image]: https://img.shields.io/npm/v/mongodb-next.svg?style=flat
[npm-url]: https://npmjs.org/package/mongodb-next
[travis-image]: https://img.shields.io/travis/mongodb-utils/mongodb-next.svg?style=flat
[travis-url]: https://travis-ci.org/mongodb-utils/mongodb-next
[coveralls-image]: https://img.shields.io/coveralls/mongodb-utils/mongodb-next.svg?style=flat
[coveralls-url]: https://coveralls.io/r/mongodb-utils/mongodb-next?branch=master
[gittip-image]: https://img.shields.io/gittip/jonathanong.svg?style=flat
[gittip-url]: https://www.gittip.com/jonathanong/
