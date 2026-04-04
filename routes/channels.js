const express = require('express');
const router = express.Router();
const CollaborationController = require('../controllers/CollaborationController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { messageValidation } = require('../middlewares/validators');

/**
 * @swagger
 * /api/channels:
 *   get:
 *     summary: Get user's channels
 *     tags: [Collaboration]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of channels
 */
router.get('/', authenticate, CollaborationController.getUserChannels);

/**
 * @swagger
 * /api/channels/{id}/messages:
 *   get:
 *     summary: Get channel messages
 *     tags: [Collaboration]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Channel messages
 */
router.get('/:id/messages', authenticate, CollaborationController.getChannelMessages);

/**
 * @swagger
 * /api/channels/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Collaboration]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [channelId, content]
 *             properties:
 *               channelId: { type: string }
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/messages', authenticate, validate(messageValidation), CollaborationController.sendMessage);

/**
 * @swagger
 * /api/channels:
 *   post:
 *     summary: Create a channel
 *     tags: [Collaboration]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, name]
 *             properties:
 *               courseId: { type: string }
 *               name: { type: string }
 *               type: { type: string }
 *     responses:
 *       201:
 *         description: Channel created
 */
router.post('/', authenticate, CollaborationController.createChannel);

module.exports = router;
