const assert = require('assert');
const db = require('./db');
const tests = [];


tests.push(_ =>
  db.put('blah', { a: [] })
    .then(res => {
      assert.equal(res.lemma, 'blah');
      console.log('put: ok');
      return 1;
    })
    .catch(err => {
      console.log('put error', err);

      return err;
    })
);

tests.push(_ =>
  db.get('blah')
    .then(res => {
      console.log(res);
      assert.equal(res.lemma, 'blah');
      console.log('get: ok');
      return 1;
    })
    .catch(err => {
      console.log('get error', err);
      return err;
    })
);

tests.push(_ =>
  db.createOrUpdate('blah', { b: [] })
    .then(res => {
      assert.equal(res.lemma, 'blah');
      console.log('createOrUpdate: update ok');
      return 1;
    })
    .catch(err => {
      console.log('createOrUpdate: update error', err);

      return err;
    })
);

tests.push(_ =>
  db.createOrUpdate('blahs', { b: [] })
    .then(res => {
      assert.equal(res.lemma, 'blahs');
      console.log('createOrUpdate: create ok');
      return 1;
    })
    .catch(err => {
      console.log('createOrUpdate: create error', err);

      return err;
    })
);

Promise.all(tests.map(f => f())).then((res) => {
  console.log('res', res);
  db.mongoose.disconnect();
});
