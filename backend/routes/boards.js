const express = require('express');
const router = express.Router();
const BoardController = require('../controllers/boardController');
const IssueController = require('../controllers/issueController');
const SprintController = require('../controllers/sprintController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/errors');

// Validation middleware
const validateBoardId = [
  param('id').isInt({ min: 1 }).withMessage('Board ID must be a positive integer'),
  handleValidationErrors
];

const validateProjectId = [
  param('projectId').isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  handleValidationErrors
];

const validateCreateBoard = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Board name is required and must be less than 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  handleValidationErrors
];

const validateUpdateBoard = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Board name must be less than 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
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
  query('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search term must be less than 255 characters'),
  handleValidationErrors
];

const validateIssueFilters = [
  query('status')
    .optional()
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status'),
  query('assigneeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  query('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  handleValidationErrors
];

// Board routes

// GET /api/v1/boards/:id - Get board by ID
router.get(
  '/:id',
  authenticate,
  validateBoardId,
  BoardController.getBoardById
);



// PUT /api/v1/boards/:id - Update board
router.put(
  '/:id',
  authenticate,
  validateBoardId,
  validateUpdateBoard,
  BoardController.updateBoard
);

// DELETE /api/v1/boards/:id - Delete board
router.delete(
  '/:id',
  authenticate,
  validateBoardId,
  BoardController.deleteBoard
);

// GET /api/v1/boards/:id/issues - Get board issues
router.get(
  '/:id/issues',
  authenticate,
  validateBoardId,
  validatePagination,
  validateIssueFilters,
  BoardController.getBoardIssues
);

// GET /api/v1/boards/:id/kanban - Get kanban view
router.get(
  '/:id/kanban',
  authenticate,
  validateBoardId,
  query('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  handleValidationErrors,
  BoardController.getKanbanView
);

// Issue routes (nested under boards)

// POST /api/v1/boards/:id/issues - Create new issue
router.post(
  '/:id/issues',
  authenticate,
  validateBoardId,
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title is required and must be less than 500 characters'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description must be less than 5000 characters'),
  body('issueType')
    .optional()
    .isIn(['Story', 'Bug', 'Task', 'Epic'])
    .withMessage('Invalid issue type'),
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
  body('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  handleValidationErrors,
  IssueController.createIssue
);

// Sprint routes (nested under boards)

// GET /api/v1/boards/:id/sprints - Get board sprints
router.get(
  '/:id/sprints',
  authenticate,
  validateBoardId,
  validatePagination,
  query('status')
    .optional()
    .isIn(['Planning', 'Active', 'Completed'])
    .withMessage('Invalid sprint status'),
  handleValidationErrors,
  SprintController.getBoardSprints
);

// POST /api/v1/boards/:id/sprints - Create new sprint
router.post(
  '/:id/sprints',
  authenticate,
  validateBoardId,
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Sprint name is required and must be less than 255 characters'),
  body('goal')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Goal must be less than 1000 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('capacityStoryPoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity story points must be positive'),
  body('status')
    .optional()
    .isIn(['Planning', 'Active', 'Completed'])
    .withMessage('Invalid sprint status'),
  handleValidationErrors,
  SprintController.createSprint
);

module.exports = router;
