const db = require('./db');
const COLLECTION = 'course';

function get(id) {
  return db.get(COLLECTION, id);
}

function getAll() {
  return db.findAll(COLLECTION, { type: { $eq: 'quiz' }})
    .then(docs => {
      return docs.map(doc => doc.id);
    });
}

function put(id, data) {
  return db.put('quiz', id, data);
}

module.exports = {
  get,
  getAll,
  put,
};
