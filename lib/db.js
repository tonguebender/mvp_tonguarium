const mongoose = require('mongoose');
const schemas = require('./db-schemas');

mongoose.Promise = global.Promise;

const db = module.exports;

db.models = {};
db.mongoose = mongoose;

db.registerSchema = function(id, name, schema) {
  db.models[id] = mongoose.model(name, schema || schemas[id]);
};

db.registerTongue = function(tongue) {
  db.registerSchema(tongue, tongue, schemas.tongue);
};

db.getConnection = function getConnection() {
  if (db._connectionPromise) {
    return db._connectionPromise;
  } else {
    return db._connectionPromise = new Promise((resolve, reject) => {
      mongoose.connect(process.env.MONGO_URL, { useMongoClient: true }, (err, connection) => {
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

db._getModel = function getModel(collection) {
  return db.getConnection()
    .then(() => db.models[collection]);
};

db.get = function get(collection, id) {
  if (typeof collection !== 'string') Promise.reject(`collection must be a string, instead: ${typeof collection}`);
  if (collection === '') Promise.reject('collection must not be empty');
  if (typeof id !== 'string') Promise.reject(`id must be a string, instead: ${typeof id}`);
  if (id === '')  Promise.reject('id must not be empty');

  return new Promise((resolve, reject) => {
    db._getModel(collection)
      .then(Model => {
        Model.findOne({ id }, (err, doc) => {
          if (err) reject(err);
          if (doc === null) reject({ error: 'not found', data: { collection, id } });

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
      });
  });
};

db.findAll = function findAll(collection, conditions = {}) {
  return new Promise((resolve, reject) => {
    db._getModel(collection)
      .then(Model => {
        return Model.find(conditions).then(resolve, reject);
      });
  });
};

db.findAllSorted = function findAllSorted(collection, conditions) {
  return new Promise((resolve, reject) => {
    db._getModel(collection)
      .then(Model => {
        return Model.find(conditions || {}).sort({ _id: 1 }).then(resolve, reject);
      });
  });
};

db.findByIds = function (collection, ids) {
  return new Promise((resolve, reject) => {
    db._getModel(collection)
      .then(Model => {
        Model.find({ _id: { $in: ids } }, (err, docs) => {
          if (err) reject(err);

          resolve(docs);
        });
      });
  });
};

db.put = function put(collection, id, data) {
  if (typeof collection !== 'string') throw new Error(`collection must be a string, instead: ${typeof collection}`);
  if (collection === '') throw new Error('collection must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be a string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');
  if (typeof data !== 'object') throw new Error('data must be an object');

  return new Promise((resolve, reject) => {
    db._getModel(collection)
      .then(Model => {
        const doc = new Model(
          Object.assign(
            { _id: mongoose.Types.ObjectId() },
            Object.assign({ id: id }, data),
          )
        );

        doc.save((err, doc) => {
          if (err) reject(err);

          resolve(doc);
        });
      });

  });
};

db.push = function push(collection, data) {
  if (typeof collection !== 'string') throw new Error(`collection must be a string, instead: ${typeof collection}`);
  if (collection === '') throw new Error('collection must not be empty');
  if (typeof data !== 'object') throw new Error('data must be an object');

  return new Promise((resolve, reject) => {
    db._getModel(collection)
      .then(Model => {
        const doc = new Model(
          Object.assign(
            { _id: mongoose.Types.ObjectId() },
            data
          )
        );

        doc.save((err, doc) => {
          if (err) reject(err);

          resolve(doc);
        });
      });

  });
};

db.createOrUpdate = function createOrUpdate(collection, id, data) {
  if (typeof collection !== 'string') throw new Error(`collection must be a string, instead: ${typeof collection}`);
  if (collection === '') throw new Error('collection must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be a string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');
  if (typeof data !== 'object') throw new Error('data must be an object');

  return new Promise((resolve, reject) => {
    db.get(collection, id)
      .then(doc => {
        if (!doc) {
          db
            .put(collection, id, data)
            .then(resolve, reject);

          return;
        }

        // todo: check deepClone here
        try {
          Object.keys(data).forEach(name => {
            doc[name] = Object.assign({}, doc[name] || {}, data[name]);
          });
        } catch (e) {
          console.log('clone error:', data, typeof data, Object.keys(data), e);
        }

        doc.save((err, doc) => {
          if (err) reject(err);

          resolve(doc);
        });
      })
      .catch(err => {
        if (err.error === 'not found') {
          db
            .put(collection, id, data)
            .then(resolve, reject);

        } else {
          reject(err);
        }
      });
  });
};

db.delete = function dbDelete(collection, id) {
  if (typeof collection !== 'string') throw new Error(`collection must be a string, instead: ${typeof collection}`);
  if (collection === '') throw new Error('collection must not be empty');
  if (typeof id !== 'string') throw new Error(`id must be a string, instead: ${typeof id}`);
  if (id === '') throw new Error('id must not be empty');

  return new Promise((resolve, reject) => {
    db._getModel(collection)
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
