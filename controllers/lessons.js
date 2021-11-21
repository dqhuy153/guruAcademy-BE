const Lesson = require('../models/lesson');
const { lessonService, chapterService, courseService } = require('../services');
const { uploadFile } = require('../services/s3');
const { unlinkPath, validationError } = require('../util/helper');

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

  const { title, description, chapterId, number } = req.body;
  const videoFile = req.file;

  try {
    //check if chapter exists
    const chapter = await chapterService.findChapterByIdAsync(chapterId);

    //post image to s3
    let uploadS3Result;
    if (videoFile) {
      //upload new image file
      uploadS3Result = await uploadFile(videoFile);

      //unlink image from local path (./upload)
      await unlinkPath(videoFile.path);
    }

    const lesson = new Lesson({
      title,
      number,
      description,
      chapter: chapterId,
      url: uploadS3Result ? `/files/${uploadS3Result.Key}` : '404',
    });

    await lesson.save();

    //push new lesson to chapter
    chapter.lessons.push(lesson._id);
    await chapter.save();

    res.status(201).json({
      message: 'Lesson created successfully!',
      data: {
        lesson,
      },
      success: true,
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

  const lessonId = req.params.id;
  const { title, description, status, number, attachments, tests } = req.body;
  const videoFile = req.file;

  try {
    const lesson = await lessonService.findLessonByIdAsync(lessonId);

    //check course's authorization
    const chapter = await chapterService.findChapterByIdAsync(lesson.chapter);

    await courseService.checkCourseAuthorizationAsync(
      chapter.courseId,
      req.userId.toString()
    );

    //check video file and post it to s3
    let uploadS3Result;
    if (videoFile) {
      //remove old image file
      await removeFile(lesson.url.split('/')[2]);

      //upload new image file
      uploadS3Result = await uploadFile(videoFile);

      //unlink image from local path (./upload)
      await unlinkPath(videoFile.path);
    }

    title ?? (lesson.title = title);
    description ?? (lesson.description = description);
    status ?? (lesson.status = status);
    number ?? (lesson.number = number);
    attachments ?? (lesson.attachments = attachments);
    tests ?? (lesson.tests = tests);
    uploadS3Result && (lesson.url = `/files/${uploadS3Result.Key}`);

    await lesson.save();

    res.status(200).json({
      message: 'Lesson updated successfully!',
      data: {
        lesson,
        success: true,
      },
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

  const lessonId = req.params.id;

  try {
    const lesson = await lessonService.findLessonByIdAsync(lessonId);

    //check course's authorization
    const chapter = await chapterService.findChapterByIdAsync(lesson.chapter);

    await courseService.checkCourseAuthorizationAsync(
      chapter.courseId,
      req.userId.toString()
    );

    await lessonService.findLessonByIdAndDeleteAsync(lessonId);

    chapter.lessons.pull(lesson._id);
    await chapter.save();

    res.status(200).json({
      message: 'Lesson deleted successfully!',
      success: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
