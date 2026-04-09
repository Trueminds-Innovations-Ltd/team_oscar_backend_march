const NotificationService = require('../services/NotificationService');
const { successResponse, errorResponse } = require('../utils/response');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { StudySession, StudySessionProgress } = require('../models/StudySession');
const Course = require('../models/Course');

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

  static async getTutorDashboardSummary(req, res, next) {
    try {
      const tutorId = req.user.id;
      const tutor = await User.findById(tutorId);
      
      if (!tutor) {
        return errorResponse(res, 'Tutor not found', 404);
      }

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

      const Conversation = require('../models/Conversation');
      const unreadConversations = await Conversation.find({
        tutor: tutorId,
        tutorUnread: true
      });

      let pendingMessages = 0;
      for (const conv of unreadConversations) {
        const unreadStudentMessages = conv.messages.filter(msg => {
          const senderId = msg.sender ? msg.sender.toString() : 'unknown';
          const isNotTutor = senderId !== tutorId.toString();
          const isUnread = msg.read !== true;
          return isNotTutor && isUnread;
        });
        pendingMessages += unreadStudentMessages.length;
      }

      const uniqueStudentIds = [...new Set(unreadConversations.map(c => c.student.toString()))];

      const unreadTodayCount = unreadConversations.filter(c => 
        c.lastMessageAt && new Date(c.lastMessageAt) >= startOfToday
      ).length;

      const tutorInterests = tutor.interests || [];
      const tutorSubTopics = tutor.subTopics || [];

      const activeStudents = await User.countDocuments({
        role: 1,
        $or: [
          { interests: { $in: tutorInterests }, subTopics: { $exists: true, $ne: [] } },
          { subTopics: { $in: tutorSubTopics }, interests: { $exists: true, $ne: [] } }
        ]
      });

      const studentsCreatedToday = await User.countDocuments({
        role: 1,
        createdAt: { $gte: startOfToday },
        $or: [
          { interests: { $in: tutorInterests }, subTopics: { $exists: true, $ne: [] } },
          { subTopics: { $in: tutorSubTopics }, interests: { $exists: true, $ne: [] } }
        ]
      });

      const studentsCreatedYesterday = await User.countDocuments({
        role: 1,
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        $or: [
          { interests: { $in: tutorInterests }, subTopics: { $exists: true, $ne: [] } },
          { subTopics: { $in: tutorSubTopics }, interests: { $exists: true, $ne: [] } }
        ]
      });

      const studentsIncrease = studentsCreatedToday - studentsCreatedYesterday;

      const studentsNeedingHelp = uniqueStudentIds.length;

      return successResponse(res, {
        pendingMessages,
        unreadToday: unreadTodayCount,
        studentsNeedingHelp,
        activeStudents,
        studentsIncrease: Math.max(0, studentsIncrease)
      }, 'Dashboard summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTutorDashboardDetails(req, res, next) {
    try {
      const tutorId = req.user.id;
      const tutor = await User.findById(tutorId);
      
      if (!tutor) {
        return errorResponse(res, 'Tutor not found', 404);
      }
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const pendingNotifications = await Notification.countDocuments({
        user: tutorId,
        read: false
      });

      const pendingTutorRequests = await Notification.countDocuments({
        user: tutorId,
        read: false,
        type: 'tutor_request'
      });

      const taskCount = pendingNotifications + pendingTutorRequests;

      const tutorSessions = await StudySession.find({ tutor: tutorId })
        .populate('course', 'title category tags')
        .sort({ createdAt: -1 });

      const totalStudentsEnrolled = tutorSessions.reduce((sum, session) => {
        return sum + (session.enrolledStudents?.length || 0);
      }, 0);

      const totalNeedHelp = pendingTutorRequests;

      let avgProgress = 0;
      if (tutorSessions.length > 0) {
        const sessionIds = tutorSessions.map(s => s._id);
        const progressDocs = await StudySessionProgress.find({ studySession: { $in: sessionIds } });
        
        if (progressDocs.length > 0) {
          const totalProgress = progressDocs.reduce((sum, p) => sum + (p.progress || 0), 0);
          avgProgress = Math.round(totalProgress / progressDocs.length);
        }
      }

      const studentsAssisted = await StudySessionProgress.countDocuments({
        studySession: { $in: tutorSessions.map(s => s._id) },
        progress: { $gte: 100 }
      });

      const latestSession = tutorSessions[0] || null;
      let latestCourseData = null;
      
      if (latestSession) {
        const course = await Course.findById(latestSession.course);
        latestCourseData = {
          _id: latestSession._id,
          title: latestSession.course?.title || 'Study Session',
          subTopic: latestSession.subTopic,
          startDate: latestSession.startDate,
          enrolledCount: latestSession.enrolledStudents?.length || 0,
          completedCount: latestSession.completedStudents?.length || 0,
          totalModules: course?.lessons?.length || 0
        };
      }

      const upcomingSessions = tutorSessions.filter(s => new Date(s.startDate) > now).length;
      const activeSessions = tutorSessions.filter(s => new Date(s.startDate) <= now).length;

      return successResponse(res, {
        taskCount,
        pendingNotifications,
        pendingTutorRequests,
        studentsAssisted,
        avgProgress,
        totalStudentsEnrolled,
        totalNeedHelp,
        upcomingSessions,
        activeSessions,
        latestSession: latestCourseData,
        allSessions: tutorSessions.map(s => ({
          _id: s._id,
          title: s.course?.title || 'Study Session',
          subTopic: s.subTopic,
          startDate: s.startDate,
          enrolledCount: s.enrolledStudents?.length || 0,
          completedCount: s.completedStudents?.length || 0
        }))
      }, 'Dashboard details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
