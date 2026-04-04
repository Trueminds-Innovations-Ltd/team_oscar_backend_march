const Notification = require('../models/Notification');

class NotificationService {
  static async getUserNotifications(userId, options = {}) {
    const query = { user: userId };
    if (options.unreadOnly) query.read = false;
    
    return Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20);
  }

  static async markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }

  static async markAllAsRead(userId) {
    return Notification.updateMany({ user: userId, read: false }, { read: true });
  }

  static async getUnreadCount(userId) {
    return Notification.countDocuments({ user: userId, read: false });
  }
}

module.exports = NotificationService;
