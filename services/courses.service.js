const { findUserByIdAsync, UserRole } = require('./auth.service')
const Course = require('../models/course')

const findCourseByIdAsync = async courseId => {
  const course = await Course.findById(courseId)

  if (!course) {
    const error = new Error('Course not found!')
    error.statusCode = 404

    throw error
  }

  return course
}

const checkCourseAuthorization = (authorId, currentUserId) => {
  console.log(authorId, currentUserId)
  if (authorId.toString() !== currentUserId.toString()) {
    const error = new Error(
      'You do not have permission to do this action! This course is not your.'
    )
    error.statusCode = 403

    throw error
  }

  return true
}

//check auth who can see this course content
const checkAuthAccessCourseAsync = async (userId, courseId) => {
  const user = await findUserByIdAsync(userId)
  const course = await courseService.findCourseByIdAsync(courseId)

  const courseDetail = await CourseDetail.findOne({
    userId: userId,
    courseId: courseId,
  })

  if (
    !courseDetail && //learners check
    user.role.id !== UserRole.ADMIN.id && //admin
    user.role.id !== UserRole.ROOT.id && //ROOT
    !checkCourseAuthorization(course.author.toString(), userId) //teacher
  ) {
    const error = new Error('You do not have permission to do this action!')
    error.statusCode = 403

    throw error
  }

  return true
}

const checkCourseAuthorizationAsync = async (courseId, currentUserId) => {
  const course = await findCourseByIdAsync(courseId)
  return checkCourseAuthorization(
    course.author.toString(),
    currentUserId.toString()
  )
}

const checkCourseWriteableAsync = async (courseId, currentUserId) => {
  const user = await findUserByIdAsync(currentUserId)

  if (!courseId) {
    const error = new Error('Course not found!')
    error.statusCode = 404
    throw error
  }

  return (
    user.role.id === UserRole.ADMIN.id ||
    user.role.id === UserRole.ROOT.id ||
    (await checkCourseAuthorizationAsync(courseId, currentUserId))
  )
}

module.exports = {
  findCourseByIdAsync,
  checkCourseAuthorization,
  checkCourseAuthorizationAsync,
  checkAuthAccessCourseAsync,
  checkCourseWriteableAsync,
}
