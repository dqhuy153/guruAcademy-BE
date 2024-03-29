const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Notification = require('../models/notification')
const User = require('../models/user')
const { validationError } = require('../util/helper')
const { UserRole } = require('../services/auth.service')
const { UserStatus, JwtConstants } = require('../config/constant')

//Signup
exports.signup = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  //get req body
  const email = req.body.email
  const password = req.body.password
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const dateOfBirth = req.body.dateOfBirth
  const address = req.body.address
  const phoneNumber = req.body.phoneNumber
  const role = req.body.role

  const description = req.body.description
  const socialLinks = req.body.socialLinks
  const imageUrl = req.body.imageUrl
  const cvUrl = req.body.cvUrl

  let roleData
  let status

  if (role === UserRole.ADMIN.id) {
    roleData = UserRole.ADMIN

    status = 2 //pending
  }

  if (role === UserRole.LEARNER.id) {
    roleData = UserRole.LEARNER

    status = 1 //active
  }

  if (role === UserRole.TEACHER.id) {
    roleData = UserRole.TEACHER

    status = 2 //pending
  }

  try {
    //hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    //create new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth,
      address,
      role: roleData,
      status,
      phoneNumber,
      imageUrl,
      cvUrl,
      description,
      socialLinks,
      learningCourses: [],
      teachingCourses: [],
      notifications: [],
    })

    const savedUser = await user.save()

    //send response
    res.status(201).json({
      message: 'User created successfully!',
      data: {
        userId: savedUser._id,
      },
      success: true,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }

    //send error response
    next(err)
  }
}

//Login
exports.login = async (req, res, next) => {
  //check validation
  const error = validationError(req)
  if (error) return next(error)

  //get req body
  const email = req.body.email
  const password = req.body.password

  try {
    //check user's email
    const user = await User.findOne({ email: email })

    if (!user) {
      const error = new Error(`Account with email "${email}" not found!`)
      error.statusCode = 401

      throw error
    }

    //check user's password
    const isMatchPassword = await bcrypt.compare(password, user.password)

    if (!isMatchPassword) {
      const error = new Error('Wrong password!')
      error.statusCode = 401

      throw error
    }

    //check user banned
    if (user.status === UserStatus.BANNED) {
      const error = new Error(
        'Your account has been suspended. Please contact with us if it have any mistake!'
      )
      error.statusCode = 403

      throw error
    }

    //check user locked
    if (user.status === UserStatus.INACTIVE) {
      //unlock user
      user.status === UserStatus.ACTIVE
      await user.save()

      const unlockNotification = new Notification({
        userId: user._id,
        title: 'Your account has been unlocked!',
        content: 'Welcome back. Your account has been unlocked!',
      })

      await unlockNotification.save()

      user.notifications.push(unlockNotification._id)
      await user.save()
    }

    //create jwt for new login
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
        status: user.status,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
      JwtConstants.SECRET,
      {
        expiresIn: JwtConstants.EXPIRED_TIME,
      }
    )

    //send response
    res.status(200).json({
      message: 'Login successfully!',
      data: {
        token,
        userId: user._id.toString(),
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
//getUser '/'
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      const error = new Error(`not found current user!!`)
      error.statusCode = 401

      throw error
    }

    res.status(200).json({
      message: 'load user successfully!',
      data: {
        user,
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
