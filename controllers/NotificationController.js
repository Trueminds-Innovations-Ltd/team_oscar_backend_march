const NotificationService = require('../services/NotificationService');
const { successResponse, errorResponse } = require('../utils/response');

class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = req.query;

      const notifications = await NotificationService.getUserNotifications(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        unreadOnly: unreadOnly === 'true'
      });

      const unreadCount = await NotificationService.getUnreadCount(req.user.id);

      return successResponse(res, { 
        notifications,
        unreadCount
      }, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id);

      return successResponse(res, { notification }, 'Notification marked as read');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const notifications = await NotificationService.markAllAsRead(req.user.id);

      return successResponse(res, { 
        markedCount: notifications.length 
      }, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
