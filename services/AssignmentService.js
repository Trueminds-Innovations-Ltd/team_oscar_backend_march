const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');

class AssignmentService {
  static async getStudentAssignments(userId) {
    const courses = await require('../models/Course').find({ enrolledStudents: userId });
    const courseIds = courses.map(c => c._id);
    return Assignment.find({ course: { $in: courseIds } }).populate('course', 'title');
  }

  static async getCourseAssignments(courseId) {
    return Assignment.find({ course: courseId });
  }

  static async createAssignment(tutorId, assignmentData) {
    const course = await require('../models/Course').findById(assignmentData.courseId);
    if (!course || course.tutor.toString() !== tutorId) {
      throw new Error('Course not found or you are not the tutor');
    }

    const assignment = new Assignment(assignmentData);
    await assignment.save();
    return assignment;
  }

  static async submitAssignment(userId, assignmentId, { content, fileUrl }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    if (assignment.dueDate && new Date() > assignment.dueDate) {
      throw new Error('Assignment deadline has passed');
    }

    const existingIndex = assignment.submissions.findIndex(
      s => s.student.toString() === userId
    );

    const submission = {
      student: userId,
      content,
      fileUrl,
      submittedAt: new Date()
    };

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex] = submission;
    } else {
      assignment.submissions.push(submission);
    }

    await assignment.save();
    return assignment.submissions[existingIndex >= 0 ? existingIndex : assignment.submissions.length - 1];
  }

  static async gradeSubmission(tutorId, assignmentId, studentId, { score, feedback }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const course = await require('../models/Course').findById(assignment.course);
    if (!course || course.tutor.toString() !== tutorId) {
      throw new Error('Only the course tutor can grade submissions');
    }

    const submission = assignment.submissions.find(s => s.student.toString() === studentId);
    if (!submission) throw new Error('Submission not found');

    submission.score = score;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    await assignment.save();

    await Notification.create({
      user: studentId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${assignment.title}" has been graded: ${score}/${assignment.maxScore}`,
      data: { assignmentId, score }
    });

    return submission;
  }
}

module.exports = AssignmentService;
