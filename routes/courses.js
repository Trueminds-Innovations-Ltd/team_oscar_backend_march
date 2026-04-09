const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const StudentCourseController = require('../controllers/StudentCourseController');
const { authenticate, authorize } = require('../middlewares/auth');

const courseController = CourseController;

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', CourseController.getAllCourses);

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     summary: Get student's enrolled courses with progress
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Student's courses with progress
 */
router.get('/my-courses', authenticate, StudentCourseController.getMyCourses);

/**
 * @swagger
 * /api/courses/enrolled:
 *   get:
 *     summary: Get enrolled courses
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User's enrolled courses
 */
router.get('/enrolled', authenticate, CourseController.getEnrolledCourses);

/**
 * @swagger
 * /api/courses/tutor:
 *   get:
 *     summary: Get tutor's courses
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Tutor's courses
 */
router.get('/tutor', authenticate, authorize(2), CourseController.getTutorCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course details
 */
router.get('/:id', CourseController.getCourse);

/**
 * @swagger
 * /api/courses/{id}/lessons:
 *   get:
 *     summary: Get course lessons
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course lessons
 */
router.get('/:id/lessons', CourseController.getCourseLessons);

/**
 * @swagger
 * /api/courses/{id}/progress:
 *   get:
 *     summary: Get student's progress for a course
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course progress
 */
router.get('/:id/progress', authenticate, StudentCourseController.getCourseProgress);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Tutor only)
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, description: "Course title" }
 *               description: { type: string, description: "Course description" }
 *               category: { type: string, description: "e.g., Design, Development, Business" }
 *               difficulty: { type: integer, enum: [1,2,3], description: "1=Beginner, 2=Intermediate, 3=Advanced" }
 *               tags: { type: array, items: { type: string }, description: "Keywords: ['React', 'JavaScript', 'UI/UX']" }
 *               availableDate: { type: string, format: date-time, description: "When course becomes available" }
 *     responses:
 *       201:
 *         description: Course created
 */
router.post('/', authenticate, authorize(2), CourseController.createCourse);

/**
 * @swagger
 * /api/courses/{id}/lessons:
 *   post:
 *     summary: Add lesson to course (Tutor only)
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               videoUrl: { type: string }
 *               durationMinutes: { type: number }
 *     responses:
 *       201:
 *         description: Lesson added
 */
router.post('/:id/lessons', authenticate, authorize(2), CourseController.createLesson);

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a course (Student self-enroll) OR assign student to course (Tutor)
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId: { type: string, description: "Tutor only: Student ID to enroll" }
 *     responses:
 *       200:
 *         description: Enrolled successfully
 */
router.post('/:id/enroll', authenticate, CourseController.enrollInCourse);

/**
 * @swagger
 * /api/courses/{id}/progress:
 *   put:
 *     summary: Update course progress
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progressPercentage: { type: number, description: "0-100" }
 *               completedAt: { type: string, format: date-time }
 *               lastVisited: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put('/:id/progress', authenticate, StudentCourseController.updateProgress);

/**
 * @swagger
 * /api/courses/{id}/lessons/{lessonId}/start:
 *   post:
 *     summary: Start a lesson
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lesson started
 */
router.post('/:id/lessons/:lessonId/start', authenticate, StudentCourseController.startLesson);

module.exports = router;
