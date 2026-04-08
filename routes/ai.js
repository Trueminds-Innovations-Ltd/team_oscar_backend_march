const express = require('express');
const router = express.Router();
const AIController = require('../controllers/AIController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { aiQueryValidation } = require('../middlewares/validators');

/**
 * @swagger
 * /api/ai/query:
 *   post:
 *     summary: Query AI assistant
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               courseId: { type: string }
 *               lessonId: { type: string }
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/query', authenticate, validate(aiQueryValidation), AIController.processQuery);

/**
 * @swagger
 * /api/ai/select-tutor:
 *   post:
 *     summary: Select a tutor from the list
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tutorIndex, originalMessage]
 *             properties:
 *               tutorIndex: { type: number }
 *               originalMessage: { type: string }
 *     responses:
 *       200:
 *         description: Tutor selected successfully
 */
router.post('/select-tutor', authenticate, AIController.selectTutor);

module.exports = router;
