const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Types = Schema.Types;

const db = module.exports;

// dicts possibly should be renamed to tonguarium
mongoose.connect('mongodb://localhost:27017/dicts', { useMongoClient: true }, function(err) {
  if (err) {
    console.log(`Connection error ${err}`);
    return;
  }
  console.log('Connected to mongodb');
});

db.mongoose = mongoose;

const LemmaSchema = new Schema({
  _id: ObjectId,
  lemma: { type: Types.String, index: { unique: true, dropDups: true } },
  definitions: Types.Object
});
const Lemma = mongoose.model(`en-gb-definition`, LemmaSchema);

db.get = function(lemma) {
  return new Promise((resolve, reject) => {
    Lemma.findOne({ lemma }, function(err, doc) {
      if (err) reject(err);
      if (doc === null) reject({ error: 'not found' });

      resolve(doc);
    });
  });
};

db.put = function(lemma, definitions) {
  if (typeof lemma !== 'string') throw new Error('lemma must be string, instead:', typeof lemma);
  if (lemma === '') throw new Error('lemma must not be empty');
  if (typeof definitions !== 'object') throw new Error('definitions must be object');

  return new Promise((resolve, reject) => {
    const doc = new Lemma(Object.assign({ _id: mongoose.Types.ObjectId() }, {
      lemma: lemma,
      definitions: definitions
    }));

    doc.save((err, doc) => {
      if (err) reject(err);

      resolve(doc);
    });
  });
};

db.createOrUpdate = function(lemma, definitions) {
  if (typeof lemma !== 'string') throw new Error('lemma must be string, instead:', typeof lemma);
  if (lemma === '') throw new Error('lemma must not be empty');
  if (typeof definitions !== 'object') throw new Error('definitions must be object');

  return new Promise((resolve, reject) => {
    db.get(lemma)
      .then(doc => {
        if (!doc) {
          db
            .put(lemma, definitions)
            .then(resolve, reject);

          return;
        }

        doc.definitions = Object.assign({}, doc.definitions, definitions);

        doc.save((err, doc) => {
          if (err) reject(err);

          resolve(doc);
        });
      })
      .catch(err => {
        if (err) console.log(err);

        reject(err);
      });
  });
};
