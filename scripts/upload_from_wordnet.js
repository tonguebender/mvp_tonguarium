const dicts = require('../lib/dicts/dicts');
const db = require('../lib/db');
const {processAll} = require('./../../wordnet-parser');

function batchProcess(data) {
  if (!data.length) {
    return Promise.resolve();
  } else {
    return Promise
      .all(data.splice(0, 100).map(item => {
        return dicts.putDefinitions(item.lemma, { [item.pos]: item.gloss });
      }))
      .then(() => {
        return batchProcess(data);
      }, err => {
        console.log('batchProcess Error: ', err);
        return batchProcess(data);
      });
  }
}

processAll({ dataDir: './../wordnet-parser/dict' }).then(data => {
  console.log('Start uploading');
  throw new Error(`i'm broken, please fix API first`);

  return Promise
    .all(data.map(posData => {
      return batchProcess(posData);
    }))
    .then(() => {
      console.log('ok');
    }, err => {
      console.log(err);
    });

});

