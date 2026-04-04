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

module.exports = router;
