const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const onboardingRoutes = require('./onboarding');
const courseRoutes = require('./courses');
const progressRoutes = require('./progress');
const assignmentRoutes = require('./assignments');
const channelRoutes = require('./channels');
const aiRoutes = require('./ai');
const notificationRoutes = require('./notifications');
const studySessionsRoutes = require('./studySessions');
const uploadRoutes = require('./upload');
const studySessionProgressRoutes = require('./studySessionProgress');
const conversationRoutes = require('./conversations');

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/courses', courseRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/channels', channelRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/study-sessions', studySessionsRoutes);
router.use('/progress', progressRoutes);
router.use('/study-sessions', studySessionProgressRoutes);
router.use('/conversations', conversationRoutes);
router.use('/upload', uploadRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TalentFlow API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
