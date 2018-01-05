const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Types = Schema.Types;

mongoose.Promise = global.Promise;

const db = module.exports;

db.models = {};
db.mongoose = mongoose;

db.registerTongue = function registerTongue(tongue) {
  const TongueSchema = new Schema({
    _id: ObjectId,
    id: { type: Types.String, index: { unique: true, dropDups: true } },
    data: Types.Object
  });

  db.models[tongue] = mongoose.model(tongue, TongueSchema);
};

db.getModel = function getModel(tongue) {
  return db.getConnection()
    .then(_ => db.models[tongue]);
};

db.getConnection = function getConnection() {
  if (db._connectionPromise) {
    return db._connectionPromise;
  } else {
    return db._connectionPromise = new Promise((resolve, reject) => {
      mongoose.connect('mongodb://localhost:27017/tonguarium', { useMongoClient: true }, (err) => {
        if (err) {
          console.log(`Connection error ${err}`);
          reject(err);
          return;
        }

        console.log('Connected to mongodb');
        resolve();
      });
    });
  }
};

db.get = function get(tongue, id) {
  if (typeof tongue !== 'string') throw new Error(`tongue must be string, instead: ${typeof tongue}`);
  if (tongue === '') throw new Error('tongue must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');

  return new Promise((resolve, reject) => {
    db.getModel(tongue)
      .then(Model => {
        Model.findOne({ id }, (err, doc) => {
          if (err) reject(err);
          if (doc === null) reject({ error: 'not found', data: { tongue, id } });

          resolve(doc);
        });
      });
  });
};

db.put = function put(tongue, id, data) {
  if (typeof tongue !== 'string') throw new Error(`tongue must be string, instead: ${typeof tongue}`);
  if (tongue === '') throw new Error('tongue must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');
  if (typeof data !== 'object') throw new Error('data must be object');

  return new Promise((resolve, reject) => {
    db.getModel(tongue)
      .then(Model => {
        const doc = new Model(Object.assign({ _id: mongoose.Types.ObjectId() }, {
          id: id,
          data: data
        }));

        doc.save((err, doc) => {
          if (err) reject(err);

          resolve(doc);
        });
      });

  });
};

db.createOrUpdate = function createOrUpdate(tongue, id, data) {
  if (typeof tongue !== 'string') throw new Error(`tongue must be string, instead: ${typeof tongue}`);
  if (tongue === '') throw new Error('tongue must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');
  if (typeof data !== 'object') throw new Error('data must be object');

  return new Promise((resolve, reject) => {
    db.get(tongue, id)
      .then(doc => {
        if (!doc) {
          db
            .put(tongue, id, data)
            .then(resolve, reject);

          return;
        }

        doc.data = Object.assign({}, doc.data, data);

        doc.save((err, doc) => {
          if (err) reject(err);

          resolve(doc);
        });
      })
      .catch(err => {
          db
            .put(tongue, id, data)
            .then(resolve, reject);
      });
  });
};


db.delete = function dbDelete(tongue, id) {
  if (typeof tongue !== 'string') throw new Error(`tongue must be string, instead: ${typeof tongue}`);
  if (tongue === '') throw new Error('tongue must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');

  return new Promise((resolve, reject) => {
    db.getModel(tongue)
      .then(Model =>
        Model.deleteOne({ id }, (error) => {
          if (error) {
            console.log('err', error);
            reject(resolve);
            return;
          }

          resolve();
        })
      );
  })
};
