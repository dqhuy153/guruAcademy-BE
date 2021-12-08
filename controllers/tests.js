const Lesson = require('../models/lesson')
const Test = require('../models/test')
const { chapterService, lessonService, courseService } = require('../services')
const { validationError } = require('../util/helper')

exports.getTest = async (req, res, next) => {
  const testId = req.params.id

  try {
    const test = await Test.findById(testId).populate({
      path: 'lesson',
      select: ['title', 'description'],
      populate: {
        path: 'chapter',
        select: ['title', 'description'],
        populate: {
          path: 'courseId',
          select: ['title', 'description', 'author'],
        },
      },
    })

    if (!test) {
      const error = new Error('Test not found!')
      error.statusCode = 404
      throw error
    }

    //check who can see this lesson
    //Admin, root, teacher author, learner who buy course
    //check auth who can see this chapter content
    await chapterService.checkAuthChapterAsync(
      req.userId,
      test.lesson.chapter.courseId._id,
      test.lesson.chapter.courseId.author._id.toString()
    )

    res.status(200).json({
      message: 'Test fetched successfully',
      data: {
        test,
      },
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}

exports.createTest = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  const { title, description, lessonId, number, questions } = req.body

  try {
    //check if lesson exists
    const lesson = await Lesson.findById(lessonId).populate({
      path: 'chapter',
      select: 'courseId',
    })

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      lesson.chapter.courseId.toString(),
      req.userId.toString()
    )

    //create test
    const test = new Test({
      title,
      description,
      lesson: lessonId,
      questions,
      number,
    })

    await test.save()

    //push new test to lesson
    lesson.tests.push(test._id)
    await lesson.save()

    res.status(201).json({
      message: 'Test created successfully',
      data: {
        test,
      },
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}

exports.updateTest = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  const testId = req.params.id
  const { title, description, status, slug, number, questions } = req.body

  try {
    //check if test exists
    const test = await Test.findById(testId).populate({
      path: 'lesson',
      populate: {
        path: 'chapter',
        select: 'courseId',
      },
    })

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      test.lesson.chapter.courseId.toString(),
      req.userId.toString()
    )

    //update test
    if (title) test.title = title
    if (description !== undefined) test.description = description
    if (status !== undefined) test.status = status
    if (slug) test.slug = slug
    if (number !== undefined) test.number = number
    if (questions !== undefined) test.questions = questions

    await test.save()

    res.status(201).json({
      message: 'Test updated successfully',
      data: {
        test,
      },
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}

exports.deleteTest = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  const testId = req.params.id

  try {
    //check if test exists
    const test = await Test.findById(testId).populate({
      path: 'lesson',
      populate: {
        path: 'chapter',
        select: 'courseId',
      },
    })

    const lesson = await lessonService.findLessonByIdAsync(test.lesson)

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      test.lesson.chapter.courseId.toString(),
      req.userId.toString()
    )

    //delete test
    await Test.findByIdAndDelete(testId)

    //remove test from lesson
    lesson.tests.pull(test._id)
    await lesson.save()

    res.status(200).json({
      message: 'Test deleted successfully',
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}
