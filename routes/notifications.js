const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', authenticate, NotificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put('/:id/read', authenticate, NotificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', authenticate, NotificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/tutor-summary:
 *   get:
 *     summary: Get tutor dashboard summary
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard summary for tutor
 */
router.get('/tutor-summary', authenticate, NotificationController.getTutorDashboardSummary);

router.get('/tutor-details', authenticate, NotificationController.getTutorDashboardDetails);

module.exports = router;
