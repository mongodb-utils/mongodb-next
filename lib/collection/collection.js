
module.exports = Collection

function Collection(collection) {
  if (!(this instanceof Collection)) return new Collection(collection)
  this.collection = collection
}
