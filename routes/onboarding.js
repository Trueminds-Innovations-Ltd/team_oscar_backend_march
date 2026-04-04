const express = require('express');
const router = express.Router();
const OnboardingController = require('../controllers/OnboardingController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { onboardingValidation } = require('../middlewares/validators');

/**
 * @swagger
 * /api/onboarding:
 *   post:
 *     summary: Complete user onboarding
 *     tags: [Onboarding]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [interests, level]
 *             properties:
 *               interests: { type: array, items: { type: string } }
 *               level: { type: integer, enum: [1, 2, 3], description: "1 = Beginner, 2 = Intermediate, 3 = Advanced" }
 *     responses:
 *       200:
 *         description: Onboarding completed
 */
router.post('/', authenticate, validate(onboardingValidation), OnboardingController.completeOnboarding);

module.exports = router;
