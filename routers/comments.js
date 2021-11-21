const express = require('express');
const { body, param } = require('express-validator');

const commentsController = require('../controllers/comments');
const isAuth = require('../middleware/isAuth');

const Router = express.Router();

//GET: /api/v1/comments/:id
//Teacher or Admin or Root require
Router.get('/comments/:id', isAuth, commentsController.getComment);

//POST: /api/v1/comments
//Teacher or Admin or Root require
Router.post(
  '/comments',
  isAuth,
  [
    body('content', 'Content is required.').notEmpty(),

    body('lessonId')
      .notEmpty()
      .withMessage('LessonId is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  commentsController.createComment
);

//PUT: /api/v1/comments/:id
//Teacher or Admin or Root require
Router.put(
  '/comments/:id',
  isAuth,
  [
    param('id')
      .notEmpty()
      .withMessage('Comment Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('content', 'content is required.').notEmpty(),

    body('status')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Status is required.')
      .isNumeric()
      .withMessage('Invalid type. Expected an Number.')
      .isInt({ max: 1, min: 0 })
      .withMessage('Status only excepts value: 0 & 1'),
  ],
  commentsController.updateComment
);

//DELETE: /api/v1/comments/:id
//Teacher or Admin or Root require
Router.delete(
  '/comments/:id',
  isAuth,
  [
    param('id')
      .notEmpty()
      .withMessage('Comment Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  commentsController.deleteComment
);

module.exports = Router;
