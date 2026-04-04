const AIService = require('../services/AIService');
const { successResponse, errorResponse } = require('../utils/response');

class AIController {
  static async processQuery(req, res, next) {
    try {
      const { message, courseId, lessonId } = req.body;

      const response = await AIService.processQuery(req.user.id, {
        message,
        courseId,
        lessonId
      });

      return successResponse(res, { response }, 'AI response generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AIController;
