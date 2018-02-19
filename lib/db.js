const mongoose = require('mongoose');
const schemas = require('./db-schemas');

mongoose.Promise = global.Promise;

const db = module.exports;

db.models = {};
db.mongoose = mongoose;

db.registerTongue = function registerTongue(tongue) {
  db.models[tongue] = mongoose.model(tongue, schemas.tongue);
};

db.registerCourses = function registerTongue() {
  db.models.course = mongoose.model('Course', schemas.course);
};

db._getModel = function getModel(tongue) {
  return db.getConnection()
    .then(_ => {
      const model = db.models[tongue];

      return model || Promise.reject('No such collection');
    });
};

db.getConnection = function getConnection() {
  if (db._connectionPromise) {
    return db._connectionPromise;
  } else {
    return db._connectionPromise = new Promise((resolve, reject) => {
      mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/tonguarium', { useMongoClient: true }, (err, connection) => {
        if (err) {
          console.log(`Connection error ${err}`);
          reject(err);
          return;
        }

        console.log('Connected to mongodb');
        resolve(connection);
      });
    });
  }
};

db.closeConnection = function dbClose(callback) {
  db.getConnection()
    .then(connection => {
      connection.close(callback)
    });
};

db.get = function get(tongue, id) {
  if (typeof tongue !== 'string') throw new Error(`tongue must be string, instead: ${typeof tongue}`);
  if (tongue === '') throw new Error('tongue must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');

  return new Promise((resolve, reject) => {
    db._getModel(tongue)
      .then(Model => {
        Model.findOne({ id }, (err, doc) => {
          if (err) reject(err);
          if (doc === null) reject({ error: 'not found', data: { tongue, id } });

          resolve(doc);
        });
      });
  });
};

db.getAll = function getAll(collection) {
  return new Promise((resolve, reject) => {
    db._getModel(collection)
      .then(Model => {
        Model.find({}, (err, docs) => {
          if (err) reject(err);

          resolve(docs.map(doc => doc.id));
        });
      }, err => reject(err));
  });
};

db.put = function put(tongue, id, data) {
  if (typeof tongue !== 'string') throw new Error(`tongue must be string, instead: ${typeof tongue}`);
  if (tongue === '') throw new Error('tongue must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');
  if (typeof data !== 'object') throw new Error('data must be object');

  return new Promise((resolve, reject) => {
    db._getModel(tongue)
      .then(Model => {
        const doc = new Model(
          Object.assign(
            { _id: mongoose.Types.ObjectId() },
            Object.assign({ id: id }, data)
          )
        );

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

        // todo: check deepClone here
        try {
          Object.keys(data).forEach(name => {
            doc[name] = Object.assign({}, doc[name] || {}, data[name]);
          });
        } catch (e) {
          console.log(data, typeof data, Object.keys(data), e);
        }

        doc.save((err, doc) => {
          if (err) reject(err);

          resolve(doc);
        });
      })
      .catch(err => {
          if (err.error === 'not found') {
            db
              .put(tongue, id, data)
              .then(resolve, reject);

          } else {
            reject(err);
          }
      });
  });
};


db.delete = function dbDelete(tongue, id) {
  if (typeof tongue !== 'string') throw new Error(`tongue must be string, instead: ${typeof tongue}`);
  if (tongue === '') throw new Error('tongue must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');

  return new Promise((resolve, reject) => {
    db._getModel(tongue)
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
