const express = require('express');
const router = express.Router();
const ProgressController = require('../controllers/ProgressController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { progressValidation } = require('../middlewares/validators');

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Update lesson progress
 *     tags: [Progress]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, lessonId, progress]
 *             properties:
 *               courseId: { type: string }
 *               lessonId: { type: string }
 *               progress: { type: number, minimum: 0, maximum: 100 }
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.post('/', authenticate, validate(progressValidation), ProgressController.updateProgress);

/**
 * @swagger
 * /api/progress/overall:
 *   get:
 *     summary: Get overall progress
 *     tags: [Progress]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Overall progress data
 */
router.get('/overall', authenticate, ProgressController.getOverallProgress);

/**
 * @swagger
 * /api/progress/course/{courseId}:
 *   get:
 *     summary: Get progress for a course
 *     tags: [Progress]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course progress
 */
router.get('/course/:courseId', authenticate, ProgressController.getCourseProgress);

module.exports = router;
