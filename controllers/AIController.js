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

  static async selectTutor(req, res, next) {
    try {
      const { tutorIndex, originalMessage } = req.body;

      if (!tutorIndex || !originalMessage) {
        return errorResponse(res, 'Missing tutorIndex or originalMessage', 400);
      }

      const result = await AIService.selectTutor(req.user.id, tutorIndex, originalMessage);

      if (result.success) {
        return successResponse(res, { message: result.message, tutorName: result.tutorName }, 'Tutor selected successfully');
      } else {
        return errorResponse(res, result.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AIController;
