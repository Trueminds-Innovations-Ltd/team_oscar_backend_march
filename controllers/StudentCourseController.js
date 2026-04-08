const StudentCourseService = require('../services/StudentCourseService');
const { successResponse, errorResponse } = require('../utils/response');

class StudentCourseController {
  static async getMyCourses(req, res, next) {
    try {
      const courses = await StudentCourseService.getStudentCourses(req.user.id);
      return successResponse(res, { courses }, 'Student courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCourseProgress(req, res, next) {
    try {
      const { id } = req.params;
      const progress = await StudentCourseService.getCourseProgress(req.user.id, id);
      return successResponse(res, { progress }, 'Course progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { progressPercentage, completedAt, lastVisited } = req.body;
      
      const result = await StudentCourseService.updateCourseProgress(req.user.id, id, {
        progressPercentage,
        completedAt,
        lastVisited
      });

      return successResponse(res, result, 'Progress updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async startLesson(req, res, next) {
    try {
      const { id, lessonId } = req.params;
      const result = await StudentCourseService.startLesson(req.user.id, id, lessonId);
      return successResponse(res, result, 'Lesson started successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentCourseController;
