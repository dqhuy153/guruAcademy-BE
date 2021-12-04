const jwt = require('jsonwebtoken')
const { UserStatus } = require('../config/constant')

const User = require('../models/user')

module.exports = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1] //header: {'Authorization': 'Bearer token'}

  if (!token) {
    const error = new Error('Access token not found.')

    error.statusCode = 401
    error.success = false

    return next(error)
  }

  let decodedToken

  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  } catch (error) {
    error.statusCode = 500
    error.success = false

    return next(error)
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated.')
    error.statusCode = 403
    error.success = false

    return next(error)
  }

  //check authentication
  const { userId } = decodedToken
  const user = await User.findById(userId)

  if (!user) {
    const error = new Error('Authentication failed!')
    error.statusCode = 401

    return next(error)
  }

  //check status
  if (user.status === UserStatus.BANNED) {
    const error = new Error(
      'Your account has been suspended. Please contact with us if it have any mistake!'
    )
    error.statusCode = 403

    return next(error)
  }

  req.userId = userId
  next()
}
