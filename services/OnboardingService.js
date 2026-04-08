const User = require('../models/User');
const Course = require('../models/Course');
const { ROLE } = require('../config/constants');

class OnboardingService {
  static async completeOnboarding(userId, { interests, level, subTopics = [] }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.interests = interests;
    user.subTopics = subTopics;
    user.level = level;
    await user.save();

    if (user.role === ROLE.STUDENT) {
      // Match courses by main interests OR sub-topics
      const allInterests = [...interests, ...subTopics];
      
      const courses = await Course.find({ 
        $or: [
          { tags: { $in: interests } },
          { tags: { $in: subTopics } },
          { tags: { $in: allInterests.map(i => i.toLowerCase()) } }
        ],
        availableDate: { $lte: new Date() }
      });

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
