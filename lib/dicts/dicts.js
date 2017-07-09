let db = require('../db.js');

module.exports.list = [
  'en-gb'
];

const data = {
  'en-gb': {
    'I': {
      word: 'I',
      definitions: {
        noun: [
          'the ninth letter of the alphabet',
          'the Roman numeral for one.'
        ],
        pronoun: [
          'used by a speaker to refer to himself or herself.'
        ]
      }
    }
  }
};

module.exports.get = function({ dictName, word }) {
  return db.get(dictName, word).then(definition => {
    return definition;
  });
};

module.exports.put = function({ dictName, word }) {
  throw new Error('todo');
};
