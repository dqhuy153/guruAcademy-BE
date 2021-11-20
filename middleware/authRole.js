const User = require('../models/user');
const {
  isAdmin,
  isRoot,
  isLearner,
  isTeacher,
} = require('../services/auth.service');

const isRootMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isRoot(roleId)) {
    const error = new Error('Authentication failed! Root permission required!');
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isAdminMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isAdmin(roleId)) {
    const error = new Error(
      'Authentication failed! Admin permission required!'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isLearnerMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isLearner(roleId)) {
    const error = new Error(
      'Authentication failed! Learner permission required!'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isTeacherMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isTeacher(roleId)) {
    const error = new Error(
      'Authentication failed! Teacher permission required!'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isRootOrAdminMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isAdmin(roleId) && !isRoot(roleId)) {
    const error = new Error(
      'Authentication failed! Root or Admin permission required!'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isTeacherOrLearnerMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isTeacher(roleId) && !isLearner(roleId)) {
    const error = new Error(
      'Authentication failed! Teacher or Learner permission required!'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isAdminOrTeacherMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isAdmin(roleId) && !isTeacher(roleId)) {
    const error = new Error(
      'Authentication failed! Admin or Teacher permission required!'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
};

const isRootOrAdminOrTeacherMiddleware = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const roleId = user.role.id;

  if (!isAdmin(roleId) && !isTeacher(roleId) && !isRoot(roleId)) {
    const error = new Error(
      'Authentication failed! Root or Admin or Teacher permission required!'
    );
    error.statusCode = 403;
    return next(error);
  }

  next();
};

module.exports = {
  isRoot: isRootMiddleware,
  isAdmin: isAdminMiddleware,
  isLearner: isLearnerMiddleware,
  isTeacher: isTeacherMiddleware,
  isRootOrAdmin: isRootOrAdminMiddleware,
  isTeacherOrLearner: isTeacherOrLearnerMiddleware,
  isAdminOrTeacher: isAdminOrTeacherMiddleware,
  isRootOrAdminOrTeacher: isRootOrAdminOrTeacherMiddleware,
};
