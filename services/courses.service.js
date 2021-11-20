const Course = require('../models/course');

const findCourseByIdAsync = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    const error = new Error('Course not found!');
    error.statusCode = 404;

    throw error;
  }

  return course;
};

const checkCourseAuthorization = (authorId, currentUserId) => {
  if (authorId !== currentUserId) {
    const error = new Error(
      'You do not have permission to do this action! This course is not your.'
    );
    error.statusCode = 403;

    throw error;
  }

  return true;
};

const checkCourseAuthorizationAsync = async (courseId, currentUserId) => {
  const course = await findCourseByIdAsync(courseId);
  return checkCourseAuthorization(course.author.toString(), currentUserId);
};

module.exports = {
  findCourseByIdAsync,
  checkCourseAuthorization,
  checkCourseAuthorizationAsync,
};
