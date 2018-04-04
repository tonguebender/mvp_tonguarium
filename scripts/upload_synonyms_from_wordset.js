const db = require('../lib/db');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
const tongues = require('../lib/tongues');

const TONGUE = 'en-synonyms';

db.getConnection()
  .then(() => {
    console.log('Start uploading');
    return processWordsetDir({ dataDir: process.env.WORDSET_DICT, callback: (item) => {
        return tongues.createOrUpdate(TONGUE, item.word, {
          synonyms: item.meanings
            ? item.meanings.reduce((synonyms, meaning) => {
              if (meaning.synonyms) {
                const newWords = meaning.synonyms.filter(word => !synonyms.includes(word));
                synonyms.push(...newWords);
              }

              return synonyms;
            },[])
            : []
        });
      } })
      .then(() => {
        console.log('ok');
        db.closeConnection();
      }, err => {
        console.log(err);
        db.closeConnection();
      })
    });

function processWordsetDir({ dataDir, callback }) {
  return readdir(dataDir)
    .then(files => {
      console.log(files);

      function seqIt(files) {
        if (!files.length) return Promise.resolve();

        const file = files.shift();

        return processWordsetFile({ filePath: path.resolve(dataDir, file), callback })
          .then(() => seqIt(files))
      }

      return seqIt(files);
    });
}

function processWordsetFile({ filePath, callback }) {
  console.log('processWordsetFile',filePath);

  return readfile(filePath).then(data => {
    const wordsData = JSON.parse(data.toString());
    const words = Object.keys(wordsData);

    function batchIt(words, callback) {
      if (!words.length) return Promise.resolve();

      console.log(words.length);
      return Promise.all(words.splice(0, 1000).map(word => callback(wordsData[word])))
        .then(() => {
          return batchIt(words, callback);
        }, err => {
          console.log('batchProcess Error: ', err);
          return batchIt(words, callback);
        });
    }
    return batchIt(words, callback);
  });
}
