const Course = require('../models/Course');
const Channel = require('../models/Channel');
const User = require('../models/User');

class CourseService {
  static async getAllCourses(filters = {}) {
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }
    return Course.find(query).populate('tutor', 'name email');
  }

  static async getCourseById(id) {
    const course = await Course.findById(id).populate('tutor', 'name email');
    if (!course) throw new Error('Course not found');
    return course;
  }

  static async getCourseLessons(courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    return course.lessons;
  }

  static async createCourse(tutorId, courseData) {
    const tutor = await User.findById(tutorId);
    if (!tutor) throw new Error('Tutor not found');

    const courseDataToSave = { ...courseData, tutor: tutorId };
    
    if (!courseDataToSave.availableDate) {
      courseDataToSave.availableDate = new Date();
    }

    const course = new Course(courseDataToSave);
    await course.save();

    const channel = new Channel({
      course: course._id,
      name: 'General Discussion',
      type: 'course'
    });
    await channel.save();

    const studentsToEnroll = await User.find({
      role: 1,
      interests: { $in: course.tags }
    });

    for (const student of studentsToEnroll) {
      if (!student.enrolledCourses.includes(course._id)) {
        student.enrolledCourses.push(course._id);
        await student.save();
        
        if (!course.enrolledStudents.includes(student._id)) {
          course.enrolledStudents.push(student._id);
        }
      }
    }
    await course.save();

    return course;
  }

  static async createLesson(tutorId, courseId, lessonData) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');
    if (course.tutor.toString() !== tutorId) throw new Error('Only the course tutor can add lessons');
    
    course.lessons.push(lessonData);
    await course.save();
    return course.lessons[course.lessons.length - 1];
  }

  static async enrollInCourse(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    const user = await User.findById(userId);
    if (user && !user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    return { success: true };
  }

  static async getEnrolledCourses(userId) {
    return Course.find({ enrolledStudents: userId }).populate('tutor', 'name email');
  }

  static async getTutorCourses(tutorId) {
    const tutor = await User.findById(tutorId);
    if (!tutor) return [];
    
    return Course.find({
      tags: { $in: tutor.interests || [] }
    }).populate('tutor', 'name email');
  }
}

module.exports = CourseService;
