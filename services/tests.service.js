const Test = require('../models/test');

const findTestByIdAsync = async (testId) => {
  const test = await Test.findById(testId);

  if (!test) {
    const error = new Error('Test not found!');
    error.statusCode = 404;

    throw error;
  }

  return test;
};

module.exports = {
  findTestByIdAsync,
};
