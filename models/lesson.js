const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

const Schema = mongoose.Schema;

mongoose.plugin(slug);

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: false,
    },
    slug: {
      type: String,
      slug: 'title',
      slugPaddingSize: 3,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: true,
    },
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
    attachments: [],
    tests: [],
    comments: [],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);
