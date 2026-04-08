const CourseService = require('../services/CourseService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

class CourseController {
  static async getAllCourses(req, res, next) {
    try {
      const { category, difficulty, search } = req.query;
      const filters = { category, difficulty, search };

      const courses = await CourseService.getAllCourses(filters);

      return successResponse(res, { courses }, 'Courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCourse(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseById(id);

      return successResponse(res, { course }, 'Course retrieved successfully');
    } catch (error) {
      if (error.message === 'Course not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  static async getCourseLessons(req, res, next) {
    try {
      const { id } = req.params;
      const lessons = await CourseService.getCourseLessons(id);

      return successResponse(res, { lessons }, 'Lessons retrieved successfully');
    } catch (error) {
      if (error.message === 'Course not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  static async createCourse(req, res, next) {
    try {
      const { title, description, category, difficulty, tags } = req.body;
      const course = await CourseService.createCourse(req.user.id, {
        title,
        description,
        category,
        difficulty,
        tags
      });

      return successResponse(res, { course }, 'Course created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async createLesson(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content, videoUrl, durationMinutes, orderIndex } = req.body;

      const lesson = await CourseService.createLesson(req.user.id, id, {
        title,
        content,
        videoUrl,
        durationMinutes,
        orderIndex
      });

      return successResponse(res, { lesson }, 'Lesson created successfully', 201);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('tutor')) {
        return errorResponse(res, error.message, 403);
      }
      next(error);
    }
  }

  static async enrollInCourse(req, res, next) {
    try {
      const { id } = req.params;
      const enrollment = await CourseService.enrollInCourse(req.user.id, id);

      return successResponse(res, { enrollment }, 'Enrolled in course successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getEnrolledCourses(req, res, next) {
    try {
      const courses = await CourseService.getEnrolledCourses(req.user.id);

      return successResponse(res, { courses }, 'Enrolled courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTutorCourses(req, res, next) {
    try {
      const courses = await CourseService.getTutorCourses(req.user.id);

      return successResponse(res, { courses }, 'Tutor courses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseController;
