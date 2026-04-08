const express = require('express');
const router = express.Router();
const StudySessionController = require('../controllers/StudySessionController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { studySessionValidation } = require('../middlewares/validators');

router.post('/', authenticate, authorize(2), validate(studySessionValidation), StudySessionController.createStudySession);
router.get('/', authenticate, authorize(2), StudySessionController.getMyStudySessions);
router.get('/student', authenticate, StudySessionController.getStudentStudySessions);
router.get('/course/:courseId', authenticate, StudySessionController.getStudySessionsForCourse);
router.post('/:sessionId/complete', authenticate, StudySessionController.markComplete);

module.exports = router;