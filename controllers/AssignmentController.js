const AssignmentService = require('../services/AssignmentService');
const { successResponse, errorResponse } = require('../utils/response');

class AssignmentController {
  static async getStudentAssignments(req, res, next) {
    try {
      const assignments = await AssignmentService.getStudentAssignments(req.user.id);

      return successResponse(res, { assignments }, 'Assignments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCourseAssignments(req, res, next) {
    try {
      const { courseId } = req.params;
      const assignments = await AssignmentService.getCourseAssignments(courseId);

      return successResponse(res, { assignments }, 'Assignments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await AssignmentService.getAssignment(id);

      return successResponse(res, { assignment }, 'Assignment retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async createAssignment(req, res, next) {
    try {
      const { courseId, lessonId, title, description, dueDate, maxScore } = req.body;
      const assignment = await AssignmentService.createAssignment(req.user.id, {
        courseId,
        lessonId,
        title,
        description,
        dueDate,
        maxScore
      });

      return successResponse(res, { assignment }, 'Assignment created successfully', 201);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('tutor')) {
        return errorResponse(res, error.message, 403);
      }
      next(error);
    }
  }

  static async submitAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const { content, fileUrl } = req.body;

      const submission = await AssignmentService.submitAssignment(
        req.user.id,
        id,
        { content, fileUrl }
      );

      return successResponse(res, { submission }, 'Assignment submitted successfully', 201);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('deadline')) {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  }

  static async getSubmissions(req, res, next) {
    try {
      const { id } = req.params;
      const submissions = await AssignmentService.getSubmissions(id);

      return successResponse(res, { submissions }, 'Submissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async gradeSubmission(req, res, next) {
    try {
      const { id } = req.params;
      const { score, feedback } = req.body;

      const submission = await AssignmentService.gradeSubmission(req.user.id, id, {
        score,
        feedback
      });

      return successResponse(res, { submission }, 'Submission graded successfully');
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('tutor')) {
        return errorResponse(res, error.message, 403);
      }
      if (error.message.includes('Score cannot exceed')) {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  }
}

module.exports = AssignmentController;
