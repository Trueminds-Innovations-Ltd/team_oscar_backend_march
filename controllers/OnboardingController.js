const OnboardingService = require('../services/OnboardingService');
const { successResponse, errorResponse } = require('../utils/response');

class OnboardingController {
  static async completeOnboarding(req, res, next) {
    try {
      const { interests, level, subTopics } = req.body;
      const userId = req.user.id;

      const user = await OnboardingService.completeOnboarding(userId, { interests, level, subTopics });

      return successResponse(res, { user }, 'Onboarding completed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OnboardingController;
