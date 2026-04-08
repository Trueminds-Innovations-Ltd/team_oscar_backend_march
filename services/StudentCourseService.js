const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

class StudentCourseService {
  static async getStudentCourses(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const courses = await Course.find({ enrolledStudents: userId })
      .populate('tutor', 'name email');

    const progressData = await Progress.find({ user: userId });

    const coursesWithProgress = courses.map(course => {
      const courseProgress = progressData.filter(p => p.course.toString() === course._id.toString());
      
      let overallProgress = 0;
      let lastAccessed = null;
      let completedLessons = 0;

      if (courseProgress.length > 0) {
        completedLessons = courseProgress.filter(p => p.completed).length;
        const totalProgress = courseProgress.reduce((sum, p) => sum + p.progressPercentage, 0);
        overallProgress = course.lessons.length > 0 
          ? Math.round((totalProgress / course.lessons.length))
          : 0;
        lastAccessed = courseProgress
          .map(p => p.lastAccessed)
          .sort((a, b) => new Date(b) - new Date(a))[0];
      }

      const nextLesson = course.lessons.find((lesson, idx) => {
        const lessonProgress = courseProgress.find(p => p.lessonId.toString() === lesson._id.toString());
        return !lessonProgress?.completed;
      });

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        difficultyName: course.difficultyName,
        tags: course.tags,
        tutor: course.tutor,
        lessons: course.lessons,
        availableDate: course.availableDate,
        moduleNumber: nextLesson ? (nextLesson.orderIndex || 1) : course.lessons.length,
        totalModules: course.lessons.length,
        progress: overallProgress,
        lastVisited: lastAccessed,
        nextUp: nextLesson?.title || 'Course Complete',
        completedAt: overallProgress >= 100 ? new Date() : null,
        studentInterests: user.interests || [],
        studentSubTopics: user.subTopics || []
      };
    });

    return coursesWithProgress;
  }

  static async getCourseProgress(userId, courseId) {
    const progressData = await Progress.find({ 
      user: userId, 
      course: courseId 
    });
    
    return progressData;
  }

  static async updateCourseProgress(userId, courseId, data) {
    const { progressPercentage, completedAt, lastVisited } = data;
    
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const progressData = await Progress.find({ user: userId, course: courseId });
    
    let overallProgress = progressPercentage;
    if (progressPercentage >= 100) {
      for (const lesson of course.lessons) {
        await Progress.findOneAndUpdate(
          { user: userId, course: courseId, lessonId: lesson._id },
          {
            progressPercentage: 100,
            completed: true,
            lastAccessed: completedAt || lastVisited || new Date()
          },
          { upsert: true, new: true }
        );
      }
    }

    return { success: true, progress: overallProgress };
  }

  static async startLesson(userId, courseId, lessonId) {
    await Progress.findOneAndUpdate(
      { user: userId, course: courseId, lessonId },
      {
        lastAccessed: new Date(),
        $setOnInsert: {
          user: userId,
          course: courseId,
          lessonId,
          progressPercentage: 0,
          completed: false
        }
      },
      { upsert: true, new: true }
    );

    return { success: true };
  }
}

module.exports = StudentCourseService;
