const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/errors');

// Issue validation rules
const createIssueValidation = [
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
    .withMessage('Invalid issue type. Must be one of: Story, Bug, Task, Epic'),
  
  body('priority')
    .optional()
    .isIn(['P1', 'P2', 'P3', 'P4'])
    .withMessage('Invalid priority. Must be one of: P1, P2, P3, P4'),
  
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
  
  handleValidationErrors
];

const updateIssueValidation = [
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
    .withMessage('Invalid issue type. Must be one of: Story, Bug, Task, Epic'),
  
  body('status')
    .optional()
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status. Must be one of: To Do, In Progress, Done, Blocked'),
  
  body('priority')
    .optional()
    .isIn(['P1', 'P2', 'P3', 'P4'])
    .withMessage('Invalid priority. Must be one of: P1, P2, P3, P4'),
  
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
  
  // Custom validation for blocked status
  body('status').custom((value, { req }) => {
    if (value === 'Blocked' && !req.body.blockedReason) {
      throw new Error('Blocked reason is required when status is Blocked');
    }
    return true;
  }),
  
  handleValidationErrors
];

const statusUpdateValidation = [
  body('status')
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status. Must be one of: To Do, In Progress, Done, Blocked'),
  
  body('blockedReason')
    .if(body('status').equals('Blocked'))
    .notEmpty()
    .withMessage('Blocked reason is required when status is Blocked')
    .isLength({ max: 1000 })
    .withMessage('Blocked reason must be less than 1000 characters'),
  
  handleValidationErrors
];

const issueIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Issue ID must be a positive integer'),
  
  handleValidationErrors
];

const boardIdValidation = [
  param('boardId')
    .isInt({ min: 1 })
    .withMessage('Board ID must be a positive integer'),
  
  handleValidationErrors
];

const issueFiltersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['To Do', 'In Progress', 'Done', 'Blocked'])
    .withMessage('Invalid status. Must be one of: To Do, In Progress, Done, Blocked'),
  
  query('assigneeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assignee ID must be a positive integer'),
  
  query('sprintId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sprint ID must be a positive integer'),
  
  query('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search term must be less than 255 characters')
    .trim(),
  
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

// Comment validation
const createCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment content is required and must be less than 2000 characters'),
  
  handleValidationErrors
];

// Time log validation
const logTimeValidation = [
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
    .withMessage('Logged date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (date > today) {
        throw new Error('Cannot log time for future dates');
      }
      return true;
    }),
  
  handleValidationErrors
];

const timeLogFiltersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
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

module.exports = {
  createIssueValidation,
  updateIssueValidation,
  statusUpdateValidation,
  issueIdValidation,
  boardIdValidation,
  issueFiltersValidation,
  createCommentValidation,
  logTimeValidation,
  timeLogFiltersValidation
};
