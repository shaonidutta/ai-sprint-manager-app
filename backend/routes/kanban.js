const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const kanbanController = require('../controllers/kanbanController');

// Import middleware
const authMiddleware = require('../middleware/auth');
const { validateRequest } = require('../validators/userValidator');

// Validation schemas
const boardIdSchema = param('boardId')
  .isInt({ min: 1 })
  .withMessage('Board ID must be a positive integer');

const updatePositionSchema = [
  body('issueId')
    .isInt({ min: 1 })
    .withMessage('Issue ID must be a positive integer'),
  body('newStatus')
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status'),
  body('newOrder')
    .isInt({ min: 0 })
    .withMessage('New order must be a non-negative integer'),
  body('oldStatus')
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid old status'),
  body('oldOrder')
    .isInt({ min: 0 })
    .withMessage('Old order must be a non-negative integer')
];

const updateColumnsSchema = [
  body('columns')
    .isArray({ min: 1 })
    .withMessage('Columns must be a non-empty array'),
  body('columns.*.id')
    .isInt({ min: 1 })
    .withMessage('Column ID must be a positive integer'),
  body('columns.*.position')
    .isInt({ min: 1 })
    .withMessage('Column position must be a positive integer'),
  body('columns.*.wip_limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('WIP limit must be a positive integer')
];

const kanbanQuerySchema = [
  query('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  query('swimlane')
    .optional()
    .isIn(['assignee', 'priority', 'issue_type'])
    .withMessage('Invalid swimlane type')
];

/**
 * @route   GET /api/v1/kanban/board/:boardId
 * @desc    Get enhanced kanban view for a board
 * @access  Private
 */
router.get('/board/:boardId',
  authMiddleware.authenticate,
  boardIdSchema,
  kanbanQuerySchema,
  validateRequest,
  kanbanController.getKanbanView
);

/**
 * @route   PUT /api/v1/kanban/board/:boardId/issue-position
 * @desc    Update issue position (drag and drop)
 * @access  Private
 */
router.put('/board/:boardId/issue-position',
  authMiddleware.authenticate,
  boardIdSchema,
  updatePositionSchema,
  validateRequest,
  kanbanController.updateIssuePosition
);

/**
 * @route   GET /api/v1/kanban/board/:boardId/columns
 * @desc    Get board columns configuration
 * @access  Private
 */
router.get('/board/:boardId/columns',
  authMiddleware.authenticate,
  boardIdSchema,
  validateRequest,
  kanbanController.getBoardColumns
);

/**
 * @route   PUT /api/v1/kanban/board/:boardId/columns
 * @desc    Update board columns configuration
 * @access  Private
 */
router.put('/board/:boardId/columns',
  authMiddleware.authenticate,
  boardIdSchema,
  updateColumnsSchema,
  validateRequest,
  kanbanController.updateBoardColumns
);

module.exports = router;
