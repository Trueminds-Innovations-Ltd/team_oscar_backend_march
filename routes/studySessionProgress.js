const express = require('express');
const router = express.Router();
const StudySessionProgressController = require('../controllers/StudySessionProgressController');
const { authenticate } = require('../middlewares/auth');

router.get('/my-progress', authenticate, StudySessionProgressController.getMySessionProgress);
router.post('/:sessionId/progress', authenticate, StudySessionProgressController.updateProgress);
router.get('/:sessionId/progress', authenticate, StudySessionProgressController.getProgress);

module.exports = router;