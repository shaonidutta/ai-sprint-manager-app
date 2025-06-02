const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const aiController = require('../controllers/aiController');

// Import middleware
const authMiddleware = require('../middleware/auth');
const { validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
};

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

const sprintCreationSchema = [
  body('boardId')
    .isInt({ min: 1 })
    .withMessage('Board ID must be a positive integer'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('totalStoryPoints')
    .isInt({ min: 1, max: 500 })
    .withMessage('Total story points must be between 1 and 500'),
  body('tasksList')
    .isArray({ min: 1 })
    .withMessage('Tasks list must be a non-empty array'),
  body('tasksList.*')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Each task must be a string between 1 and 500 characters')
];

const sprintPlanDataSchema = [
  body('name')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Sprint name must be between 1 and 255 characters'),
  body('goal')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Sprint goal must be between 1 and 1000 characters'),
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('capacity_story_points')
    .isInt({ min: 1 })
    .withMessage('Capacity story points must be a positive integer'),
  body('status')
    .isIn(['Planning', 'Active', 'Completed'])
    .withMessage('Status must be Planning, Active, or Completed'),
  body('issues')
    .isArray()
    .withMessage('Issues must be an array'),
  body('issues.*.title')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Issue title must be between 1 and 500 characters'),
  body('issues.*.description')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Issue description must be max 2000 characters'),
  body('issues.*.issue_type')
    .isIn(['Story', 'Bug', 'Task', 'Epic'])
    .withMessage('Issue type must be Story, Bug, Task, or Epic'),
  body('issues.*.priority')
    .isIn(['P1', 'P2', 'P3', 'P4'])
    .withMessage('Priority must be P1, P2, P3, or P4'),
  body('issues.*.story_points')
    .optional()
    .isInt({ min: 0, max: 21 })
    .withMessage('Story points must be between 0 and 21'),
  body('issues.*.original_estimate')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Original estimate must be a non-negative integer')
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
  handleValidationErrors,
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
  handleValidationErrors,
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
  handleValidationErrors,
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
  handleValidationErrors,
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
  handleValidationErrors,
  aiController.generateRetrospectiveInsights
);

/**
 * @route   POST /api/v1/ai/projects/:projectId/generate-sprint-plan
 * @desc    Generate AI-powered sprint creation plan from tasks list
 * @access  Private
 */
router.post('/projects/:projectId/generate-sprint-plan',
  authMiddleware.authenticate,
  aiRateLimit,
  projectIdSchema,
  sprintCreationSchema,
  handleValidationErrors,
  aiController.generateSprintCreationPlan
);

/**
 * @route   POST /api/v1/ai/projects/:projectId/create-sprint
 * @desc    Create sprint and issues from AI-generated plan
 * @access  Private
 */
router.post('/projects/:projectId/create-sprint',
  authMiddleware.authenticate,
  projectIdSchema,
  sprintPlanDataSchema,
  handleValidationErrors,
  aiController.createSprintFromPlan
);

module.exports = router;
