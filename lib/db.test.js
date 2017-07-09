let assert = require('assert');
let db = require('./db');

db.get('en-gb', 'I').then(res => {
  assert.equal(res.word, 'I');
});

db.mongoose.disconnect();
