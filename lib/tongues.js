const db = require('./db');
const skyeng = require('./skyeng');

const TONGUES = [
  'en-gb-dict',
  'en-gb-def',
  'en-synonyms',
  'en-grammar',
  'en-ipa',
  'en-misspell',
  'en-sat',
  'en-skyeng',
];

TONGUES.forEach(tongue => db.registerTongue(tongue));

function get(tongue, id) {
  if (!TONGUES.includes(tongue)) {
    throw new Error(`Unknown tongue: ${tongue}`);
  }

  switch (tongue) {
    case 'en-skyeng': {
      return skyeng.get(id);
    }
    default: {
      return db.get(tongue, id);
    }
  }
}

function getText(tongue, id) {
  return get(tongue, id).then(doc => {
    switch (tongue) {
      case 'en-gb-def': {
        return (
          doc.data.meanings &&
          doc.data.meanings.map(m => `*${m.speech_part}*\n${m.def}${m.example ? `; "${m.example}"` : ''}`).join('\n')
        );
      }
      case 'en-synonyms': {
        return `Synonyms: ${doc.data.synonyms.join(', ')}`;
      }
      case 'en-grammar': {
        return `Grammar: ${doc.data.text}`;
      }
      case 'en-ipa': {
        return `IPA: ${doc.data.ipa}`;
      }
      case 'en-misspell': {
        return doc.data.note ? `Misspells: ${doc.data.note}` : '';
      }
      case 'en-sat': {
        return `SAT examples: ${doc.data.examples.join('\n')}`;
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
  return Promise.all(TONGUES.map(tongue => getText(tongue, id), () => null))
    .then(texts => {
      return texts
        .filter(result => result)
        .join('\n\n')
        .replace(/[`']/g, '"');
    })
    .then(text => {
      return skyeng.get(id).then(
        data => {
          return {
            text,
            image: data && `http:${data.image}`,
            audio: data && `http:${data.audio}`,
          };
        },
        err => {
          return {
            text,
          };
        },
      );
    });
}

function createOrUpdate(tongue, id, data) {
  return db.createOrUpdate(tongue, id, { data });
}

function getImage(id) {
  return skyeng.get(id).then(
    data => {
      return {
        image: data && `http:${data.image}`,
        buttons: ['audio'],
      };
    },
    err => {
      return;
    },
  );
}

function getAudio(id) {
  return skyeng.get(id).then(
    data => {
      return {
        audio: data && `http:${data.audio}`,
        buttons: ['image'],
      };
    },
    err => {
      return;
    },
  );
}

function getExamples(id) {
  return get('en-gb-def', id).then(data => {
    return data && data.data.meanings.filter(meaning => meaning.example).map(meaning => meaning.example);
  });
}

function getTranslation(id) {
  return skyeng.getRaw(id).then(data => {
    const words = data.filter(row => row.text === id);

    return words.reduce((translatoins, word) => {
      if (word.meanings) {
        translatoins.push.apply(
          translatoins,
          word.meanings.filter(meaning => meaning.translation).map(meaning => meaning.translation.text),
        );
      }

      return translatoins;
    }, []);
  });
}

module.exports = {
  TONGUES,
  get,
  getAll,
  put,
  createOrUpdate,
  search,
  getImage,
  getAudio,
  getExamples,
  getTranslation,
};
