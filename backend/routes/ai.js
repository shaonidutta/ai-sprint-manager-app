const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const aiController = require('../controllers/aiController');

// Import middleware
const authMiddleware = require('../middleware/auth');
const { validateRequest } = require('../validators/userValidator');

// Validation schemas
const projectIdSchema = param('projectId')
  .isInt({ min: 1 })
  .withMessage('Project ID must be a positive integer');

const sprintPlanSchema = [
  body('sprintGoal')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Sprint goal must be a string with max 500 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Duration must be between 1 and 8 weeks'),
  body('issueIds')
    .optional()
    .isArray()
    .withMessage('Issue IDs must be an array'),
  body('issueIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each issue ID must be a positive integer')
];

const scopeCreepSchema = [
  body('sprintId')
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer')
];

const retrospectiveSchema = [
  body('sprintId')
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  body('teamFeedback')
    .optional()
    .isObject()
    .withMessage('Team feedback must be an object'),
  body('teamFeedback.wentWell')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('What went well must be a string with max 1000 characters'),
  body('teamFeedback.improvements')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Improvements must be a string with max 1000 characters'),
  body('teamFeedback.previousActions')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Previous actions must be a string with max 1000 characters'),
  body('metrics')
    .optional()
    .isObject()
    .withMessage('Metrics must be an object')
];

// Rate limiting middleware for AI endpoints
const aiRateLimit = (req, res, next) => {
  // Add rate limiting logic here if needed
  // For now, we rely on the quota system in the AI service
  next();
};

/**
 * @route   GET /api/v1/ai/projects/:projectId/quota
 * @desc    Get AI quota status for a project
 * @access  Private
 */
router.get('/projects/:projectId/quota',
  authMiddleware.authenticate,
  projectIdSchema,
  validateRequest,
  aiController.getQuotaStatus
);

/**
 * @route   POST /api/v1/ai/projects/:projectId/sprint-plan
 * @desc    Generate AI-powered sprint planning suggestions
 * @access  Private
 */
router.post('/projects/:projectId/sprint-plan',
  authMiddleware.authenticate,
  aiRateLimit,
  projectIdSchema,
  sprintPlanSchema,
  validateRequest,
  aiController.generateSprintPlan
);

/**
 * @route   POST /api/v1/ai/projects/:projectId/scope-creep
 * @desc    Detect scope creep in active sprint
 * @access  Private
 */
router.post('/projects/:projectId/scope-creep',
  authMiddleware.authenticate,
  aiRateLimit,
  projectIdSchema,
  scopeCreepSchema,
  validateRequest,
  aiController.detectScopeCreep
);

/**
 * @route   POST /api/v1/ai/projects/:projectId/risk-assessment
 * @desc    Assess project risks using AI
 * @access  Private
 */
router.post('/projects/:projectId/risk-assessment',
  authMiddleware.authenticate,
  aiRateLimit,
  projectIdSchema,
  validateRequest,
  aiController.assessRisks
);

/**
 * @route   POST /api/v1/ai/projects/:projectId/retrospective
 * @desc    Generate retrospective insights using AI
 * @access  Private
 */
router.post('/projects/:projectId/retrospective',
  authMiddleware.authenticate,
  aiRateLimit,
  projectIdSchema,
  retrospectiveSchema,
  validateRequest,
  aiController.generateRetrospectiveInsights
);

module.exports = router;
