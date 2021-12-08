const { validationError } = require('../util/helper')
const Chapter = require('../models/chapter')
const { courseService, chapterService } = require('../services')

exports.getChapter = async (req, res, next) => {
  const chapterSlugOrId = req.params.chapterSlugOrId

  try {
    //get chapter
    const chapterFilterData =
      chapterService.filterChaptersBySlugOrId(chapterSlugOrId)

    const chapter = await Chapter.findOne(chapterFilterData).populate([
      {
        path: 'courseId',
        select: ['title', 'description', 'author'],
        populate: {
          path: 'author',
          select: [
            'email',
            'firstName',
            'lastName',
            'description',
            'socialLinks',
          ],
        },
      },
      {
        path: 'lessons',
        select: '-chapter',
        populate: [
          {
            path: 'attachments',
            select: '-lesson',
          },
          {
            path: 'test',
            select: '-lesson',
          },
          {
            path: 'comments',
            select: '-lesson',
          },
        ],
      },
    ])

    //check chapter exists
    if (!chapter) {
      const error = new Error('Chapter not found!')
      error.statusCode = 404

      throw error
    }

    //check course of chapter
    await courseService.findCourseByIdAsync(chapter.courseId)

    //check auth who can see this chapter content
    //admin, root, teacher, student
    await chapterService.checkAuthChapterAsync(
      req.userId.toString(),
      chapter.courseId._id.toString(),
      chapter.courseId.author._id.toString()
    )

    //send res
    res.status(200).json({
      message: 'Fetch chapter successfully',
      data: {
        chapter,
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

//teacher required
exports.postNewChapter = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  //get request's body
  const courseId = req.body.courseId
  const number = req.body.number
  const title = req.body.title
  const description = req.body.description

  try {
    //check course info
    const course = await courseService.findCourseByIdAsync(courseId)

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      course._id.toString(),
      req.userId.toString()
    )

    const chapterNumber = course.chapters.length

    //save new chapter
    const chapter = new Chapter({
      courseId,
      number: number ? number : chapterNumber + 1,
      title,
      description,
      lessons: [],
    })

    await chapter.save()

    //push new chapter to course
    course.chapters.push(chapter._id)
    await course.save()

    //send response
    res.status(201).json({
      message: 'Chapter created successfully!',
      data: {
        chapter,
        courseChapters: course.chapters,
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

//teacher required
exports.updateChapter = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  //get request's body
  const chapterId = req.params.id

  const number = req.body.number
  const title = req.body.title
  const description = req.body.description
  const slug = req.body.slug
  const status = req.body.status
  const lessons = req.body.lessons

  try {
    //check chapter info
    const chapter = await chapterService.findChapterByIdAsync(chapterId)

    //check number's chapter exists
    // const checkNumberChapter = await Chapter.findOne({
    //   courseId: chapter.courseId,
    //   number,
    // });

    // if (checkNumberChapter && checkNumberChapter._id.toString() !== chapterId) {
    //   const error = new Error(`Chapter number ${number} is exists!`);
    //   error.statusCode = 422;

    //   throw error;
    // }

    //check chapter's authorization
    await courseService.checkCourseWriteableAsync(
      chapter.courseId.toString(),
      req.userId.toString()
    )

    //update chapter
    //only update field has data in body
    if (title) chapter.title = title
    if (description !== undefined) chapter.description = description
    if (number !== undefined) chapter.number = number
    if (slug) chapter.slug = slug
    if (status !== undefined) chapter.status = status
    if (lessons !== undefined) chapter.lessons = lessons

    await chapter.save()

    //send response
    res.status(200).json({
      message: 'Chapter updated successfully!',
      data: {
        chapter,
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

exports.deleteChapter = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  const chapterId = req.params.id

  try {
    //check chapter info
    const chapter = await chapterService.findChapterByIdAsync(chapterId)

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      chapter.courseId.toString(),
      req.userId.toString()
    )

    //delete chapter
    await Chapter.findByIdAndDelete(chapterId)

    //remove chapter from course
    const course = await courseService.findCourseByIdAsync(chapter.courseId)
    course.chapters.pull(chapter._id)
    await course.save()

    //send response
    res.status(200).json({
      message: 'Chapter deleted successfully!',
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}
