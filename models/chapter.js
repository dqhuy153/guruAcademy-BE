const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

const Schema = mongoose.Schema;

mongoose.plugin(slug);

const chapterSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    number: {
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
    status: {
      type: Number,
      required: true,
      default: 1,
    },
    contents: [
      {
        typeName: {
          type: String,
        },
        typeId: {
          type: Number,
        },
        contentId: {
          type: String,
        },
      },
    ],
    lessons: [],
    tests: [],
    attachments: [],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chapter', chapterSchema);
