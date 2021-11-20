const Lesson = require('../models/lesson');
const { lessonService, chapterService } = require('../services');

exports.getLesson = async (req, res, next) => {
  const lessonId = req.params.lessonSlugOrId;

  try {
    const lesson = await lessonService.findLessonByIdAsync(lessonId);

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.createLesson = async (req, res, next) => {
  //check validation
  const error = validationError(req);
  if (error) return next(error);

  const { title, description, chapterId, index } = req.body;

  try {
    //check if chapter exists
    await chapterService.findChapterByIdAsync(chapterId);

    const lesson = new Lesson({
      title,
      description,
      chapterId,
      index,
    });

    await lesson.save();
    res.status(201).json({
      success: true,
      lesson,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  //check validation
  const error = validationError(req);
  if (error) return next(error);

  const lessonId = req.body.id;

  try {
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      const error = new Error('Lesson not found!');
      error.statusCode = 404;

      throw error;
    }

    lesson.title = req.body.title;
    lesson.description = req.body.description;

    await lesson.save();
    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  //check validation
  const error = validationError(req);
  if (error) return next(error);

  const lessonId = req.body.id;

  try {
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      const error = new Error('Lesson not found!');
      error.statusCode = 404;

      throw error;
    }

    await lesson.remove();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
