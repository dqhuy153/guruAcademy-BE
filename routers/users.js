const express = require('express')
const { body, param } = require('express-validator')
const multer = require('multer')

const usersController = require('../controllers/users')
const { isRootOrAdmin } = require('../middleware/authRole')
const isAuth = require('../middleware/isAuth')
const User = require('../models/user')

const Router = express.Router()

//setup multer for receive files
//filter image only
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Invalid file type: ' +
          file.mimetype +
          '. Expected an image file: .png, .jpg, .jpeg, .webp'
      ),
      false
    )
  }
}

const storage = multer.diskStorage({
  destination: './upload/',
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname)
  },
})

const upload = multer({ storage, fileFilter })

//GET: /api/v1/users/all-info
//Authentication
//get all information of user
Router.get('/users/all-info', isAuth, usersController.getUserAllInfo)

//GET: /api/v1/users/profile
//Authentication
//get profile info only
Router.get('/users/profile', isAuth, usersController.getUserProfile)

//GET: /api/v1/users/:userId/profile
//public
//get user profile public
Router.get('/users/:userId/profile', usersController.getPublicUserProfile)

//GET: /api/v1/users/teaching-courses
//authentication require
//get teaching-courses only
Router.get(
  '/users/teaching-courses',
  isAuth,
  usersController.getUserTeachingCourses
)

//GET: /api/v1/users/learning-courses
//authentication require
//get learning-courses only
Router.get(
  '/users/learning-courses',
  isAuth,
  usersController.getUserLearningCourses
)

//GET: /api/v1/users/notifications
//authentication require
//get notifications only
Router.get('/users/notifications', isAuth, usersController.getUserNotifications)

//PUT: /api/v1/users/profile
//authentication required
//update user profile
Router.put(
  '/users/profile',
  upload.single('image'),
  isAuth,
  [
    body('firstName')
      .if(value => value !== undefined)
      .trim()
      .notEmpty()
      .withMessage('First name is required!'),

    body('lastName')
      .if(value => value !== undefined)
      .trim()
      .notEmpty()
      .withMessage('Last name is required!'),

    body('dateOfBirth')
      .if(value => value !== undefined)
      .toDate()
      .isISO8601()
      .withMessage('Invalid type. Date of birth must be a Date.')
      .isBefore(new Date().toISOString())
      .withMessage('Invalid date of birth. It must before today.'),

    body('address')
      .if(value => value !== undefined)
      .isObject()
      .withMessage('Invalid type. Expected an Object'),

    body('status')
      .if(value => value !== undefined)
      .notEmpty()
      .withMessage('Status is required.')
      .isInt()
      .withMessage('Invalid type. Expected an Number.')
      .custom(value => {
        const acceptableValues = [0, 1] //0: lock account, //1: active account
        if (!acceptableValues.includes(value)) {
          throw new Error(
            `Invalid value. Expected value in ${acceptableValues}`
          )
        } else {
          return true
        }
      }),

    body('socialLinks')
      .if(value => value !== undefined)
      .isObject()
      .withMessage('Invalid type. Expected an Object.'),
    body('socialLinks.facebook')
      .if(value => value !== undefined)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.instagram')
      .if(value => value !== undefined)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.linkedIn')
      .if(value => value !== undefined)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.github')
      .if(value => value !== undefined)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.twitter')
      .if(value => value !== undefined)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),

    body('imageUrl')
      .if(value => value !== undefined)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),

    body('newPassword')
      .if(value => value !== undefined)
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 5 })
      .withMessage('Minimum password is 5'),
  ],
  usersController.updateUserProfile
)

//PUT: /api/v1/change-password
//authentication required
//change user password
Router.put(
  '/users/change-password',
  isAuth,
  [
    body('oldPassword').notEmpty().withMessage('Old Password is required'),

    body('newPassword')
      .notEmpty()
      .withMessage('New Password is required')
      .isLength({ min: 5 })
      .withMessage('Minimum password is 5'),
  ],
  usersController.changeUserPassword
)

//*** */
//PUT: /api/v1/forgot-password
//authentication required
//change user password
// Router.put('/users/forgot-password', isAuth, usersController.forgotUserPassword);

//*** */
//POST: /api/v1/admin/users/profile
//admin & root required
//update user profile
Router.post(
  '/admin/users/profile',
  isAuth,
  isRootOrAdmin,
  upload.single('image'),
  [
    body('userId')
      .if(value => value !== undefined)
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('email')
      .if((value, { req }) => req.body.userId === undefined || null || '')
      .notEmpty()
      .withMessage('Email is required!')
      .isEmail()
      .withMessage('Invalid email!')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              `An account with email "${value}" is already exists`
            )
          }
        })
      })
      .normalizeEmail({ gmail_remove_dots: false }),

    body('firstName')
      .if(value => value !== undefined)
      .trim()
      .notEmpty()
      .withMessage('First name is required!'),

    body('lastName')
      .if(value => value !== undefined)
      .trim()
      .notEmpty()
      .withMessage('Last name is required!'),

    body('dateOfBirth')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .toDate()
      .isISO8601()
      .withMessage('Invalid type. Date of birth must be a Date.')
      .isBefore(new Date().toISOString())
      .withMessage('Invalid date of birth. It must before today.'),

    body('address')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .isObject()
      .withMessage('Invalid type. Expected an Object'),

    body('status')
      .if(value => value !== undefined)
      .notEmpty()
      .withMessage('Status is required.')
      .isInt()
      .withMessage('Invalid type. Expected an Number.')
      .custom(value => {
        const acceptableValues = [0, 1, 2, 20]
        //0: lock account, //1: active account //2: pending account //20: banned account
        if (!acceptableValues.includes(value)) {
          throw new Error(
            `Invalid value. Expected value in ${acceptableValues}`
          )
        } else {
          return true
        }
      }),

    body('socialLinks')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .isObject()
      .withMessage('Invalid type. Expected an Object.'),
    body('socialLinks.facebook')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.instagram')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.linkedIn')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.github')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),
    body('socialLinks.twitter')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),

    body('imageUrl')
      .optional()
      .exists({ checkNull: false, checkFalsy: false })
      .if(value => value)
      .isURL()
      .withMessage('Invalid type. Expected an URL.'),

    body('newPassword')
      .if(value => value !== undefined)
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 5 })
      .withMessage('Minimum password is 5'),
  ],
  usersController.adminUpdateUserProfile
)

//*** */
//DELETE: /api/v1/admin/users/:id
//admin & root required
//delete user
Router.delete(
  '/admin/users/:id',
  isAuth,
  isRootOrAdmin,
  [param('id').isMongoId().withMessage('Invalid type. Expected an ObjectId.')],
  usersController.adminDeleteUser
)

module.exports = Router
