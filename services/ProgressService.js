const Progress = require('../models/Progress');
const Course = require('../models/Course');

class ProgressService {
  static async updateProgress(userId, { courseId, lessonId, progress }) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const lesson = course.lessons.id(lessonId);
    if (!lesson) throw new Error('Lesson not found in this course');

    const progressData = await Progress.findOneAndUpdate(
      { user: userId, lessonId },
      { course: courseId, progressPercentage: progress, completed: progress >= 100, lastAccessed: Date.now() },
      { upsert: true, new: true }
    );

    return progressData;
  }

  static async getCourseProgress(userId, courseId) {
    const progress = await Progress.find({ user: userId, course: courseId });
    const course = await Course.findById(courseId);
    const totalLessons = course ? course.lessons.length : 0;
    const completed = progress.filter(p => p.completed).length;
    const avg = progress.length > 0 
      ? progress.reduce((sum, p) => sum + p.progressPercentage, 0) / progress.length 
      : 0;

    return { completedLessons: completed, totalLessons, averageProgress: Math.round(avg) };
  }

  static async getOverallProgress(userId) {
    const courses = await Course.find({ enrolledStudents: userId });
    const progress = [];

    for (const course of courses) {
      const courseProgress = await Progress.find({ user: userId, course: course._id });
      const completed = courseProgress.filter(p => p.completed).length;
      progress.push({
        courseId: course._id,
        courseTitle: course.title,
        completedLessons: completed,
        totalLessons: course.lessons.length
      });
    }

    return progress;
  }
}

module.exports = ProgressService;
