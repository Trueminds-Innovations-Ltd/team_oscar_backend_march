const AIService = require('../services/AIService');
const AIConversation = require('../models/AIConversation');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

const programLabels = {
  "Frontend": "Frontend Development",
  "UI/UX": "UI/UX Design",
  "Backend": "Backend Development",
  "Data Analysis": "Data Analysis",
  "Product": "Product Management",
  "Cloud": "Cloud Engineering",
  "Networking": "Networking",
  "Cyber Security": "Cyber Security"
};

const programSubTopics = {
  "Frontend": ["React", "JavaScript", "TypeScript", "CSS", "Vue.js", "Next.js"],
  "UI/UX": ["Wireframing", "Prototyping", "User Research", "Figma", "Design Systems"],
  "Backend": ["Node.js", "Python", "Java", "Go", "Express.js", "Database Design"],
  "Data Analysis": ["Python", "SQL", "Excel", "Data Visualization", "Statistics"],
  "Product": ["Product Roadmaps", "OKRs", "User Interviews", "Go-to-Market", "Agile/Scrum"],
  "Cloud": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "DevOps"],
  "Networking": ["CCNA", "Network Security", "Routing & Switching", "Firewalls", "VoIP"],
  "Cyber Security": ["Penetration Testing", "Ethical Hacking", "Security+", "CISSP"]
};

class AIController {
  static async processQuery(req, res, next) {
    try {
      const { message, courseId, lessonId, conversationId } = req.body;

      const response = await AIService.processQuery(req.user.id, {
        message,
        courseId,
        lessonId
      });

      const userId = req.user.id;
      let aiConv;
      
      if (conversationId) {
        aiConv = await AIConversation.findById(conversationId);
      }
      
      if (!aiConv) {
        aiConv = new AIConversation({
          user: userId,
          messages: [],
          lastMessageAt: new Date()
        });
      }

      aiConv.messages.push({
        role: 'user',
        content: message,
        createdAt: new Date()
      });
      
      aiConv.messages.push({
        role: 'ai',
        content: response.reply,
        createdAt: new Date()
      });
      
      aiConv.lastMessageAt = new Date();
      await aiConv.save();

      return successResponse(res, { 
        response, 
        conversationId: aiConv._id 
      }, 'AI response generated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async selectTutor(req, res, next) {
    try {
      const { tutorIndex, originalMessage, conversationState } = req.body;

      if (!tutorIndex || !originalMessage) {
        return errorResponse(res, 'Missing tutorIndex or originalMessage', 400);
      }

      const result = await AIService.selectTutor(req.user.id, tutorIndex, originalMessage, conversationState);

      if (result.success) {
        return successResponse(res, { message: result.message, tutorName: result.tutorName }, 'Tutor selected successfully');
      } else {
        return errorResponse(res, result.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  static async selectProgram(req, res, next) {
    try {
      const { programIndex, message } = req.body;
      const user = await User.findById(req.user.id);
      const interests = user.interests || [];

      if (programIndex < 1 || programIndex > interests.length) {
        return errorResponse(res, 'Invalid program number', 400);
      }

      const program = interests[programIndex - 1];
      const programName = programLabels[program] || program;
      const userSubTopics = user.subTopics || [];
      const relatedSubTopics = userSubTopics.filter(st => 
        (programSubTopics[program] || []).includes(st)
      );

      const tutorMatch = await AIService.matchTutorsForStudent(req.user.id, message, [program], userSubTopics);

      if (!tutorMatch || tutorMatch.tutors.length === 0) {
        return successResponse(res, {
          reply: `I couldn't find any tutors available for ${programName}. Please try a different program or contact support.`,
          needsProgramSelection: false,
          conversationState: null
        }, 'No tutors available');
      }

      if (relatedSubTopics.length === 0) {
        return successResponse(res, {
          reply: `I can help connect you to a tutor for ${programName}. What specific question do you have for the tutor?\n\nPlease type your question and I'll connect you.`,
          needsTutorSelection: false,
          needsQuestion: true,
          conversationState: {
            step: 'selectTutor',
            program: program,
            subTopic: null,
            tutors: tutorMatch.tutors,
            question: null
          }
        }, 'Needs question first');
      }

      if (relatedSubTopics.length === 1) {
        return successResponse(res, {
          reply: `I can help connect you to a tutor for ${programName} - ${relatedSubTopics[0]}. What specific question do you have for the tutor?\n\nPlease type your question and I'll connect you.`,
          needsTutorSelection: false,
          needsQuestion: true,
          conversationState: {
            step: 'selectTutor',
            program: program,
            subTopic: relatedSubTopics[0],
            tutors: tutorMatch.tutors,
            question: null
          }
        }, 'Needs question first');
      }

      return successResponse(res, {
        reply: `Which specific topic do you need help with in ${programName}?\n\n${relatedSubTopics.map((st, i) => `${i + 1}. ${st}`).join('\n')}\n\nPlease enter the number of the topic.`,
        needsSubTopicSelection: true,
        conversationState: {
          step: 'selectSubTopic',
          program: program,
          availableSubTopics: relatedSubTopics,
          tutors: tutorMatch.tutors
        }
      }, 'Sub-topics displayed');
    } catch (error) {
      next(error);
    }
  }

  static async selectSubTopic(req, res, next) {
    try {
      const { subTopicIndex, conversationState, message } = req.body;

      if (!conversationState || conversationState.step !== 'selectSubTopic') {
        return errorResponse(res, 'No sub-topic selection in progress', 400);
      }

      const { program, availableSubTopics, tutors } = conversationState;

      if (subTopicIndex < 1 || subTopicIndex > availableSubTopics.length) {
        return errorResponse(res, 'Invalid sub-topic number', 400);
      }

      const subTopic = availableSubTopics[subTopicIndex - 1];
      const programName = programLabels[program] || program;

      if (tutors.length === 1) {
        await AIService.connectToTutor(req.user.id, tutors[0], message || `I need help with ${subTopic}`, program, subTopic);
        return successResponse(res, {
          reply: `I've connected you to ${tutors[0].name}! They've been notified and will reach out to help you soon.`,
          needsSubTopicSelection: false,
          conversationState: null
        }, 'Connected to tutor');
      }

      return successResponse(res, {
        reply: `I found ${tutors.length} tutor(s) available for ${programName} - ${subTopic}. Before I connect you, what specific question do you have for the tutor?\n\nPlease type your question and I'll share it with the available tutors.`,
        needsTutorSelection: false,
        needsQuestion: true,
        conversationState: {
          step: 'selectTutor',
          program: program,
          subTopic: subTopic,
          tutors: tutors,
          question: null
        }
      }, 'Multiple tutors - needs question first');
    } catch (error) {
      next(error);
    }
  }

  static async submitQuestion(req, res, next) {
    try {
      const { question, conversationState } = req.body;

      if (!question || !conversationState) {
        return errorResponse(res, 'Missing question or conversation state', 400);
      }

      if (conversationState.step !== 'selectTutor' || !conversationState.tutors) {
        return errorResponse(res, 'Invalid conversation state', 400);
      }

      const { program, subTopic, tutors } = conversationState;
      const programName = programLabels[program] || program;

      if (tutors.length === 1) {
        await AIService.connectToTutor(req.user.id, tutors[0], question, program, subTopic);
        return successResponse(res, {
          reply: `I've connected you to ${tutors[0].name}! They've been notified and will reach out to help you soon.`,
          needsQuestion: false,
          conversationState: null
        }, 'Connected to tutor');
      }

      return successResponse(res, {
        reply: `I found ${tutors.length} tutor(s) available for ${programName}${subTopic ? ` - ${subTopic}` : ''}:\n\n${tutors.map((t, i) => `${i + 1}. **${t.name}**`).join('\n')}\n\nPlease enter the number of the tutor you'd like to connect with, and I'll share your question: "${question.substring(0, 100)}..."`,
        needsTutorSelection: true,
        needsQuestion: false,
        conversationState: {
          step: 'selectTutor',
          program: program,
          subTopic: subTopic,
          tutors: tutors,
          question: question
        }
      }, 'Tutors displayed with question');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AIController;
