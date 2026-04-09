const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { ROLE } = require('../config/constants');

class ConversationController {
  static async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      let query;
      if (user.role === ROLE.TUTOR) {
        query = { tutor: userId };
      } else {
        query = { student: userId };
      }

      const conversations = await Conversation.find(query)
        .populate('student', 'name email')
        .populate('tutor', 'name email')
        .sort({ lastMessageAt: -1 });

      const uniqueByStudent = new Map();
      conversations.forEach(conv => {
        const studentId = conv.student._id.toString();
        if (!uniqueByStudent.has(studentId)) {
          uniqueByStudent.set(studentId, conv);
        }
      });

      const uniqueConversations = Array.from(uniqueByStudent.values());

      const formatted = uniqueConversations.map(conv => {
        const otherUser = user.role === ROLE.TUTOR ? conv.student : conv.tutor;
        const isUnread = user.role === ROLE.TUTOR ? conv.tutorUnread : conv.studentUnread;
        
        const initials = otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return {
          id: conv._id,
          name: otherUser.name,
          avatar: initials,
          avatarTone: 'from-slate-900 to-slate-700',
          subtitle: conv.program + (conv.subTopic ? ` - ${conv.subTopic}` : ''),
          preview: conv.lastMessage || conv.initialQuestion || 'Start a conversation',
          time: conv.lastMessageAt || conv.createdAt,
          unread: isUnread,
          program: conv.program,
          subTopic: conv.subTopic,
          initialQuestion: conv.initialQuestion,
          tab: 'direct'
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  }

  static async getConversation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const conversation = await Conversation.findById(id)
        .populate('student', 'name email')
        .populate('tutor', 'name email')
        .populate('messages.sender', 'name');

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      if (!conversation.student || !conversation.tutor) {
        return res.status(400).json({ message: 'Invalid conversation data' });
      }

      const isParticipant = 
        conversation.student._id.toString() === userId.toString() ||
        conversation.tutor._id.toString() === userId.toString();

      if (!isParticipant) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const otherUser = conversation.student._id.toString() === userId.toString() 
        ? conversation.tutor 
        : conversation.student;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isTutor = user.role === ROLE.TUTOR;

      if (isTutor) {
        conversation.tutorUnread = false;
      } else {
        conversation.studentUnread = false;
      }
      await conversation.save();

      res.json({
        conversation: {
          id: conversation._id,
          otherUser: {
            id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email
          },
          program: conversation.program,
          subTopic: conversation.subTopic,
          initialQuestion: conversation.initialQuestion,
          messages: conversation.messages.map(msg => ({
            id: msg._id.toString(),
            content: msg.content,
            sender: msg.sender._id.toString() === userId.toString() ? 'me' : 'other',
            senderName: msg.sender.name,
            timestamp: msg.createdAt,
            read: msg.read
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ message: 'Failed to fetch conversation' });
    }
  }

  static async sendMessage(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const conversation = await Conversation.findById(id);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const isParticipant = 
        conversation.student.toString() === userId.toString() ||
        conversation.tutor.toString() === userId.toString();

      if (!isParticipant) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const user = await User.findById(userId);
      const isTutorUser = user.role === ROLE.TUTOR;

      conversation.messages.push({
        sender: userId,
        content,
        read: false
      });

      conversation.lastMessage = content;
      conversation.lastMessageAt = new Date();

      if (isTutorUser) {
        conversation.studentUnread = true;
        conversation.tutorUnread = false;
      } else {
        conversation.tutorUnread = true;
        conversation.studentUnread = false;
      }

      await conversation.save();

      const newMessage = conversation.messages[conversation.messages.length - 1];

      res.status(201).json({
        message: {
          id: newMessage._id,
          content: newMessage.content,
          sender: 'me',
          timestamp: newMessage.createdAt,
          read: false
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  }

  static async createConversation(studentId, tutorId, program, subTopic, initialQuestion) {
    const existingConv = await Conversation.findOne({
      student: studentId,
      tutor: tutorId,
      program: program,
      subTopic: subTopic || { $exists: false }
    });

    if (existingConv) {
      existingConv.messages.push({
        sender: studentId,
        content: initialQuestion,
        read: false
      });
      existingConv.lastMessage = initialQuestion;
      existingConv.lastMessageAt = new Date();
      existingConv.studentUnread = false;
      existingConv.tutorUnread = true;
      await existingConv.save();
      return existingConv;
    }

    const conversation = new Conversation({
      participants: [studentId, tutorId],
      student: studentId,
      tutor: tutorId,
      program: program,
      subTopic: subTopic,
      initialQuestion: initialQuestion,
      lastMessage: initialQuestion,
      lastMessageAt: new Date(),
      studentUnread: false,
      tutorUnread: true,
      messages: [{
        sender: studentId,
        content: initialQuestion,
        read: false
      }]
    });

    await conversation.save();
    return conversation;
  }
}

module.exports = ConversationController;