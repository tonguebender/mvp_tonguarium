const db = require('../db.js');

module.exports.list = [
  'en-gb'
];

module.exports.getDefinitions = function(lemma) {
  return db.get(lemma).then(doc => {
    return doc.definitions;
  });
};

module.exports.putDefinitions = function(lemma, definitions) {
  return db.createOrUpdate(lemma, definitions).then(result => {
    return result;
  }, err => {
      console.log('dict.put error:', err);
      return {};
  });
};
