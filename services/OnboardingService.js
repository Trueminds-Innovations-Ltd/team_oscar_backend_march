const User = require('../models/User');
const Course = require('../models/Course');
const { ROLE } = require('../config/constants');

class OnboardingService {
  static async completeOnboarding(userId, { interests, level }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.interests = interests;
    user.level = level;
    await user.save();

    if (user.role === ROLE.STUDENT) {
      const courses = await Course.find({ tags: { $in: interests } });
      for (const course of courses) {
        if (!user.enrolledCourses.includes(course._id)) {
          user.enrolledCourses.push(course._id);
          course.enrolledStudents.push(userId);
          await course.save();
        }
      }
      await user.save();
    }

    return user.toPublicJSON();
  }
}

module.exports = OnboardingService;
