
# mongodb-next

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]

A MongoDB API wrapper with:

- A fluent, chaining API
- Promise support
- Streams2 support
- Batched write support

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
- `.aggregate()` - for aggregations, see [aggregate-stream](https://github.com/mongodb-utils/aggregate-stream) for more details
- `.batch()` - to create sequential batch writes
- `.parallel()` - to create parallel batch writes

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

Update operators are also methods without the `$` prefix:

```js
collection.find({
  name: 'username'
}).set('name', 'new_username').w('majority')
```

### Promises

All methods return a thenable.

```js
collection.find().then(function (docs) {

}, function (err) {

})
```

These are __NOT__ real promise implementations, just a `.then()` method.
In other words, there is no `.catch()` or `.finally()` method you can use.
However, `.then()` returns a proper Promise that you can `.then()` and `.catch()`.

### Streams

The `.find()` method, when not used with any `.update()` commands, return a stream.

```js
collection.find().pipe(JSONStream.stringify()).pipe(process.stdout)
```

### Callbacks

Callbacks are only supported using the `.exec()` command.

```js
collection.find().exec(function (err, doc) {

})
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

[npm-image]: https://img.shields.io/npm/v/mongodb-next.svg?style=flat
[npm-url]: https://npmjs.org/package/mongodb-next
[travis-image]: https://img.shields.io/travis/jonathanong/mongodb-next.svg?style=flat
[travis-url]: https://travis-ci.org/jonathanong/mongodb-next
[coveralls-image]: https://img.shields.io/coveralls/jonathanong/mongodb-next.svg?style=flat
[coveralls-url]: https://coveralls.io/r/jonathanong/mongodb-next?branch=master
[gittip-image]: https://img.shields.io/gittip/jonathanong.svg?style=flat
[gittip-url]: https://www.gittip.com/jonathanong/
