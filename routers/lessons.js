const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');

const isAuth = require('../middleware/isAuth');
const lessonsController = require('../controllers/lessons');
const { isRootOrAdminOrTeacher, isTeacher } = require('../middleware/authRole');

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

    body('index').optional(),

    body('description').optional(),
  ],
  lessonsController.createLesson
);

// //DELETE: /api/v1/lessons
// //authentication require
// Router.delete(
//   '/lessons',
//   isAuth,
//   [
//     body('id')
//       .notEmpty()
//       .withMessage('CourseId is required.')
//       .isMongoId()
//       .withMessage('Invalid type. Expected an ObjectId.'),
//   ],
//   lessonsController.deleteNotification
// );

module.exports = Router;
