const mongoose = require('mongoose')
const Lesson = require('../models/lesson')

const filterLessonBySlugOrId = lessonSlugOrId => {
  if (mongoose.isValidObjectId(lessonSlugOrId)) {
    const lessonId = new mongoose.Types.ObjectId(lessonSlugOrId)
    return { _id: lessonId }
  }

  return { slug: lessonSlugOrId }
}

const findLessonByIdAsync = async lessonId => {
  const lesson = await Lesson.findById(lessonId)

  if (!lesson) {
    const error = new Error('Lesson not found!')
    error.statusCode = 404

    throw error
  }

  return lesson
}

const findLessonByIdAndDeleteAsync = async lessonId => {
  try {
    await Lesson.findByIdAndDelete(lessonId)
  } catch (error) {
    throw error
  }
}

module.exports = {
  filterLessonBySlugOrId,
  findLessonByIdAsync,
  findLessonByIdAndDeleteAsync,
}
