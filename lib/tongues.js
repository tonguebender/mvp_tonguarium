const db = require('./db');

const TONGUES = [
  'en-gb-dict',
  'en-grammar',
  'en-ipa',
  'en-misspell',
  'en-sat',
];

TONGUES.forEach(tongue => db.registerTongue(tongue));

function get(tongue, id) {
  if (!TONGUES.includes(tongue)) {
    throw new Error(`Unknown tongue: ${tongue}`);
  }

  return db.get(tongue, id);
}

function getText(tongue, id) {
  return get(tongue, id)
    .then(doc => {
      switch (tongue) {
        case 'en-gb-dict': {
          return Object.keys(doc.data).map(key => {
            return `*(${key})*\n- ${doc.data[key].join('\n- ')}`
          }).join('\n');
        }
        case 'en-grammar': {
          return `Grammar: ${doc.data.text}`
        }
        case 'en-ipa': {
          return `IPA: ${doc.data.ipa}`
        }
        case 'en-misspell': {
          return doc.data.note ? `Misspells: ${doc.data.note}` : '';
        }
        case 'en-sat': {
          return `SAT examples: ${doc.data.examples.join('\n')}`
        }
      }
    }, () => '');
}

function getAll(tongue) {
  return db.getAll(tongue);
}

function put(tongue, id, data) {
  return db.put(tongue, id, { data });
}

function search(id) {
  return Promise.all(TONGUES.map(tongue => getText(tongue, id).then(text => text), () => null))
    .then(results => {
      return results.filter(result => result).join('\n\n');
    });
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
  search
};
