const express = require('express')

const adminUsersController = require('../../controllers/admin/users')
const isAuth = require('../../middleware/isAuth')
const { isRootOrAdmin } = require('../../middleware/authRole')

const Router = express.Router()

//GET: /api/v1/admin/users
//ADMIN: Get all users
Router.get('/users', isAuth, isRootOrAdmin, adminUsersController.getUsers)

module.exports = Router
