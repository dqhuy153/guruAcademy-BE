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
    index: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      slug: 'title',
      slug_padding_size: 3,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);
