const db = require('../lib/db');
const tongues = require('../lib/tongues');
const { processAll } = require('./../../wordnet-parser');

function batchProcess(data, pos) {
  if (!data.length) {
    return Promise.resolve();
  } else {
    console.log(data.length);
    return Promise
      .all(data.splice(0, 1000).map(item => {
        return tongues.createOrUpdate('en-gb-dict', item.lemma, { [item.pos]: item.gloss });
      }))
      .then(() => {
        return batchProcess(data, pos);
      }, err => {
        console.log('batchProcess Error: ', err);
        return batchProcess(data, pos);
      });
  }
}

db.getConnection()
  .then(() => {
    return processAll({ dataDir: process.env.WORDNET_DICT }).then(data => {
      console.log('Start uploading');

      return data.reduce((p, posData) => {
        return p.then(() => batchProcess(posData, posData[0].pos));
      }, Promise.resolve([]))
        .then(() => {
          console.log('ok');
          db.closeConnection();
        }, err => {
          console.log(err);
          db.closeConnection();
        });

    });
  });

