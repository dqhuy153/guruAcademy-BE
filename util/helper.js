const { validationResult } = require('express-validator')
const path = require('path')
const fs = require('fs')
const util = require('util')

//Helper functions
exports.isDate = string => {
  return new Date(string) !== 'Invalid Date' && !isNaN(new Date(string))
}

//check validation
exports.validationError = req => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed!')
    error.statusCode = 422
    error.data = errors.array()

    return error
  }
}

//delete (unlink) path
exports.unlinkPath = async filePath => {
  filePath = path.join(__dirname, '..', filePath)
  await util.promisify(fs.unlink)(filePath)
}

exports.getPagination = (page, size) => {
  const limit = size ? +size : 3
  const offset = page ? page * limit : 0

  return { limit, offset }
}

//getPage
exports.getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: dataB } = data
  const currentPage = page ? +page : 0
  const totalPages = Math.ceil(totalItems / limit)

  return { totalItems, dataB, totalPages, currentPage }
}

//pagination
exports.paginationPage = (dbase, limitNumber, pageNumber) => {
  // const { page, size } = req.query;
  const { limit, offset } = getPagination(pageNumber, limitNumber)
  return dbase.splice(offset, limit)

  // dataB.findAndCountAll({ limit, offset })
  //     .then(data => {
  //         const response = getPagingData(data, page, limit);
  //         // res.send(response);
  //     })
}

exports.getLastXDays = days => {
  const date = new Date()
  const last = new Date(date.getTime() - days * 24 * 60 * 60 * 1000)
  return last
}

exports.getLastXWeeks = weeks => {
  const date = new Date()
  const last = new Date(date.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)
  return last
}

exports.getLastXMonths = months => {
  const date = new Date()
  const last = new Date(date.getTime() - months * 30 * 24 * 60 * 60 * 1000)
  return last
}

exports.getLastXYears = years => {
  const date = new Date()
  const last = new Date(date.getTime() - years * 365 * 24 * 60 * 60 * 1000)
  return last
}
