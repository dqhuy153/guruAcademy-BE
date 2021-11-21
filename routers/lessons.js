const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');

const isAuth = require('../middleware/isAuth');
const lessonsController = require('../controllers/lessons');
const { isRootOrAdminOrTeacher, isTeacher } = require('../middleware/authRole');
const Attachment = require('../models/attachment');
const Test = require('../models/test');

const Router = express.Router();

//setup multer for receive files
//filter image only
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'video/gif' ||
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'video/ogg' ||
    file.mimetype === 'video/wmv' ||
    file.mimetype === 'video/webm' ||
    file.mimetype === 'video/avi' ||
    file.mimetype === 'video/mkv' ||
    file.mimetype === 'video/x-flv' ||
    file.mimetype === 'video/mov'
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type: ' +
          file.mimetype +
          '. Expected an image file: .gif, .mp4, .ogg, .wmv, .webm, .avi, .mkv, .x-flv, .mov'
      ),
      false
    );
  }
};

const storage = multer.diskStorage({
  destination: './upload/',
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const upload = multer({ storage, fileFilter });

//GET: /api/v1/lessons/:lessonSlugOrId
//authentication require
Router.get(
  '/lessons/:lessonSlugOrId',
  isAuth,
  isRootOrAdminOrTeacher,
  lessonsController.getLesson
);

//POST: /api/v1/lessons
//teacher required
Router.post(
  '/lessons',
  isAuth,
  isTeacher,
  upload.single('video'),
  [
    body('title', "Lesson's title is required.").notEmpty(),

    body('chapterId')
      .notEmpty()
      .withMessage('ChapterId is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('number').optional(),

    body('description').optional(),
  ],
  lessonsController.createLesson
);

//PUT: /api/v1/lessons/:id
//teacher required
Router.put(
  '/lessons/:id',
  isAuth,
  isTeacher,
  upload.single('video'),
  [
    body('id')
      .notEmpty()
      .withMessage('Lesson Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('title', "Lesson's title is required.").notEmpty(),

    body('number').optional(),

    body('description').optional(),

    body('status')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Status is required.')
      .isNumeric()
      .withMessage('Invalid type. Expected an Number.')
      .isInt({ max: 1, min: 0 })
      .withMessage('Status only excepts value: 0 & 1'),

    body('attachments')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Attachments of lessons is required.')
      .isArray()
      .withMessage('Invalid type. Expected an Array.'),

    body('attachments[*]')
      .if(
        (value, { req }) =>
          req.body.attachments !== undefined || req.body.attachments !== []
      )
      .notEmpty()
      .withMessage('Type ID of attachment is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.')
      .custom((value, { req }) => {
        return Attachment.findById(value).then((attachmentDoc) => {
          if (!attachmentDoc) {
            return Promise.reject(`Attachment ${value} is not exists!`);
          }

          if (attachmentDoc.lesson.toString() !== req.params.id) {
            return Promise.reject(`Attachment ${value} is not in this lesson!`);
          }
        });
      }),

    body('tests')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Tests of lessons is required.')
      .isArray()
      .withMessage('Invalid type. Expected an Array.'),

    body('tests[*]')
      .if(
        (value, { req }) =>
          req.body.tests !== undefined || req.body.tests !== []
      )
      .notEmpty()
      .withMessage('Type ID of test is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.')
      .custom((value, { req }) => {
        return Test.findById(value).then((testDoc) => {
          if (!testDoc) {
            return Promise.reject(`Test ${value} is not exists!`);
          }

          if (testDoc.lesson.toString() !== req.params.id) {
            return Promise.reject(`Test ${value} is not in this lesson!`);
          }
        });
      }),
  ],
  lessonsController.updateLesson
);

//DELETE: /api/v1/lessons/:id
//teacher require
Router.delete(
  '/lessons/:id',
  isAuth,
  isTeacher,
  [
    param('id')
      .notEmpty()
      .withMessage('Lesson Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  lessonsController.deleteLesson
);

module.exports = Router;
