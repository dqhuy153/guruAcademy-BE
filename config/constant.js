const UserStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
  BANNED: 10,
};

const CommonStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
};

const CourseStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING: 2,
  DRAFT: 20,
};

const JwtConstants = {
  SECRET: process.env.ACCESS_TOKEN_SECRET,
  EXPIRED_TIME: '24h',
};

module.exports = {
  UserStatus,
  CommonStatus,
  CourseStatus,
  JwtConstants,
};
