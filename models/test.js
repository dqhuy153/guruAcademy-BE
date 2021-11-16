const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

const Schema = mongoose.Schema;

mongoose.plugin(slug);

const testSchema = new Schema({
  index: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  slug: {
    type: String,
    slug: 'title',
    unique: true,
    slugPaddingSize: 3,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      a: {
        type: String,
        required: true,
      },
      b: {
        type: String,
        required: true,
      },
      c: {
        type: String,
        required: true,
      },
      d: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
  status: {
    type: Number,
    required: true,
    default: 1,
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  },
});

module.exports = mongoose.model('Test', testSchema);
