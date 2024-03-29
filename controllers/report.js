const User = require('../models/user')
const Course = require('../models/course')
const Feedback = require('../models/feedback')
const { UserRole } = require('../services/auth.service')
const {
  getLastXDays,
  getLastXMonths,
  getLastXYears,
} = require('../util/helper')
const { UserStatus, CourseStatus } = require('../config/constant')
const CourseDetail = require('../models/courseDetail')
const CourseCategory = require('../models/courseCategory')

exports.topTeacher = async (req, res, next) => {
  const count = +req.query.count || +req.params.count || 10

  try {
    const teachers = await User.aggregate([
      {
        $match: { 'role.id': 3 },
      },
      {
        $lookup: {
          from: 'Course',
          localField: 'teachingCourses',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $project: {
          email: 1,
          firstName: 1,
          lastName: 1,
          description: 1,
          imageUrl: 1,
          socialLinks: 1,
          learnersNumber: { $size: '$teachingCourses.learnersDetail' },
        },
      },
      {
        $sort: { learnersNumber: -1 },
      },
      {
        $limit: count,
      },
    ])

    if (!teachers) {
      const error = new Error('Teachers not found!')
      error.statusCode = 404

      throw error
    }

    res.status(200).json({
      message: 'Fetch top teachers successfully!',
      data: {
        teachers,
      },
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.dashboard = async (req, res, next) => {
  try {
    //find top 10 teachers
    //sort by number of learners
    const teachers = await User.find({ 'role.id': 3 })
      .select('_id firstName lastName teachingCourses status imageUrl email')
      .populate([
        {
          path: 'teachingCourses',
          select: 'learnersDetail',
          populate: [
            {
              path: 'learnersDetail',
              select: '_id payment status',
            },
            {
              path: 'feedbacks',
              select: '_id rating status',
            },
          ],
        },
      ])
    //by Learners
    const top10TeachersByLearners = teachers
      .map(teacher => ({
        ...teacher._doc,
        learnersNumber: teacher.teachingCourses.reduce(
          (acc, course) => acc + course.learnersDetail.length,
          0
        ),
        teachingCourses: undefined,
      }))
      .sort((a, b) => b.learnersNumber - a.learnersNumber)
      .slice(0, 10)
    //by Revenue
    const top10TeachersByRevenue = teachers
      .map(teacher => ({
        ...teacher._doc,
        revenue: teacher.teachingCourses.reduce(
          (acc, course) =>
            acc +
            course.learnersDetail.reduce(
              (acc, learner) => acc + learner.payment?.price || 0,
              0
            ),
          0
        ),
        teachingCourses: undefined,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
    //by Courses
    const top10TeachersByCourses = teachers
      .map(teacher => ({
        ...teacher._doc,
        coursesNumber: teacher.teachingCourses.length,
        teachingCourses: undefined,
      }))
      .sort((a, b) => b.coursesNumber - a.coursesNumber)
      .slice(0, 10)

    //by Rating
    const top10TeachersByRating = teachers
      .map(teacher => ({
        ...teacher._doc,
        rating:
          teacher.teachingCourses?.reduce(
            (acc, course) =>
              acc +
              course.feedbacks?.reduce(
                (acc, feedback) => acc + feedback?.rating,
                0
              ),
            0
          ) /
          teacher.teachingCourses?.reduce(
            (acc, course) => acc + course?.feedbacks.length,
            0
          ),
        teachingCourses: undefined,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)

    //find top 10 courses
    //sort by number of learners
    const courses = await Course.find()
      .select('-__v -streams -chapters -tags -description')
      .populate([
        {
          path: 'learnersDetail',
          select: '_id payment status',
        },
        {
          path: 'feedbacks',
          select: '_id rating status',
        },
        {
          path: 'author',
          select: '_id firstName lastName email imageUrl',
        },
        {
          path: 'topic',
          select: '_id title status discountPercent',
          populate: {
            path: 'courseCategoryId',
            select: '_id title status discountPercent',
          },
        },
      ])
    //by Learners
    const top10CoursesByLearners = courses
      .map(course => ({
        ...course._doc,
        learnersNumber: course.learnersDetail.length,
        learnersDetail: undefined,
        feedbacks: undefined,
      }))
      .sort((a, b) => b.learnersNumber - a.learnersNumber)
      .slice(0, 10)

    //by Revenue
    const top10CoursesByRevenue = courses
      .map(course => ({
        ...course._doc,
        revenue: course.learnersDetail.reduce(
          (acc, learner) => acc + learner.payment?.price || 0,
          0
        ),
        learnersDetail: undefined,
        feedbacks: undefined,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    //by Rating
    const top10CoursesByRating = courses
      .map(course => ({
        ...course._doc,
        rating:
          course.feedbacks.reduce(
            (acc, feedback) => acc + feedback?.rating,
            0
          ) / course.feedbacks.length,
        learnersDetail: undefined,
        feedbacks: undefined,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)

    //find total number of learners
    const activeLearners = await User.find({
      'role.id': UserRole.LEARNER.id,
      status: UserStatus.ACTIVE,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalActiveLearners = activeLearners.length

    const pendingLearners = await User.find({
      'role.id': UserRole.LEARNER.id,
      status: UserStatus.PENDING,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalPendingLearners = pendingLearners.length

    const inactiveLearners = await User.find({
      'role.id': UserRole.LEARNER.id,
      status: UserStatus.INACTIVE,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalInactiveLearners = inactiveLearners.length

    const bannedLearners = await User.find({
      'role.id': UserRole.LEARNER.id,
      status: UserStatus.BANNED,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalBannedLearners = bannedLearners.length

    const totalLearners =
      totalActiveLearners +
      totalPendingLearners +
      totalInactiveLearners +
      totalBannedLearners

    //find new learners today
    const newLearnersToday = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }).countDocuments()

    //find new learners in last 7 days
    const newLearners7days = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXDays(7),
      },
    }).countDocuments()

    //find new learners in last 14 days
    const newLearners14days = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXDays(14),
      },
    }).countDocuments()

    //find new learners in last 1 month
    const newLearners1month = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXMonths(1),
      },
    }).countDocuments()

    //find new learners in last 2 months
    const newLearners2months = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXMonths(2),
      },
    }).countDocuments()

    //find new learners in last 3 months
    const newLearners3months = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXMonths(3),
      },
    }).countDocuments()

    //find new learners in last 6 months
    const newLearners6months = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXMonths(6),
      },
    }).countDocuments()

    //find new learners in last 1 year
    const newLearners1year = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXYears(1),
      },
    }).countDocuments()

    //find new learners in last 2 years
    const newLearners2years = await User.find({
      'role.id': UserRole.LEARNER.id,
      createdAt: {
        $gte: getLastXYears(2),
      },
    }).countDocuments()

    //find total number of Teachers
    const activeTeachers = await User.find({
      'role.id': UserRole.TEACHER.id,
      status: UserStatus.ACTIVE,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalActiveTeachers = activeTeachers.length

    const pendingTeachers = await User.find({
      'role.id': UserRole.TEACHER.id,
      status: UserStatus.PENDING,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalPendingTeachers = pendingTeachers.length

    const inactiveTeachers = await User.find({
      'role.id': UserRole.TEACHER.id,
      status: UserStatus.INACTIVE,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalInactiveTeachers = inactiveTeachers.length

    const bannedTeachers = await User.find({
      'role.id': UserRole.TEACHER.id,
      status: UserStatus.BANNED,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')
    const totalBannedTeachers = bannedTeachers.length

    const totalTeachers =
      totalActiveTeachers +
      totalPendingTeachers +
      totalInactiveTeachers +
      totalBannedTeachers

    //find new teachers today
    const newTeachersToday = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }).countDocuments()

    //find new Teachers in last 7 days
    const newTeachers7days = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXDays(7),
      },
    }).countDocuments()

    //find new Teachers in last 14 days
    const newTeachers14days = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXDays(14),
      },
    }).countDocuments()

    //find new Teachers in last 1 month
    const newTeachers1month = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXMonths(1),
      },
    }).countDocuments()

    //find new Teachers in last 2 months
    const newTeachers2months = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXMonths(2),
      },
    }).countDocuments()

    //find new Teachers in last 3 months
    const newTeachers3months = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXMonths(3),
      },
    }).countDocuments()

    //find new Teachers in last 6 months
    const newTeachers6months = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXMonths(6),
      },
    }).countDocuments()

    //find new Teachers in last 1 year
    const newTeachers1year = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXYears(1),
      },
    }).countDocuments()

    //find new Teachers in last 2 years
    const newTeachers2years = await User.find({
      'role.id': UserRole.TEACHER.id,
      createdAt: {
        $gte: getLastXYears(2),
      },
    }).countDocuments()

    //find total number of courses
    const activeCourses = await Course.find({
      status: CourseStatus.ACTIVE,
    })
      .select('-__v -learnersDetail')
      .populate({
        path: 'topic',
        select: '_id title status discountPercent',
        populate: {
          path: 'courseCategoryId',
          select: '_id title status discountPercent',
        },
      })
      .sort('-createdAt')
    const totalActiveCourses = activeCourses.length

    const pendingCourses = await Course.find({
      status: CourseStatus.PENDING,
    })
      .select('-__v -learnersDetail')
      .populate([
        {
          path: 'topic',
          select: '_id title status discountPercent',
          populate: {
            path: 'courseCategoryId',
            select: '_id title status discountPercent',
          },
        },
        {
          path: 'author',
          select: '_id firstName lastName email status',
        },
      ])
      .sort('-createdAt')
    const totalPendingCourses = pendingCourses.length

    const inactiveCourses = await Course.find({
      status: CourseStatus.INACTIVE,
    })
      .select('-__v -learnersDetail')
      .sort('-createdAt')
    const totalInactiveCourses = inactiveCourses.length

    const draftCourses = await Course.find({
      status: CourseStatus.DRAFT,
    })
      .select('-__v -learnersDetail')
      .sort('-createdAt')
    const totalDraftCourses = draftCourses.length

    const totalCourses =
      totalActiveCourses +
      totalPendingCourses +
      totalInactiveCourses +
      totalDraftCourses

    //find new courses today
    const newCoursesToday = await Course.find({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }).countDocuments()

    //find new Courses in last 7 days
    const newCourses7days = await Course.find({
      createdAt: {
        $gte: getLastXDays(7),
      },
    }).countDocuments()

    //find new Courses in last 14 days
    const newCourses14days = await Course.find({
      createdAt: {
        $gte: getLastXDays(14),
      },
    }).countDocuments()

    //find new Courses in last 1 month
    const newCourses1month = await Course.find({
      createdAt: {
        $gte: getLastXMonths(1),
      },
    }).countDocuments()

    //find new Courses in last 2 months
    const newCourses2months = await Course.find({
      createdAt: {
        $gte: getLastXMonths(2),
      },
    }).countDocuments()

    //find new Courses in last 3 months
    const newCourses3months = await Course.find({
      createdAt: {
        $gte: getLastXMonths(3),
      },
    }).countDocuments()

    //find new Courses in last 6 months
    const newCourses6months = await Course.find({
      createdAt: {
        $gte: getLastXMonths(6),
      },
    }).countDocuments()

    //find new Courses in last 1 year
    const newCourses1year = await Course.find({
      createdAt: {
        $gte: getLastXYears(1),
      },
    }).countDocuments()

    //find new Courses in last 2 years
    const newCourses2years = await Course.find({
      createdAt: {
        $gte: getLastXYears(2),
      },
    }).countDocuments()

    //find last 5 learners
    const last10Learners = await User.find({
      'role.id': UserRole.LEARNER.id,
    })
      .select('-password -__v -notifications -teachingCourses')
      .sort('-createdAt')
      .limit(10)

    //find total revenue
    const courseDetails = await CourseDetail.find()
      .select('payment userId courseId status createdAt updatedAt')
      .populate('userId', 'firstName lastName email imageUrl phoneNumber')
      .populate('courseId')
      .sort('-createdAt')

    let totalRevenue = 0
    let totalRevenueToday = 0
    let totalRevenueLast7days = 0
    let totalRevenueLast14days = 0
    let totalRevenueLast1month = 0
    let totalRevenueLast2months = 0
    let totalRevenueLast3months = 0
    let totalRevenueLast6months = 0
    let totalRevenueLast1year = 0
    let totalRevenueLast2years = 0

    courseDetails.forEach(courseDetail => {
      const createdDate = courseDetail.createdAt?.getTime()
      const paymentPrice = courseDetail.payment?.price || 0

      totalRevenue += paymentPrice

      if (
        createdDate >= new Date(new Date().setHours(0, 0, 0, 0)).getTime() &&
        createdDate <= new Date(new Date().setHours(23, 59, 59, 999)).getTime()
      ) {
        totalRevenueToday += paymentPrice
      }
      if (createdDate >= getLastXDays(7)) {
        totalRevenueLast7days += paymentPrice
        totalRevenueLast14days += paymentPrice
        totalRevenueLast1month += paymentPrice
        totalRevenueLast2months += paymentPrice
        totalRevenueLast3months += paymentPrice
        totalRevenueLast6months += paymentPrice
        totalRevenueLast1year += paymentPrice
        totalRevenueLast2years += paymentPrice
      } else if (createdDate >= getLastXDays(14)) {
        totalRevenueLast14days += paymentPrice
        totalRevenueLast1month += paymentPrice
        totalRevenueLast2months += paymentPrice
        totalRevenueLast3months += paymentPrice
        totalRevenueLast6months += paymentPrice
        totalRevenueLast1year += paymentPrice
        totalRevenueLast2years += paymentPrice
      } else if (createdDate >= getLastXMonths(1)) {
        totalRevenueLast1month += paymentPrice
        totalRevenueLast2months += paymentPrice
        totalRevenueLast3months += paymentPrice
        totalRevenueLast6months += paymentPrice
        totalRevenueLast1year += paymentPrice
        totalRevenueLast2years += paymentPrice
      } else if (createdDate >= getLastXMonths(2)) {
        totalRevenueLast2months += paymentPrice
        totalRevenueLast3months += paymentPrice
        totalRevenueLast6months += paymentPrice
        totalRevenueLast1year += paymentPrice
        totalRevenueLast2years += paymentPrice
      } else if (createdDate >= getLastXMonths(3)) {
        totalRevenueLast3months += paymentPrice
        totalRevenueLast6months += paymentPrice
        totalRevenueLast1year += paymentPrice
        totalRevenueLast2years += paymentPrice
      } else if (createdDate >= getLastXMonths(6)) {
        totalRevenueLast6months += paymentPrice
        totalRevenueLast1year += paymentPrice
        totalRevenueLast2years += paymentPrice
      } else if (createdDate >= getLastXYears(1)) {
        totalRevenueLast1year += paymentPrice
        totalRevenueLast2years += paymentPrice
      } else if (createdDate >= getLastXYears(2)) {
        totalRevenueLast2years += paymentPrice
      }
    })

    //find last 10 learners registered
    const last10LearnersRegistered = courseDetails.slice(0, 10)

    //get learners data
    const learnersData = await User.find({
      'role.id': UserRole.LEARNER.id,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')

    const teacherData = await User.find({
      'role.id': UserRole.TEACHER.id,
    })
      .select('-password -__v -notifications')
      .sort('-createdAt')

    const categoriesData = await CourseCategory.find().populate({
      path: 'topics',
      populate: {
        path: 'courses',

        select: '-chapters -streams',
        populate: [
          {
            path: 'learnersDetail',
            select: 'payment status certificate',
          },
          {
            path: 'feedbacks',
          },
        ],
      },
    })

    res.status(200).json({
      message: 'Fetch dashboard data successfully!',
      data: {
        top10Courses: {
          byLearners: top10CoursesByLearners || [],
          byRevenue: top10CoursesByRevenue || [],
          byRating: top10CoursesByRating || [],
        },
        top10Teachers: {
          byLearners: top10TeachersByLearners || [],
          byRevenue: top10TeachersByRevenue || [],
          byCourses: top10TeachersByCourses || [],
          byRating: top10TeachersByRating || [],
        },
        newLearners: {
          today: newLearnersToday || 0,
          last7days: newLearners7days,
          last14days: newLearners14days,
          last1month: newLearners1month,
          last2months: newLearners2months,
          last3months: newLearners3months,
          last6months: newLearners6months,
          last1year: newLearners1year,
          last2years: newLearners2years,
          total: totalLearners || 0,
        },
        newTeachers: {
          today: newTeachersToday || 0,
          last7days: newTeachers7days,
          last14days: newTeachers14days,
          last1month: newTeachers1month,
          last2months: newTeachers2months,
          last3months: newTeachers3months,
          last6months: newTeachers6months,
          last1year: newTeachers1year,
          last2years: newTeachers2years,
          total: totalTeachers || 0,
        },
        newCourses: {
          today: newCoursesToday || 0,
          last7days: newCourses7days,
          last14days: newCourses14days,
          last1month: newCourses1month,
          last2months: newCourses2months,
          last3months: newCourses3months,
          last6months: newCourses6months,
          last1year: newCourses1year,
          last2years: newCourses2years,
          total: totalCourses || 0,
        },
        total: {
          learners: totalLearners,
          activeLearners: totalActiveLearners,
          pendingLearners: totalPendingLearners,
          inactiveLearners: totalInactiveLearners,
          bannedLearners: totalBannedLearners,
          teachers: totalTeachers,
          activeTeachers: totalActiveTeachers,
          pendingTeachers: totalPendingTeachers,
          inactiveTeachers: totalInactiveTeachers,
          bannedTeachers: totalBannedTeachers,
          courses: totalCourses,
          activeCourses: totalActiveCourses,
          pendingCourses: totalPendingCourses,
          inactiveCourses: totalInactiveCourses,
          draftCourses: totalDraftCourses,
          revenue: totalRevenue,
        },
        activities: {
          last10Learners: last10Learners,
          pendingTeachers: pendingTeachers || [],
          pendingCourses: pendingCourses || [],
          last10LearnersRegistered: last10LearnersRegistered,
        },
        revenue: {
          today: totalRevenueToday,
          last7days: totalRevenueLast7days,
          last14days: totalRevenueLast14days,
          last1month: totalRevenueLast1month,
          last2months: totalRevenueLast2months,
          last3months: totalRevenueLast3months,
          last6months: totalRevenueLast6months,
          last1year: totalRevenueLast1year,
          last2years: totalRevenueLast2years,
          total: totalRevenue,
        },
        data: {
          activeLearners: activeLearners,
          activeTeachers: activeTeachers,
          activeCourses: activeCourses,
          pendingLearners: pendingLearners,
          pendingTeachers: pendingTeachers,
          pendingCourses: pendingCourses,
          inactiveLearners: inactiveLearners,
          inactiveTeachers: inactiveTeachers,
          inactiveCourses: inactiveCourses,
          bannedLearners: bannedLearners,
          bannedTeachers: bannedTeachers,
          draftCourses: draftCourses,
          learnersData,
          teacherData,
          categoriesData,
        },
      },
      success: true,
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}
