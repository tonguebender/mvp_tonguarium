const assert = require('assert');
const db = require('./db');
const tests = [];

db.registerTongue('en-gb-dict');

tests.push(_ =>
  db.put('en-gb-dict', 'blah', { a: [] })
    .then(res => {
      assert.equal(res.id, 'blah');
      console.log('put: ok');
      return 1;
    })
    .catch(err => {
      console.log('put error', err);

      return err;
    })
);

tests.push(_ =>
  db.get('en-gb-dict', 'blah')
    .then(res => {
      assert.equal(res.id, 'blah');
      console.log('get: ok');
      return 1;
    })
    .catch(err => {
      console.log('get error', err);
      return err;
    })
);

tests.push(_ =>
  db.createOrUpdate('en-gb-dict', 'blah', { b: [] })
    .then(res => {
      assert.equal(res.id, 'blah');
      console.log('createOrUpdate: update ok');
      return 1;
    })
    .catch(err => {
      console.log('createOrUpdate: update error', err);

      return err;
    })
);

tests.push(_ =>
  db.createOrUpdate('en-gb-dict', 'blahs', { b: [] })
    .then(res => {
      assert.equal(res.id, 'blahs');
      console.log('createOrUpdate: create ok');
      return 1;
    })
    .catch(err => {
      console.log('createOrUpdate: create error', err);

      return err;
    })
);

function cleanUp() {
  console.log('clean up');
  return Promise.all([
    db.delete('en-gb-dict', 'blah'),
    db.delete('en-gb-dict', 'blahs'),
  ]);
}

function run(tests) {
  return new Promise((resolve) => {
    (function _run(tests) {
      if (tests.length) {
        return (tests.shift())()
          .then(ok => {
            console.log('passed', ok);
            _run(tests);
          })
          .catch(err => {
            console.log('failed', err);
            _run(tests);
          });
      } else {
        console.log('all done');
        resolve();
      }
    })(tests);
  });
}

db.getConnection()
  .then(cleanUp)
  .then(() => run(tests))
  .then(cleanUp)
  .then(() => db.mongoose.disconnect());
