const express = require('express');
const mongoose = require('mongoose');
const { body, param } = require('express-validator');

const chaptersController = require('../controllers/chapters');
const isAuth = require('../middleware/isAuth');
const Chapter = require('../models/chapter');
const { isTeacher } = require('../middleware/authRole');
const Lesson = require('../models/lesson');

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
      .if((value) => value !== undefined)
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

//PUT: /api/v1/chapters/:id
//teacher required
Router.put(
  '/chapters/:id',
  isAuth,
  isTeacher,
  [
    param('id')
      .notEmpty()
      .withMessage('Chapter Id is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),

    body('number')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage("Chapter's number is required.")
      .isInt({ min: 0 })
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

    body('lessons')
      .if((value) => value !== undefined)
      .notEmpty()
      .withMessage('Chapter lessons is required.')
      .isArray()
      .withMessage('Invalid type. Expected an Array.'),

    body('lessons[*]')
      .if(
        (value, { req }) =>
          req.body.lessons !== undefined || req.body.lessons !== []
      )
      .notEmpty()
      .withMessage('Type ID of lesson is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.')
      .custom((value, { req }) => {
        return Lesson.findById(value).then((lessonDoc) => {
          if (!lessonDoc) {
            return Promise.reject(`Lesson ${value} is not exists!`);
          }

          if (lessonDoc.chapter.toString() !== req.params.id) {
            return Promise.reject(`Lesson ${value} is not in this chapter!`);
          }
        });
      }),
  ],
  chaptersController.updateChapter
);

//DELETE: /api/v1/chapters/:id
//teacher required
Router.delete(
  '/chapters/:id',
  isAuth,
  isTeacher,
  [
    param('id')
      .notEmpty()
      .withMessage('CourseId is required.')
      .isMongoId()
      .withMessage('Invalid type. Expected an ObjectId.'),
  ],
  chaptersController.deleteChapter
);

module.exports = Router;
