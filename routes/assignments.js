const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/AssignmentController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { submissionValidation } = require('../middlewares/validators');

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get student's assignments
 *     tags: [Assignments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of assignments
 */
router.get('/', authenticate, AssignmentController.getStudentAssignments);

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignment details
 */
router.get('/:id', AssignmentController.getAssignment);

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create assignment (Tutor only)
 *     tags: [Assignments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date-time }
 *               maxScore: { type: number }
 *     responses:
 *       201:
 *         description: Assignment created
 */
router.post('/', authenticate, authorize('tutor'), AssignmentController.createAssignment);

/**
 * @swagger
 * /api/assignments/{id}/submit:
 *   post:
 *     summary: Submit assignment
 *     tags: [Assignments]
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
 *               content: { type: string }
 *               fileUrl: { type: string }
 *     responses:
 *       201:
 *         description: Assignment submitted
 */
router.post('/:id/submit', authenticate, validate(submissionValidation), AssignmentController.submitAssignment);

/**
 * @swagger
 * /api/assignments/{id}/grade:
 *   post:
 *     summary: Grade submission (Tutor only)
 *     tags: [Assignments]
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
 *               studentId: { type: string }
 *               score: { type: number }
 *               feedback: { type: string }
 *     responses:
 *       200:
 *         description: Submission graded
 */
router.post('/:id/grade', authenticate, authorize('tutor'), AssignmentController.gradeSubmission);

module.exports = router;
