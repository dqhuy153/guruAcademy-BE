const express = require('express');
const mongoose = require('mongoose');
const { body } = require('express-validator');

const chaptersController = require('../controllers/chapters');
const isAuth = require('../middleware/isAuth');
const Chapter = require('../models/chapter');
const { isTeacher } = require('../middleware/authRole');

const Router = express.Router();

//GET: /api/v1/chapters/:chapterSlugOrId
//teacher, learners of this course, admin, root
Router.get('/chapters/:chapterSlugOrId', isAuth, chaptersController.getChapter);

//POST: /api/v1/chapters
//teacher required
Router.post(
  '/chapters',
  isAuth,
  isTeacher,
  [
    body('courseId')
      .notEmpty()
      .withMessage('CourseId is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('number')
      .notEmpty()
      .withMessage("Chapter's number is required.")
      .isInt({
        min: 0,
      })
      .withMessage('Invalid type. Expected an Integer >= 0.')
      .custom((value, { req }) => {
        return Chapter.findOne({
          courseId: req.body.courseId,
          number: value,
        }).then((chapterDoc) => {
          if (chapterDoc) {
            return Promise.reject(`Chapter number ${value} is exists`);
          }
        });
      }),

    body('title', "Chapter's title is required.").notEmpty(),

    body('description').optional(),
  ],
  chaptersController.postNewChapter
);

//PUT: /api/v1/chapters
//teacher required
Router.put(
  '/chapters',
  isAuth,
  isTeacher,
  [
    body('id')
      .notEmpty()
      .withMessage('CourseId is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('number')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage("Chapter's number is required.")
      .isNumeric()
      .withMessage('Invalid type. Expected an Number.'),

    body('title')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage("Chapter's title is required."),

    body('slug')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Slug is required.')
      .matches('^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$')
      .withMessage("Invalid slug's type.")
      .custom((value, { req }) => {
        return Chapter.findOne({
          _id: {
            $ne: new mongoose.Types.ObjectId(req.body.id),
          },
          slug: value,
        }).then((chapterDoc) => {
          if (chapterDoc) {
            return Promise.reject(`Slug "${value}" is exists!`);
          }
        });
      }),

    body('status')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Status is required.')
      .isNumeric()
      .withMessage('Invalid type. Expected an Number.')
      .isInt({ max: 1, min: 0 })
      .withMessage('Status only excepts value: 0 & 1'),

    body('contents')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Chapter contents is required.')
      .isArray()
      .withMessage('Invalid type. Expected an Array.'),

    body('contents[*].typeId')
      .if(
        (value, { req }) =>
          req.body.contents !== undefined || req.body.contents !== []
      )
      .notEmpty()
      .withMessage('Type ID of content is required.')
      .isInt({ min: 0, max: 2 })
      .withMessage('Invalid type. Expected an Integer between 0 and 2.'),

    body('contents[*].contentId')
      .if(
        (value, { req }) =>
          req.body.contents !== undefined || req.body.contents !== []
      )
      .notEmpty()
      .withMessage('Content ID is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  chaptersController.updateChapter
);

//DELETE: /api/v1/chapters
//teacher required
Router.delete(
  '/chapters',
  isAuth,
  isTeacher,
  [
    body('id')
      .notEmpty()
      .withMessage('CourseId is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  chaptersController.deleteChapter
);

module.exports = Router;
