const Lesson = require('../models/lesson');
const Comment = require('../models/comment');
const { chapterService, lessonService, courseService } = require('../services');
const { validationError } = require('../util/helper');

exports.getComment = async (req, res, next) => {
  const commentId = req.params.id;

  try {
    const comment = await Comment.findById(commentId).populate({
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
    });

    if (!comment) {
      const error = new Error('Comment not found!');
      error.statusCode = 404;
      throw error;
    }

    //check who can see this lesson
    //Admin, root, teacher author, learner who buy course
    //check auth who can see this chapter content
    await chapterService.checkAuthChapterAsync(
      req.userId,
      comment.lesson.chapter.courseId._id,
      comment.lesson.chapter.courseId.author._id.toString()
    );

    res.status(200).json({
      message: 'Comment fetched successfully',
      data: {
        comment,
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

exports.createComment = async (req, res, next) => {
  //check validation
  const error = validationError(req);
  if (error) return next(error);

  const userId = req.userId;
  const { content, lessonId, number } = req.body;

  try {
    //check if lesson exists
    const lesson = await Lesson.findById(lessonId).populate({
      path: 'chapter',
      select: 'courseId',
    });

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      lesson.chapter.courseId.toString(),
      req.userId.toString()
    );

    //create comment
    const comment = new Comment({
      content,
      user: userId,
      lesson: lessonId,
      number,
    });

    await comment.save();

    //push new comment to lesson
    lesson.comments.push(comment._id);
    await lesson.save();

    res.status(201).json({
      message: 'Comment created successfully',
      data: {
        comment,
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

exports.updateComment = async (req, res, next) => {
  //check validation
  const error = validationError(req);
  if (error) return next(error);

  const commentId = req.params.id;
  const { content, status } = req.body;

  try {
    //check if comment exists
    const comment = await Comment.findById(commentId).populate({
      path: 'lesson',
      populate: {
        path: 'chapter',
        select: 'courseId',
      },
    });

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      comment.lesson.chapter.courseId.toString(),
      req.userId.toString()
    );

    //update comment
    if (content) comment.content = content;
    if (status !== undefined) comment.status = status;

    await comment.save();

    res.status(201).json({
      message: 'Comment updated successfully',
      data: {
        comment,
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

exports.deleteComment = async (req, res, next) => {
  //check validation
  const error = validationError(req);
  if (error) return next(error);

  const commentId = req.params.id;

  try {
    //check if comment exists
    const comment = await Comment.findById(commentId).populate({
      path: 'lesson',
      populate: {
        path: 'chapter',
        select: 'courseId',
      },
    });

    const lesson = await lessonService.findLessonByIdAsync(comment.lesson);

    //check course's authorization
    await courseService.checkCourseWriteableAsync(
      comment.lesson.chapter.courseId.toString(),
      req.userId.toString()
    );

    //delete comment
    await comment.findByIdAndDelete(commentId);

    //remove comment from lesson
    lesson.comments.pull(comment._id);
    await lesson.save();

    res.status(200).json({
      message: 'Comment deleted successfully',
      success: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
