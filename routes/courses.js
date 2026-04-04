const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/CourseController');
const { authenticate, authorize } = require('../middlewares/auth');

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
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Enrolled successfully
 */
router.post('/:id/enroll', authenticate, CourseController.enrollInCourse);

module.exports = router;
