const mongoose = require('mongoose');

const Chapter = require('../models/chapter');
const CourseDetail = require('../models/courseDetail');
const { UserRole, findUserByIdAsync } = require('./auth.service');

const findChapterByIdAsync = async (chapterId) => {
  const chapter = await Chapter.findById(chapterId);

  if (!chapter) {
    const error = new Error('Chapter not found!');
    error.statusCode = 404;

    throw error;
  }

  return chapter;
};

const filterChaptersBySlugOrId = (chapterSlugOrId) => {
  if (mongoose.isValidObjectId(chapterSlugOrId)) {
    const chapterId = new mongoose.Types.ObjectId(chapterSlugOrId);
    return { _id: chapterId };
  }

  return { slug: chapterSlugOrId };
};

//check auth who can see this chapter content
const checkAuthChapterAsync = async (userId, courseId, chapterAuthorId) => {
  const user = await findUserByIdAsync(userId);

  const courseDetail = await CourseDetail.findOne({
    userId: userId,
    courseId: courseId,
  });

  if (
    !courseDetail && //learners check
    user.role.id !== UserRole.ADMIN.id && //admin
    user.role.id !== UserRole.ROOT.id && //ROOT
    user._id.toString() !== chapterAuthorId //teacher
  ) {
    const error = new Error('You do not have permission to do this action!');
    error.statusCode = 403;

    throw error;
  }

  return true;
};

module.exports = {
  findChapterByIdAsync,
  filterChaptersBySlugOrId,
  checkAuthChapterAsync,
};
