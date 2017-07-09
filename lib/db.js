let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
let Types = Schema.Types;

// dicts possibly should be renamed to tonguarium
mongoose.connect('mongodb://localhost:27017/dicts', { useMongoClient: true }, function(err) {
  if (err) {
    console.log(`Connection error ${err}`);
  }
});

let WordSchema = new Schema({
  _id: ObjectId,
  word: Types.String,
  definitions: Types.Object
});

module.exports.get = function(dictName, word) {
  let Word = mongoose.model(`${dictName}-definition`, WordSchema);

  return new Promise((resolve, reject) => {
    Word.findOne({ word }, function(err, doc) {
      if (err) reject(err);

      resolve(doc);
    });
  });
};

module.exports.mongoose = mongoose;
