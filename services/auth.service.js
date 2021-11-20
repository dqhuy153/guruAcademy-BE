const User = require('../models/user');

const UserRole = {
  ROOT: {
    id: 0,
    name: 'root',
  },
  ADMIN: {
    id: 1,
    name: 'admin',
  },
  LEARNER: {
    id: 2,
    name: 'learner',
  },
  TEACHER: {
    id: 3,
    name: 'teacher',
  },
};

const findUserByIdAsync = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('Authentication failed!');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

const checkRoleAsync = async (userId) => {
  const user = await findUserByIdAsync(userId);
  return user.role.id;
};

const isRootAsync = async (userId) => {
  if ((await checkRoleAsync(userId)) === UserRole.ROOT.id) {
    return true;
  }
  return false;
};

const isRoot = (roleId) => {
  if (roleId === UserRole.ROOT.id) {
    return true;
  }
  return false;
};

const isAdminAsync = async (userId) => {
  if ((await checkRoleAsync(userId)) === UserRole.ADMIN.id) {
    return true;
  }
  return false;
};

const isAdmin = (roleId) => {
  if (roleId === UserRole.ADMIN.id) {
    return true;
  }
  return false;
};

const isLearnerAsync = async (userId) => {
  if ((await checkRoleAsync(userId)) === UserRole.LEARNER.id) {
    return true;
  }
  return false;
};

const isLearner = (roleId) => {
  if (roleId === UserRole.LEARNER.id) {
    return true;
  }
  return false;
};

const isTeacherAsync = async (userId) => {
  if ((await checkRoleAsync(userId)) === UserRole.TEACHER.id) {
    return true;
  }
  return false;
};

const isTeacher = (roleId) => {
  if (roleId === UserRole.TEACHER.id) {
    return true;
  }
  return false;
};

module.exports = {
  UserRole,
  findUserByIdAsync,
  checkRoleAsync,
  isRoot,
  isRootAsync,
  isAdmin,
  isAdminAsync,
  isLearner,
  isLearnerAsync,
  isTeacher,
  isTeacherAsync,
};
