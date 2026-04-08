const Groq = require('groq-sdk');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { ROLE } = require('../config/constants');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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

class AIService {
  static async processQuery(userId, { message, courseId }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const lower = message.toLowerCase();
    const response = {
      reply: '',
      suggestions: [],
      tutorMatch: null,
      needsTutorSelection: false
    };

    if (this.explicitlyRequestsTutor(lower)) {
      const studentInterests = user.interests || [];
      const studentSubTopics = user.subTopics || [];
      
      if (studentInterests.length === 0) {
        response.reply = "I couldn't find any enrolled programs in your profile. Please complete your onboarding to get started with learning!";
        response.suggestions = ['Complete onboarding', 'View my profile'];
        return response;
      }
      
      const tutorMatch = await this.matchTutorsForStudent(userId, message, studentInterests, studentSubTopics);
      response.tutorMatch = tutorMatch;
      
      if (tutorMatch && tutorMatch.tutors.length > 0) {
        if (tutorMatch.tutors.length === 1) {
          await this.connectToTutor(userId, tutorMatch.tutors[0], message);
          response.reply = `I've connected you to ${tutorMatch.tutors[0].name}! They've been notified and will reach out to help you soon.`;
        } else {
          response.reply = this.generateTutorMatchResponse(tutorMatch, user.name);
          response.needsTutorSelection = true;
        }
      } else {
        response.reply = "I couldn't find any tutors available for your enrolled programs. Please try again later or contact support.";
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
      'help me with tutor', 'tutor help', 'tutor assistance',
      'i want a tutor', 'get tutor', 'find tutor'
    ];
    return tutorKeywords.some(k => lower.includes(k));
  }

  static async getCourseContext(user) {
    if (user.role !== ROLE.STUDENT) {
      return null;
    }

    const interests = user.interests || [];
    const subTopics = user.subTopics || [];
    
    if (interests.length === 0) {
      return null;
    }

    let context = `The student is enrolled in the following programs and sub-topics:\n\n`;
    
    for (const interest of interests) {
      const programName = programLabels[interest] || interest;
      context += `📚 **${programName}**\n`;
      
      const relatedSubTopics = subTopics.filter(st => 
        (programSubTopics[interest] || []).includes(st)
      );
      
      if (relatedSubTopics.length > 0) {
        context += `Sub-topics: ${relatedSubTopics.join(', ')}\n`;
      } else {
        const defaultSubTopics = programSubTopics[interest] || [];
        context += `Sub-topics: ${defaultSubTopics.join(', ')}\n`;
      }
      context += `\n`;
    }

    const courses = await Course.find({ 
      $or: [
        { tags: { $in: interests } },
        { category: { $in: interests } }
      ]
    }).select('title description tags lessons');

    if (courses.length > 0) {
      context += `Available courses related to your programs:\n\n`;
      for (const course of courses) {
        context += `📖 **${course.title}**\n`;
        if (course.description) {
          context += `   ${course.description}\n`;
        }
        if (course.lessons && course.lessons.length > 0) {
          context += `   Lessons: ${course.lessons.length}\n`;
        }
        context += `\n`;
      }
    }

    return context;
  }

  static async generateGroqResponse(user, message, courseContext, lower) {
    const studentName = user.name;
    const studentLevel = user.levelName || 'Beginner';

    let systemPrompt = `You are a helpful AI learning assistant for a learning management system called TalentFlow. 
You help students learn and understand course content based on their enrolled programs and sub-topics.

Guidelines:
- Be friendly and encouraging
- Explain concepts clearly and simply
- Use examples when helpful
- If you don't know something, say so honestly
- Keep responses concise but informative
- Focus on the student's enrolled programs and sub-topics

Remember: You should ONLY answer based on the student's enrolled programs and course content provided. If a question is outside the course content, politely redirect the student to ask about their enrolled programs or suggest connecting with a tutor.`;

    if (courseContext) {
      systemPrompt += `\n\nHere is the student's enrollment information:\n\n${courseContext}`;
    } else {
      systemPrompt += `\n\nThe student is not currently enrolled in any programs.`;
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
        "I received your message. Could you ask about your enrolled programs?";

      if (!courseContext && !reply.includes("program")) {
        reply += "\n\n💡 Tip: Complete your onboarding to get enrolled in programs and start learning!";
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
      return `Hello! I can see you're enrolled in some programs. What would you like to learn about today?`;
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
    const tutorList = tutorMatch.tutors.map((t, index) => 
      `${index + 1}. **${t.name}** - ${t.program}`
    ).join('\n');

    return `I found ${tutorMatch.tutors.length} tutor(s) available for your enrolled programs:\n\n${tutorList}\n\nPlease enter the number (1-${tutorMatch.tutors.length}) of the tutor you'd like to connect with, and I'll set up the connection for you!`;
  }

  static async matchTutorsForStudent(studentId, message, studentInterests, studentSubTopics) {
    const student = await User.findById(studentId);
    if (!student) return null;

    if (studentInterests.length === 0) {
      return { matched: true, tutors: [], message: 'No enrolled programs' };
    }

    const tutors = await User.find({
      role: ROLE.TUTOR,
      $or: [
        { interests: { $in: studentInterests } },
        { subTopics: { $in: studentSubTopics } }
      ]
    }).select('name email interests subTopics');

    if (tutors.length === 0) {
      return { matched: true, tutors: [], message: 'No tutors found' };
    }

    const tutorList = tutors.map(tutor => {
      const matchingInterests = (tutor.interests || []).filter(i => studentInterests.includes(i));
      const programName = programLabels[matchingInterests[0]] || matchingInterests[0] || 'General';
      
      return {
        id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        program: programName,
        interests: tutor.interests || [],
        subTopics: tutor.subTopics || []
      };
    });

    return {
      matched: true,
      tutors: tutorList,
      studentName: student.name,
      question: message.substring(0, 200),
      needsSelection: tutorList.length > 1
    };
  }

  static async connectToTutor(studentId, tutor, message) {
    const student = await User.findById(studentId);
    
    await Notification.create({
      user: tutor.id,
      type: 'tutor_request',
      title: 'Student Needs Help',
      message: `Student: ${student.name}\nProgram: ${tutor.program}\n\nQuestion: "${message.substring(0, 300)}"`,
      data: { 
        studentId: student._id,
        studentName: student.name,
        question: message,
        program: tutor.program
      }
    });

    await Notification.create({
      user: studentId,
      type: 'tutor_connected',
      title: 'Tutor Connected',
      message: `You've been connected to ${tutor.name} for help with ${tutor.program}. They'll respond soon!`,
      data: { tutorId: tutor.id, tutorName: tutor.name, program: tutor.program }
    });
  }

  static async selectTutor(studentId, tutorIndex, originalMessage) {
    const student = await User.findById(studentId);
    const studentInterests = student.interests || [];
    const studentSubTopics = student.subTopics || [];

    const tutorMatch = await this.matchTutorsForStudent(studentId, originalMessage, studentInterests, studentSubTopics);
    
    if (!tutorMatch || !tutorMatch.tutors || tutorMatch.tutors.length === 0) {
      return { success: false, message: 'No tutors available' };
    }

    const selectedIndex = parseInt(tutorIndex) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= tutorMatch.tutors.length) {
      return { success: false, message: 'Invalid tutor number. Please enter a valid number.' };
    }

    const selectedTutor = tutorMatch.tutors[selectedIndex];
    await this.connectToTutor(studentId, selectedTutor, originalMessage);

    return {
      success: true,
      message: `Great! I've connected you to ${selectedTutor.name}. They've been notified and will reach out to help you soon!`,
      tutorName: selectedTutor.name
    };
  }
}

module.exports = AIService;
