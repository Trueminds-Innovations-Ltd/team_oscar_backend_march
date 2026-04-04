const CollaborationService = require('../services/CollaborationService');
const { successResponse, errorResponse } = require('../utils/response');

class CollaborationController {
  static async getUserChannels(req, res, next) {
    try {
      const channels = await CollaborationService.getUserChannels(req.user.id);

      return successResponse(res, { channels }, 'Channels retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getChannel(req, res, next) {
    try {
      const { id } = req.params;
      const channel = await CollaborationService.getChannel(id);

      return successResponse(res, { channel }, 'Channel retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getChannelMessages(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await CollaborationService.getChannelMessages(id, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return successResponse(res, { messages }, 'Messages retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const { channelId, content } = req.body;

      const message = await CollaborationService.sendMessage(
        req.user.id,
        channelId,
        content
      );

      return successResponse(res, { message }, 'Message sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async createChannel(req, res, next) {
    try {
      const { courseId, name, type } = req.body;

      const channel = await CollaborationService.createChannel(courseId, name, type);

      return successResponse(res, { channel }, 'Channel created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CollaborationController;
