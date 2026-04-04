const ProgressService = require('../services/ProgressService');
const { successResponse, errorResponse } = require('../utils/response');

class ProgressController {
  static async updateProgress(req, res, next) {
    try {
      const { courseId, lessonId, progress } = req.body;
      const progressData = await ProgressService.updateProgress(req.user.id, {
        courseId,
        lessonId,
        progress
      });

      return successResponse(res, { progress: progressData }, 'Progress updated successfully');
    } catch (error) {
      if (error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  static async getCourseProgress(req, res, next) {
    try {
      const { courseId } = req.params;
      const progress = await ProgressService.getCourseProgress(req.user.id, courseId);

      return successResponse(res, { progress }, 'Course progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getLessonProgress(req, res, next) {
    try {
      const { courseId } = req.params;
      const lessons = await ProgressService.getLessonProgress(req.user.id, courseId);

      return successResponse(res, { lessons }, 'Lesson progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getOverallProgress(req, res, next) {
    try {
      const progress = await ProgressService.getOverallProgress(req.user.id);

      return successResponse(res, { progress }, 'Overall progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProgressController;
