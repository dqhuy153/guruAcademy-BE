const express = require('express');
const { body, param } = require('express-validator');

const attachmentController = require('../controllers/attachments');
const isAuth = require('../middleware/isAuth');
const { isRootOrAdminOrTeacher } = require('../middleware/authRole');
const Attachment = require('../models/attachment');

const Router = express.Router();

//GET: /api/v1/attachments/:id
//Teacher or Admin or Root require
Router.get(
  '/attachments/:id',
  isAuth,
  isRootOrAdminOrTeacher,
  attachmentController.getAttachment
);

//POST: /api/v1/attachments
//Teacher or Admin or Root require
Router.post(
  '/attachments',
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
  ],
  attachmentController.createAttachment
);

//PUT: /api/v1/attachments/:id
//Teacher or Admin or Root require
Router.put(
  '/attachments/:id',
  isAuth,
  isRootOrAdminOrTeacher,
  [
    param('id')
      .notEmpty()
      .withMessage('Attachment Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('title', 'Title is required.').notEmpty(),

    body('description', 'Description is required.').optional(),

    body('number').optional(),

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
        return Attachment.findOne({
          _id: {
            $ne: new mongoose.Types.ObjectId(req.params.id),
          },
          slug: value,
        }).then((attachmentDoc) => {
          if (attachmentDoc) {
            return Promise.reject(`Slug "${value}" is exists!`);
          }
        });
      }),
  ],
  attachmentController.updateAttachment
);

//DELETE: /api/v1/attachments/:id
//Teacher or Admin or Root require
Router.delete(
  '/attachments/:id',
  isAuth,
  isRootOrAdminOrTeacher,
  [
    param('id')
      .notEmpty()
      .withMessage('Attachment Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  attachmentController.deleteAttachment
);

module.exports = Router;
