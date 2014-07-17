
var Query = require('./query')

;[ // options to simply set
  // search options
  'limit',
  'sort',
  'fields',
  'skip',
  'hint',
  'tailableRetryInterval',
  'numberOfRetries',
  'batchSize',
  'maxScan',
  // 'min',
  // 'max',
  'comment',
  'readPreference',
  'maxTimeMS',

  // update options
  'w',
  'wtimeout',
].forEach(function (option) {
  Query.prototype[option] = function (value) {
    this.options[option] = value
    return this
  }
})

;[ // these options default to true
  // search options
  'snapshot',
  'timeout',
  'tailable',
  'awaitdata',
  'oplogReplay',
  'exhaust',
  'returnkey',
  'showDiskLoc',
  'raw',
  'partial',

  // update options
  'fsync',
  'j',
  'serializeFunctions',
  'checkKeys',
  'fullResult',
].forEach(function (option) {
  Query.prototype[option] = function () {
    this.options[option] = true
    return this
  }
})
