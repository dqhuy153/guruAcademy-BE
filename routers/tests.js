const express = require('express');
const { body, param } = require('express-validator');

const testController = require('../controllers/tests');
const isAuth = require('../middleware/isAuth');
const { isRootOrAdminOrTeacher } = require('../middleware/authRole');
const Test = require('../models/test');

const Router = express.Router();

//GET: /api/v1/tests/:id
//Teacher or Admin or Root require
Router.get(
  '/tests/:id',
  isAuth,
  isRootOrAdminOrTeacher,
  testController.getTest
);

//POST: /api/v1/tests
//Teacher or Admin or Root require
Router.post(
  '/tests',
  isAuth,
  isRootOrAdminOrTeacher,
  [
    body('title', 'Title is required.').notEmpty(),

    body('description', 'Description is required.').optional(),

    body('lessonId')
      .notEmpty()
      .withMessage('LessonId is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('number').optional(),

    body('questions')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Questions of test is required.')
      .isArray()
      .withMessage('Invalid type. Expected an Array.'),

    body('questions[*].question')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('Question is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].a')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('A is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].b')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('B is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].c')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .optional()
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].d')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .optional()
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].e')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .optional()
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].answer')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('Answer is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),
  ],
  testController.createTest
);

//PUT: /api/v1/tests/:id
//Teacher or Admin or Root require
Router.put(
  '/tests/:id',
  isAuth,
  isRootOrAdminOrTeacher,
  [
    param('id')
      .notEmpty()
      .withMessage('Test Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('title', 'Title is required.').notEmpty(),

    body('description', 'Description is required.').optional(),

    body('number').optional(),

    body('questions')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Questions of test is required.')
      .isArray()
      .withMessage('Invalid type. Expected an Array.'),

    body('status')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Status is required.')
      .isNumeric()
      .withMessage('Invalid type. Expected an Number.')
      .isInt({ max: 1, min: 0 })
      .withMessage('Status only excepts value: 0 & 1'),

    body('slug')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Slug is required.')
      .matches('^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$')
      .withMessage("Invalid slug's type.")
      .custom((value, { req }) => {
        return Test.findOne({
          _id: {
            $ne: new mongoose.Types.ObjectId(req.params.id),
          },
          slug: value,
        }).then((testDoc) => {
          if (testDoc) {
            return Promise.reject(`Slug "${value}" is exists!`);
          }
        });
      }),

    body('questions[*].question')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('Question is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].a')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('A is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].b')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('B is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].c')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .optional()
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].d')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .optional()
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].e')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .optional()
      .isString()
      .withMessage('Invalid type. Expected a String.'),

    body('questions[*].answer')
      .if(
        (value, { req }) =>
          req.body.questions !== undefined || req.body.questions !== []
      )
      .notEmpty()
      .withMessage('Answer is required.')
      .isString()
      .withMessage('Invalid type. Expected a String.'),
  ],
  testController.updateTest
);

//DELETE: /api/v1/tests/:id
//Teacher or Admin or Root require
Router.delete(
  '/tests/:id',
  isAuth,
  isRootOrAdminOrTeacher,
  [
    param('id')
      .notEmpty()
      .withMessage('Test Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  testController.deleteTest
);

module.exports = Router;
