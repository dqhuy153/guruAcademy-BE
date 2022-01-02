const express = require('express')

const reportController = require('../controllers/report')
const { isRootOrAdmin } = require('../middleware/authRole')
const isAuth = require('../middleware/isAuth')

const Router = express.Router()

//public api
//POST: /api/v1/report/public/top-teachers
Router.get('/public/top-teachers/:count', reportController.topTeacher)

//root & admin
//POST: /api/v1/report/dashborad
Router.get(
  '/admin/dashboard',
  isAuth,
  isRootOrAdmin,
  reportController.dashboard
)

module.exports = Router
