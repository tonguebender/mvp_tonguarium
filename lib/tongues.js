const db = require('./db');

const TONGUES = [
  'en-gb-dict',
  'en-grammar',
  'en-ipa',
  'en-misspell',
];

TONGUES.forEach(tongue => db.registerTongue(tongue));

function get(tongue, id) {
  if (!TONGUES.includes(tongue)) {
    throw new Error(`Unknown tongue: ${tongue}`);
  }

  return db.get(tongue, id);
}

function getAll(tongue) {
  return db.getAll(tongue);
}

function put(tongue, id, data) {
  return db.put(tongue, id, { data });
}

function createOrUpdate(tongue, id, data) {
  return db.createOrUpdate(tongue, id, { data });
}

module.exports = {
  TONGUES,
  get,
  getAll,
  put,
  createOrUpdate,
};
