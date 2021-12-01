const User = require('../../models/user')

exports.getUsers = async (req, res, next) => {
  const role = req.query.role
  // ?role=admin
  // ?role=root
  // ?role=teacher
  // ?role=learner

  let query
  if (role) {
    query = { 'role.name': role }
  }

  try {
    //check user
    const users = await User.find(query).select([
      '-password',
      '-__v',
      '-notifications',
    ])

    const usersData = users.map(user => {
      return {
        ...user._doc,
        totalLearningCourses: user.learningCourses.length,
        totalTeachingCourses: user.teachingCourses.length,
        learningCourses: undefined,
        teachingCourses: undefined,
      }
    })

    //send response
    res.status(200).json({
      message: 'Fetch users profile successfully!',
      data: {
        users: usersData,
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
