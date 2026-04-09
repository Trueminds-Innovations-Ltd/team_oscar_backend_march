const AIConversation = require('../models/AIConversation');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

class AIConversationController {
  static async getUserConversations(req, res, next) {
    try {
      const userId = req.user.id;
      
      const conversations = await AIConversation.find({ user: userId })
        .sort({ lastMessageAt: -1 })
        .limit(20);

      const formatted = conversations.map(conv => ({
        id: conv._id,
        preview: conv.messages[conv.messages.length - 1]?.content?.substring(0, 50) || 'New conversation',
        time: conv.lastMessageAt,
        messages: conv.messages.map(msg => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt
        }))
      }));

      return successResponse(res, { conversations: formatted }, 'AI conversations retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async saveMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { conversationId, role, content } = req.body;

      let conversation;

      if (conversationId) {
        conversation = await AIConversation.findById(conversationId);
        if (!conversation || conversation.user.toString() !== userId) {
          return errorResponse(res, 'Conversation not found', 404);
        }
      } else {
        conversation = new AIConversation({
          user: userId,
          messages: [],
          lastMessageAt: new Date()
        });
      }

      conversation.messages.push({
        role,
        content,
        createdAt: new Date()
      });
      conversation.lastMessageAt = new Date();
      await conversation.save();

      return successResponse(res, {
        conversationId: conversation._id,
        message: {
          id: conversation.messages[conversation.messages.length - 1]._id,
          role,
          content,
          timestamp: new Date()
        }
      }, 'Message saved');
    } catch (error) {
      next(error);
    }
  }

  static async deleteOldConversations(req, res, next) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await AIConversation.deleteMany({
        lastMessageAt: { $lt: thirtyDaysAgo }
      });

      return successResponse(res, { deleted: result.deletedCount }, 'Old conversations deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AIConversationController;