const Groq = require('groq-sdk');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { ROLE } = require('../config/constants');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AIService {
  static async processQuery(userId, { message, courseId }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const lower = message.toLowerCase();
    const response = {
      reply: '',
      suggestions: [],
      tutorMatch: null
    };

    if (this.explicitlyRequestsTutor(lower)) {
      const tutorMatch = await this.matchTutorsForStudent(userId, message);
      response.tutorMatch = tutorMatch;
      
      if (tutorMatch && tutorMatch.tutors.length > 0) {
        response.reply = this.generateTutorMatchResponse(tutorMatch, user.name);
      } else {
        response.reply = "I couldn't find any tutors available for your enrolled courses. Please try again later or contact support.";
      }
      response.suggestions = ['Ask another question', 'View my courses'];
    } else {
      const courseContext = await this.getCourseContext(user);
      response.reply = await this.generateGroqResponse(user, message, courseContext, lower);
      response.suggestions = this.generateSuggestions(lower, user);
    }

    return response;
  }

  static explicitlyRequestsTutor(lower) {
    const tutorKeywords = [
      'connect me to tutor', 'connect me to a tutor',
      'i need a tutor', 'i need tutor', 'need a tutor',
      'talk to tutor', 'speak to tutor', 'chat with tutor',
      'get me a tutor', 'find me a tutor',
      'can i talk to a tutor', 'want to talk to a tutor',
      'help me with tutor', 'tutor help', 'tutor assistance'
    ];
    return tutorKeywords.some(k => lower.includes(k));
  }

  static async getCourseContext(user) {
    if (user.role !== ROLE.STUDENT) {
      return null;
    }

    const courses = await Course.find({ enrolledStudents: user._id })
      .select('title description tags lessons');

    if (courses.length === 0) {
      return null;
    }

    let context = `The student is enrolled in the following courses:\n\n`;

    for (const course of courses) {
      context += `📚 **${course.title}**\n`;
      context += `Tags: ${course.tags.join(', ')}\n`;
      if (course.description) {
        context += `Description: ${course.description}\n`;
      }
      
      if (course.lessons && course.lessons.length > 0) {
        context += `Lessons:\n`;
        for (const lesson of course.lessons) {
          context += `- ${lesson.title}`;
          if (lesson.content) {
            context += `: ${lesson.content}`;
          }
          context += `\n`;
        }
      }
      context += `\n`;
    }

    return context;
  }

  static async generateGroqResponse(user, message, courseContext, lower) {
    const studentName = user.name;
    const studentLevel = user.levelName || 'Beginner';

    let systemPrompt = `You are a helpful AI learning assistant for a learning management system called TalentFlow. 
You help students learn and understand course content.

Guidelines:
- Be friendly and encouraging
- Explain concepts clearly and simply
- Use examples when helpful
- If you don't know something, say so honestly
- Keep responses concise but informative
- Never make up information about topics not in the course content

Remember: You should ONLY answer based on the course content provided. If a question is outside the course content, politely redirect the student to ask about their enrolled courses or suggest connecting with a tutor.`;

    if (courseContext) {
      systemPrompt += `\n\nHere is the course content for this student:\n\n${courseContext}`;
    } else {
      systemPrompt += `\n\nThe student is not currently enrolled in any courses.`;
    }

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: chatMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024
      });

      let reply = chatCompletion.choices[0]?.message?.content || 
        "I received your message. Could you ask about your enrolled courses?";

      if (!courseContext && !reply.includes("course")) {
        reply += "\n\n💡 Tip: Complete your onboarding to get enrolled in courses and start learning!";
      } else if (courseContext && !reply.includes("tutor")) {
        reply += "\n\n❓ Need more help? Say 'connect me to a tutor' for personalized assistance!";
      }

      return reply;

    } catch (error) {
      console.error('Groq API Error:', error);
      
      if (courseContext) {
        return this.getFallbackResponse(message, courseContext);
      }
      
      return "I'm having trouble connecting to my brain right now. Please try again in a moment!";
    }
  }

  static getFallbackResponse(message, courseContext) {
    const lower = message.toLowerCase();

    if (lower.includes('thanks') || lower.includes('thank you')) {
      return "You're welcome! Feel free to ask if you need more help with your courses!";
    }

    if (lower.includes('hi') || lower.includes('hello')) {
      return `Hello! I can see you're enrolled in some courses. What would you like to learn about today?`;
    }

    if (lower.includes('what courses') || lower.includes('my courses')) {
      return `You have courses to learn from! Check your course list for more details. Would you like me to explain a specific topic?`;
    }

    return `I found relevant content in your courses. Take a look at the lesson materials for more details. If you need more help, just ask!`;
  }

  static generateSuggestions(lower, user) {
    const suggestions = ['Ask about my courses'];
    
    if (lower.includes('confused') || lower.includes("don't understand")) {
      suggestions.unshift('Connect me to a tutor');
    }
    
    return suggestions;
  }

  static generateTutorMatchResponse(tutorMatch, studentName) {
    const tutorList = tutorMatch.tutors.map(t => 
      `• **${t.name}** - ${t.course}`
    ).join('\n');

    return `I've found ${tutorMatch.tutors.length} tutor(s) for your enrolled courses:\n\n${tutorList}\n\nI've sent them your question and they'll respond via your notifications!`;
  }

  static async matchTutorsForStudent(studentId, message) {
    const student = await User.findById(studentId);
    if (!student) return null;

    const enrolledCourses = await Course.find({ enrolledStudents: studentId })
      .populate('tutor', 'name email');

    if (enrolledCourses.length === 0) {
      return { matched: true, tutors: [], message: 'No enrolled courses' };
    }

    const tutors = enrolledCourses
      .filter(course => course.tutor)
      .map(course => ({
        id: course.tutor._id,
        name: course.tutor.name,
        email: course.tutor.email,
        courseId: course._id,
        course: course.title
      }));

    const uniqueTutors = [];
    const seenIds = new Set();
    for (const tutor of tutors) {
      if (!seenIds.has(tutor.id.toString())) {
        seenIds.add(tutor.id.toString());
        uniqueTutors.push(tutor);
      }
    }

    for (const tutor of uniqueTutors) {
      await Notification.create({
        user: tutor.id,
        type: 'tutor_match_request',
        title: 'Student Needs Help',
        message: `Student: ${student.name}\nCourse: ${tutor.course}\n\nQuestion: "${message.substring(0, 300)}"`,
        data: { 
          studentId: student._id,
          studentName: student.name,
          courseId: tutor.courseId,
          courseName: tutor.course,
          question: message
        }
      });

      await Notification.create({
        user: studentId,
        type: 'tutor_matched',
        title: 'Tutor Contacted',
        message: `I've sent your request to ${tutor.name} for help with "${tutor.course}". They'll respond soon!`,
        data: { tutorId: tutor.id, tutorName: tutor.name, courseId: tutor.courseId }
      });
    }

    return {
      matched: true,
      tutors: uniqueTutors,
      studentName: student.name,
      question: message.substring(0, 200)
    };
  }
}

module.exports = AIService;
