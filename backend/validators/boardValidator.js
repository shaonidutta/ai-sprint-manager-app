const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/errors');

// Board validation rules
const createBoardValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Board name is required and must be less than 255 characters')
    .matches(/^[a-zA-Z0-9\s\-_\.]+$/)
    .withMessage('Board name can only contain letters, numbers, spaces, hyphens, underscores, and dots'),
  
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

const updateBoardValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Board name must be less than 255 characters')
    .matches(/^[a-zA-Z0-9\s\-_\.]+$/)
    .withMessage('Board name can only contain letters, numbers, spaces, hyphens, underscores, and dots'),
  
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

const boardIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Board ID must be a positive integer'),
  
  handleValidationErrors
];

const projectIdValidation = [
  param('projectId')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  
  handleValidationErrors
];

const paginationValidation = [
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
    .withMessage('Search term must be less than 255 characters')
    .trim(),
  
  handleValidationErrors
];

const issueFiltersValidation = [
  query('status')
    .optional()
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status. Must be one of: To Do, In Progress, Done, Blocked'),
  
  query('assigneeId')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  
  query('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  
  query('issueType')
    .optional()
    .isIn(['Story', 'Bug', 'Task', 'Epic'])
    .withMessage('Invalid issue type. Must be one of: Story, Bug, Task, Epic'),
  
  query('priority')
    .optional()
    .isIn(['P1', 'P2', 'P3', 'P4'])
    .withMessage('Invalid priority. Must be one of: P1, P2, P3, P4'),
  
  handleValidationErrors
];

const kanbanFiltersValidation = [
  query('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  
  handleValidationErrors
];

module.exports = {
  createBoardValidation,
  updateBoardValidation,
  boardIdValidation,
  projectIdValidation,
  paginationValidation,
  issueFiltersValidation,
  kanbanFiltersValidation
};
