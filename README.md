
# mongodb-next

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Gittip][gittip-image]][gittip-url]

A MongoDB API wrapper with:

- A fluent, chaining API without traditional MongoDB drivers and wrappers' function varity and long names
- Streams2 support with proper `.destroy()` calls
- Promise support
- Supports `node-mongodb-native` `v1` as well as `v2`.
- MongoDB 2.6+ support
  - Aggregation framework support
  - Bulk write support

> Note: tests currently fail on Travis because Travis uses MongoDB 2.4

All methods return promises, so your code now looks like this:

```js
var wrap = require('mongodb-next').collection
var collection = wrap(db.collection('test'))

var batch = collection.batch() // ordered batched writes
batch.insert({ a: 1 })
batch.insert({ b: 2 })
batch.then(function () {
  return collection.findOne('a', 1).readPreference('secondaryPreferred')
}).then(function (doc) {
  return collection.findOne(doc._id).update('a', 2).w('majory')
})
```

Or the new way:

```js
var DB = require('mongodb-next');
var db = DB('mongodb://localhost/test', {
  w: 'majority'
});

db.connect.then(function () {
  db.collection('things').find({
    name: 'jon'
  }).then(function (things) {
    console.log(things)
  })
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
  var doc2 = yield collection.find(doc._id).updateOne('a', 2).w('majory').new()
}).catch(function (err) {
  console.error(err.stack)
  process.exit(1)
})
```

## Context

[Christian](https://github.com/christkv),
the maintainer of [node-mongodb-native](https://github.com/mongodb/node-mongodb-native),
is interested in a version of the MongoDB driver that supports native promises
as well as other ES6+ features. However, this won't remotely be a possibility
until after v3.0 of the driver is out.

I expressed my interest in creating a well defined API, and this is
what I consider ideal. As Christian is [refactoring the driver](https://github.com/christkv/mongodb-core),
this may, in the future, be an alternative API.
The goal is for this API to last past ES7, where code will look like:

```js
async function run() {
  var docs = await collection.find({
    name: 'jon'
  })
}

run.catch(function (err) {
  console.error(err.stack)
  process.exit(1)
})
```

## Compatibility

This library uses promises extensively. Currently, it uses [bluebird](https://github.com/petkaantonov/bluebird),
but it will eventually switch to native promises.

This library also only supports MongoDB 2.6+, but most commands will
still work with MongoDB 2.4 and any MongoDB driver that shims
various 2.6 commands for 2.4.

This library supports `node-mongodb-native@1` as well as `@2`.

## API

```js
var DB = require('mongodb-next');
```

### var db = DB(uri, [options])

Create a new db instance from a URI w/ options.
A wrapper around `MongoClient.connect()`

### db.connect.then( => )

Wait until the database is connected.
Use this before doing any subsequent commands.

### db.raw

The raw database connection provided by MongoDB.

### wrap(collection)

The primary constructor wraps a MongoDB Collection.
This is the same as doing `db.collection(name)`.

```js
var wrap = require('mongodb-next').collection
var collection = wrap(db.collection('test'))

// or
var db = DB('mongodb://localhost/test');
db.connect.then(function () {
  var collection = db.collection('test')

  // can now do;
  db.test.find({
    name: 'test'
  })
})
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

All methods have `.then()` and `.catch()`,
allowing them to be `yield` or `await`ed.

```js
collection.find().then(function (docs) {

}, function (err) {

})

co(function* () {
  var docs = yield collection.find({
    name: 'jon'
  })
}).catch(function (err) {
  console.error(err.stack)
  process.exit(1)
})
```

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

[gitter-image]: https://badges.gitter.im/mongodb-utils/mongodb-next.png
[gitter-url]: https://gitter.im/mongodb-utils/mongodb-next
[npm-image]: https://img.shields.io/npm/v/mongodb-next.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mongodb-next
[github-tag]: http://img.shields.io/github/tag/mongodb-utils/mongodb-next.svg?style=flat-square
[github-url]: https://github.com/mongodb-utils/mongodb-next/tags
[travis-image]: https://img.shields.io/travis/mongodb-utils/mongodb-next.svg?style=flat-square
[travis-url]: https://travis-ci.org/mongodb-utils/mongodb-next
[coveralls-image]: https://img.shields.io/coveralls/mongodb-utils/mongodb-next.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/mongodb-utils/mongodb-next
[david-image]: http://img.shields.io/david/mongodb-utils/mongodb-next.svg?style=flat-square
[david-url]: https://david-dm.org/mongodb-utils/mongodb-next
[license-image]: http://img.shields.io/npm/l/mongodb-next.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/mongodb-next.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/mongodb-next
[gittip-image]: https://img.shields.io/gratipay/jonathanong.svg?style=flat-square
[gittip-url]: https://gratipay.com/jonathanong/
