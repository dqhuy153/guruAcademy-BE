const Lesson = require('../models/lesson')
const Attachment = require('../models/attachment')
const { chapterService, lessonService, courseService } = require('../services')
const { validationError } = require('../util/helper')

exports.getAttachment = async (req, res, next) => {
  const attachmentId = req.params.id

  try {
    const attachment = await Attachment.findById(attachmentId).populate({
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

    if (!attachment) {
      const error = new Error('Attachment not found!')
      error.statusCode = 404
      throw error
    }

    //check who can see this lesson
    //Admin, root, teacher author, learner who buy course
    //check auth who can see this chapter content
    await chapterService.checkAuthChapterAsync(
      req.userId,
      attachment.lesson.chapter.courseId._id,
      attachment.lesson.chapter.courseId.author._id.toString()
    )

    res.status(200).json({
      message: 'Attachment fetched successfully',
      data: {
        attachment: attachment,
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

exports.createAttachment = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  const { title, description, lessonId, number, url } = req.body

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

    //create attachment
    const attachment = new Attachment({
      title,
      description,
      lesson: lessonId,
      number,
      url,
    })

    await attachment.save()

    //push new attachment to lesson
    lesson.attachments.push(attachment._id)
    await lesson.save()

    res.status(201).json({
      message: 'Attachment created successfully',
      data: {
        attachment,
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

exports.updateAttachment = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  const attachmentId = req.params.id
  const { title, description, status, slug, number, url } = req.body

  try {
    //check if attachment exists
    const attachment = await Attachment.findById(attachmentId).populate({
      path: 'lesson',
      populate: {
        path: 'chapter',
        select: 'courseId',
      },
    })

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      attachment.lesson.chapter.courseId.toString(),
      req.userId.toString()
    )

    //update attachment
    if (title) attachment.title = title
    if (description !== undefined) attachment.description = description
    if (status !== undefined) attachment.status = status
    if (slug) attachment.slug = slug
    if (number !== undefined) attachment.number = number
    if (url !== undefined) attachment.url = url

    await attachment.save()

    res.status(201).json({
      message: 'Attachment updated successfully',
      data: {
        attachment,
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

exports.deleteAttachment = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  const attachmentId = req.params.id

  try {
    //check if attachment exists
    const attachment = await Attachment.findById(attachmentId).populate({
      path: 'lesson',
      populate: {
        path: 'chapter',
        select: 'courseId',
      },
    })

    const lesson = await lessonService.findLessonByIdAsync(attachment.lesson)

    if (!lesson) {
      const error = new Error('Lesson not found!')
      error.statusCode = 404
      throw error
    }

    if (!lesson.chapter) {
      const error = new Error('Chapter not found!')
      error.statusCode = 404
      throw error
    }

    if (!attachment.lesson.chapter.courseId) {
      const error = new Error('Course not found!')
      error.statusCode = 404
      throw error
    }

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      attachment.lesson.chapter.courseId.toString(),
      req.userId.toString()
    )

    //delete attachment
    await Attachment.findByIdAndDelete(attachmentId)

    //remove attachment from lesson
    lesson.attachments.pull(attachment._id)
    await lesson.save()

    res.status(200).json({
      message: 'Attachment deleted successfully',
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}
