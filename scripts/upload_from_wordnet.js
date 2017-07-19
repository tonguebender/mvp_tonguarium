const dicts = require('../lib/dicts/dicts');
const db = require('../lib/db');
const {processAll} = require('./../../wordnet-parser');

function batchProcess(data) {
  if (!data.length) {
    return Promise.resolve();
  } else {
    return Promise
      .all(data.splice(0, 100).map(item => {
        if (!item.lemma) console.log('>>>>>>>>>>>', item);
        return dicts.putDefinitions(item.lemma, { [item.pos]: item.gloss });
      }))
      .then(_ => {
        return batchProcess(data);
      }, err => {
        console.log('batchProcess Error: ', err);
        return batchProcess(data);
      });
  }
}

processAll({ dataDir: './../wordnet-parser/dict' }).then(data => {
  console.log('Start uploading');

  return Promise
    .all(data.map(posData => {
      return batchProcess(posData);
    }))
    .then(_ => {
      console.log('ok');
    }, err => {
      console.log(err);
    });

});

