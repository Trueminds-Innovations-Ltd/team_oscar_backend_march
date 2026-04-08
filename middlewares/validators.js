const { body, param, query } = require('express-validator');

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and number'),
  body('role').isInt({ min: 1, max: 2 }).withMessage('Role must be 1 (student) or 2 (tutor)'),
  body('phone').optional().trim(),
  body('country').optional().trim(),
  body('state').optional().trim(),
  body('city').optional().trim()
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('country').optional().trim(),
  body('state').optional().trim(),
  body('city').optional().trim()
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const onboardingValidation = [
  body('interests').isArray({ min: 1 }).withMessage('At least one interest is required'),
  body('interests.*').trim().notEmpty().withMessage('Interest cannot be empty'),
  body('level').isInt({ min: 1, max: 3 }).withMessage('Level must be 1 (Beginner), 2 (Intermediate), or 3 (Advanced)')
];

const progressValidation = [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
];

const submissionValidation = [
  body('content').optional().isString(),
  body('fileUrl').optional().isString()
];

const aiQueryValidation = [
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('courseId').optional().isString().withMessage('Invalid course ID'),
  body('lessonId').optional().isString().withMessage('Invalid lesson ID')
];

const messageValidation = [
  body('channelId').notEmpty().withMessage('Channel ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
];

const studySessionValidation = [
  body('course').notEmpty().withMessage('Course is required'),
  body('subTopic').trim().notEmpty().withMessage('Sub-topic is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
    .custom(value => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('fileUrl').optional(),
  body('linkUrl').optional()
    .custom((value, { req }) => {
      if (!req.body.fileUrl && !value) {
        throw new Error('Either file or link is required');
      }
      return true;
    })
];

module.exports = {
  signupValidation,
  updateProfileValidation,
  loginValidation,
  onboardingValidation,
  progressValidation,
  submissionValidation,
  aiQueryValidation,
  messageValidation,
  studySessionValidation
};
