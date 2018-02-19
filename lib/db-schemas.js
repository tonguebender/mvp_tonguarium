const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Types = Schema.Types;


module.exports = {

  tongue: new Schema({
    _id: ObjectId,
    id: { type: Types.String, index: { unique: true, dropDups: true } },
    data: Types.Object
  }),

  course: new Schema({
    _id: ObjectId,
    id: { type: Types.String, index: { unique: true, dropDups: true } },
    type: { type: Types.String },
    description: { type: Types.String },
    options: Types.Object,
    tags: [{ type: Types.String }],
    content: [
      {
        tongue: { type: Types.String },
        text: { type: Types.String },
        options: { type: Types.Object }
      }
    ]
  })

};
