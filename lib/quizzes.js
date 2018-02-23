const db = require('./db');

db.registerSchema('quiz', 'Quiz');

function get(id) {
  return db.get('quiz', id);
}

function getAll() {
  return db.getAll('quiz');
}

function put(id, data) {
  return db.put('quiz', id, data);
}


module.exports = {
  get,
  getAll,
  put,
};
