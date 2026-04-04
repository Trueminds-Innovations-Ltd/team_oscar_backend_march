const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

class AIService {
  static async processQuery(userId, { message, courseId }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const response = {
      reply: this.generateAIResponse(message),
      suggestions: ['Review the lesson materials', 'Try practice exercises', 'Connect with a tutor'],
      tutorMatch: null
    };

    if (user.role === 'student' && this.requiresTutorHelp(message) && courseId) {
      const tutorMatch = await this.matchTutorWithStudent(userId, courseId, message);
      if (tutorMatch) response.tutorMatch = tutorMatch;
    }

    return response;
  }

  static generateAIResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('help') || lower.includes('confused')) {
      return "I'm here to help! Let me connect you with a qualified tutor who can assist you with this topic.";
    }
    if (lower.includes('explain') || lower.includes('what is')) {
      return "Great question! Let me break this down for you. Start by understanding the fundamental concepts, then practice with examples.";
    }
    if (lower.includes('thanks')) {
      return "You're welcome! Feel free to ask if you have any more questions.";
    }
    
    return "I understand you're asking about this topic. Here are some key points to consider. Don't hesitate to ask for tutor assistance if needed.";
  }

  static requiresTutorHelp(message) {
    const keywords = ['help me', 'need help', 'stuck', 'confused', "can't figure", 'urgent', 'detailed help'];
    const lower = message.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  static async matchTutorWithStudent(studentId, courseId, message) {
    const course = await Course.findById(courseId).populate('tutor');
    if (!course || !course.tutor) return null;

    await Notification.create({
      user: course.tutor._id,
      type: 'tutor_match_request',
      title: 'Student Needs Help',
      message: `A student needs help in "${course.title}". Message: "${message.substring(0, 100)}"`,
      data: { studentId, courseId }
    });

    await Notification.create({
      user: studentId,
      type: 'tutor_matched',
      title: 'Tutor Matched',
      message: `We've matched you with ${course.tutor.name} for help with "${course.title}".`,
      data: { tutorId: course.tutor._id, tutorName: course.tutor.name, courseId }
    });

    return {
      matched: true,
      tutor: { id: course.tutor._id, name: course.tutor.name },
      course: { id: course._id, title: course.title }
    };
  }
}

module.exports = AIService;
