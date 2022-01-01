const mongoose = require('mongoose')

const Schema = mongoose.Schema

const attachmentSchema = new Schema(
  {
    number: {
      type: Number,
      required: false,
    },
    title: {
      type: String,
      required: true,
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
    slug: {
      type: String,
      slug: 'title',
      unique: true,
      slugPaddingSize: 3,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Attachment', attachmentSchema)
