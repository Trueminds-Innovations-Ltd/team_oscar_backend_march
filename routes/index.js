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

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/courses', courseRoutes);
router.use('/progress', progressRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/channels', channelRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TalentFlow API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
