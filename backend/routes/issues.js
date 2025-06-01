const express = require('express');
const router = express.Router();
const IssueController = require('../controllers/issueController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/errors');

// Validation middleware
const validateIssueId = [
  param('id').isInt({ min: 1 }).withMessage('Issue ID must be a positive integer'),
  handleValidationErrors
];

const validateUpdateIssue = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be less than 500 characters'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description must be less than 5000 characters'),
  body('issueType')
    .optional()
    .isIn(['Story', 'Bug', 'Task', 'Epic'])
    .withMessage('Invalid issue type'),
  body('status')
    .optional()
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['P1', 'P2', 'P3', 'P4'])
    .withMessage('Invalid priority'),
  body('assigneeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  body('storyPoints')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Story points must be between 0 and 100'),
  body('originalEstimate')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Original estimate must be positive'),
  body('timeRemaining')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time remaining must be positive'),
  body('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  body('blockedReason')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Blocked reason must be less than 1000 characters'),
  handleValidationErrors
];

const validateStatusUpdate = [
  body('status')
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status'),
  body('blockedReason')
    .if(body('status').equals('Blocked'))
    .notEmpty()
    .withMessage('Blocked reason is required when status is Blocked')
    .isLength({ max: 1000 })
    .withMessage('Blocked reason must be less than 1000 characters'),
  handleValidationErrors
];

const validateCreateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content is required and must be less than 2000 characters'),
  handleValidationErrors
];

const validateLogTime = [
  body('timeSpent')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Time spent must be between 1 and 1440 minutes (24 hours)'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('loggedDate')
    .optional()
    .isISO8601()
    .withMessage('Logged date must be a valid date'),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateTimeLogFilters = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
];

// Issue routes

// GET /api/v1/issues/:id - Get issue by ID
router.get(
  '/:id',
  authenticate,
  validateIssueId,
  IssueController.getIssueById
);

// PUT /api/v1/issues/:id - Update issue
router.put(
  '/:id',
  authenticate,
  validateIssueId,
  validateUpdateIssue,
  IssueController.updateIssue
);

// PATCH /api/v1/issues/:id/status - Update issue status
router.patch(
  '/:id/status',
  authenticate,
  validateIssueId,
  validateStatusUpdate,
  IssueController.updateIssueStatus
);

// DELETE /api/v1/issues/:id - Delete issue
router.delete(
  '/:id',
  authenticate,
  validateIssueId,
  IssueController.deleteIssue
);

// Comment routes

// GET /api/v1/issues/:id/comments - Get issue comments
router.get(
  '/:id/comments',
  authenticate,
  validateIssueId,
  validatePagination,
  IssueController.getIssueComments
);

// POST /api/v1/issues/:id/comments - Create comment
router.post(
  '/:id/comments',
  authenticate,
  validateIssueId,
  validateCreateComment,
  IssueController.createComment
);

// Time logging routes

// GET /api/v1/issues/:id/time-logs - Get issue time logs
router.get(
  '/:id/time-logs',
  authenticate,
  validateIssueId,
  validatePagination,
  validateTimeLogFilters,
  IssueController.getIssueTimeLogs
);

// POST /api/v1/issues/:id/time-logs - Log time on issue
router.post(
  '/:id/time-logs',
  authenticate,
  validateIssueId,
  validateLogTime,
  IssueController.logTime
);

// Comment management routes

// PUT /api/v1/comments/:id - Update comment
router.put(
  '/comments/:id',
  authenticate,
  param('id').isInt({ min: 1 }).withMessage('Comment ID must be a positive integer'),
  validateCreateComment,
  handleValidationErrors,
  IssueController.updateComment
);

// DELETE /api/v1/comments/:id - Delete comment
router.delete(
  '/comments/:id',
  authenticate,
  param('id').isInt({ min: 1 }).withMessage('Comment ID must be a positive integer'),
  handleValidationErrors,
  IssueController.deleteComment
);

// Time log management routes

// PUT /api/v1/time-logs/:id - Update time log
router.put(
  '/time-logs/:id',
  authenticate,
  param('id').isInt({ min: 1 }).withMessage('Time log ID must be a positive integer'),
  validateLogTime,
  handleValidationErrors,
  IssueController.updateTimeLog
);

// DELETE /api/v1/time-logs/:id - Delete time log
router.delete(
  '/time-logs/:id',
  authenticate,
  param('id').isInt({ min: 1 }).withMessage('Time log ID must be a positive integer'),
  handleValidationErrors,
  IssueController.deleteTimeLog
);

module.exports = router;
