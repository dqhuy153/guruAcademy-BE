const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const util = require('util');

//Helper functions
exports.isDate = (string) => {
  return new Date(string) !== 'Invalid Date' && !isNaN(new Date(string));
};

//check validation
exports.validationError = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed!');
    error.statusCode = 422;
    error.data = errors.array();

    return error;
  }
};

//delete (unlink) path
exports.unlinkPath = async (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  await util.promisify(fs.unlink)(filePath);
};

function getPagination(page, size) {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
}

//getPage
function getPagingData(data, page, limit) {
  const { count: totalItems, rows: dataB } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, dataB, totalPages, currentPage };
}

// const getPagination = (page, size) => {
//     const limit = size ? +size : 3;
//     const offset = page ? page * limit : 0;

//     return { limit, offset };
// };

// //getPage
// const getPagingData = (data, page, limit) => {
//     const { count: totalItems, rows: dataB } = data;
//     const currentPage = page ? +page : 0;
//     const totalPages = Math.ceil(totalItems / limit);

//     return { totalItems, dataB, totalPages, currentPage };
// };

//pagination
async function paginationPage(dbase, limitNumber, pageNumber) {
  // const { page, size } = req.query;
  const { limit, offset } = getPagination(pageNumber, limitNumber);
  return dbase.splice(offset, limit);

  // dataB.findAndCountAll({ limit, offset })
  //     .then(data => {
  //         const response = getPagingData(data, page, limit);
  //         // res.send(response);
  //     })
}
