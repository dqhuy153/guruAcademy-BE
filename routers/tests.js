const express = require('express');
const testController = require('../controllers/test');

const Router = express.Router();

Router.get('/tests/:id', testController.getTest);

Router.post('/tests', testController.createTest);

Router.put('/tests/:id', testController.updateTest);

Router.delete('/tests/:id', testController.deleteTest);

module.exports = Router;
