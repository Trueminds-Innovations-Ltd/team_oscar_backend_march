const { StudySession } = require('../models/StudySession');
const User = require('../models/User');
const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../utils/response');
const path = require('path');
const fs = require('fs');
const { extractTextFromFile } = require('../utils/fileExtractor');

class StudySessionController {
  static async createStudySession(req, res, next) {
    try {
      const { course, courseName, subTopic, fileUrl, linkUrl, startDate } = req.body;
      
      let courseId = course;
      
      const Course = require('../models/Course');
      
      const knownPrograms = ['Frontend', 'UI/UX', 'Backend', 'Data Analysis', 'Product', 'Cloud', 'Networking', 'Cyber Security'];
      
      if (course && typeof course === 'string') {
        if (mongoose.Types.ObjectId.isValid(course)) {
          courseId = new mongoose.Types.ObjectId(course);
        } else if (knownPrograms.includes(course)) {
          const programToTitle = {
            "Frontend": "Frontend Development",
            "UI/UX": "UI/UX Design",
            "Backend": "Backend Development",
            "Data Analysis": "Data Analysis",
            "Product": "Product Management",
            "Cloud": "Cloud Engineering",
            "Networking": "Networking",
            "Cyber Security": "Cyber Security"
          };
          
          const courseTitle = programToTitle[course] || course;
          
          let existingCourse = await Course.findOne({ title: courseTitle });
          
          if (!existingCourse) {
            existingCourse = await Course.create({
              title: courseTitle,
              description: `${courseTitle} Study Program`,
              category: course,
              difficulty: 1,
              tags: [course]
            });
          }
          
          courseId = existingCourse._id;
        }
      }
      
      let fileContent = null;
      let originalFileName = null;
      
      if (fileUrl) {
        const projectRoot = process.cwd();
        const uploadsDir = path.join(projectRoot, 'uploads');
        const filePath = path.join(uploadsDir, fileUrl.replace('/uploads/', ''));
        
        if (fs.existsSync(filePath)) {
          originalFileName = path.basename(fileUrl);
          const extractedText = await extractTextFromFile(filePath);
          if (extractedText) {
            fileContent = extractedText.substring(0, 50000);
          }
        }
      }
      
      const session = new StudySession({
        tutor: req.user.id,
        course: courseId,
        subTopic,
        fileUrl,
        originalFileName,
        fileContent,
        linkUrl,
        startDate
      });

      await session.save();
      
      return successResponse(res, { session }, 'Study session created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyStudySessions(req, res, next) {
    try {
      const sessions = await StudySession.find({ tutor: req.user.id })
        .populate('course', 'title category tags')
        .sort({ startDate: 1 });

      const sessionsWithCount = sessions.map(session => ({
        ...session.toObject(),
        completedStudents: session.completedStudents?.length || 0
      }));

      return successResponse(res, { sessions: sessionsWithCount }, 'Study sessions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getStudySessionsForCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const sessions = await StudySession.find({ course: courseId })
        .populate('tutor', 'name email')
        .sort({ startDate: 1 });

      return successResponse(res, { sessions }, 'Study sessions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getStudentStudySessions(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) throw new Error('User not found');

      const enrolledSubTopics = user.subTopics || [];

      let sessions = await StudySession.find()
        .populate('course', 'title category tags')
        .populate('tutor', 'name')
        .sort({ startDate: 1 });

      sessions = sessions.filter(session => 
        enrolledSubTopics.includes(session.subTopic)
      );
      
      const availableFiles = [
        '/uploads/1775531155550-684667807.docx',
        '/uploads/1775539407951-231361233.docx',
        '/uploads/1775595500518-206687605.docx'
      ];

      const safeExtractText = async (filePath) => {
        try {
          const fs = require('fs');
          if (!fs.existsSync(filePath)) {
            console.log('File does not exist:', filePath);
            return null;
          }
          const { extractTextFromFile } = require('../utils/fileExtractor');
          const ext = path.extname(filePath).toLowerCase();
          console.log('File extension:', ext);
          if (!['.pdf', '.docx'].includes(ext)) {
            console.log('Unsupported file type');
            return null;
          }
          const text = await extractTextFromFile(filePath);
          console.log('Extracted text length:', text ? text.length : 'null');
          return text;
        } catch (err) {
          console.error('File extraction error:', err.message, err.stack);
          return null;
        }
      };

      sessions = await Promise.all(sessions.map(async (session) => {
        const sessionObj = session.toObject();
        
        console.log('Session:', sessionObj.subTopic, 'fileUrl:', sessionObj.fileUrl);
        
        if (!sessionObj.fileContent && session.fileUrl) {
          const projectRoot = process.cwd();
          const uploadsDir = path.join(projectRoot, 'uploads');
          const filePath = path.join(uploadsDir, session.fileUrl.replace('/uploads/', ''));
          
          console.log('Checking file path:', filePath, 'exists:', fs.existsSync(filePath));
          
          if (fs.existsSync(filePath)) {
            try {
              const extractedText = await safeExtractText(filePath);
              if (extractedText) {
                sessionObj.fileContent = extractedText.substring(0, 50000);
                console.log('Extracted content length:', extractedText.length);
              } else {
                console.log('No text extracted - extraction returned null');
              }
            } catch (extractErr) {
              console.error('Extract error:', extractErr.message);
            }
          } else {
            console.log('File does not exist at path');
          }
        }
        
        return sessionObj;
      }));

      return successResponse(res, { sessions }, 'Study sessions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async markComplete(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await StudySession.findById(sessionId);
      if (!session) throw new Error('Study session not found');

      const isEnrolled = session.enrolledStudents.includes(userId);
      if (!isEnrolled) {
        session.enrolledStudents.push(userId);
      }

      if (!session.completedStudents.includes(userId)) {
        session.completedStudents.push(userId);
      }

      await session.save();

      return successResponse(res, { completed: true }, 'Session marked as complete');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudySessionController;