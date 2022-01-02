const UserStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
  BANNED: 10,
}

const CommonStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
}

const AllStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
  BANNED: 10,
  DRAFT: 20,
}

const CourseStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
  DRAFT: 20,
}

const JwtConstants = {
  SECRET: process.env.ACCESS_TOKEN_SECRET,
  EXPIRED_TIME: '4h',
}

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
}

module.exports = {
  UserStatus,
  CommonStatus,
  AllStatus,
  CourseStatus,
  JwtConstants,
  UserRole,
}
