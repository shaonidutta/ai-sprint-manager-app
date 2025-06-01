const express = require('express');
const router = express.Router();
const SprintController = require('../controllers/sprintController');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../utils/errors');

// Validation middleware
const validateSprintId = [
  param('id').isInt({ min: 1 }).withMessage('Sprint ID must be a positive integer'),
  handleValidationErrors
];

const validateUpdateSprint = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Sprint name must be less than 255 characters'),
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
  handleValidationErrors
];

// Sprint routes

// GET /api/v1/sprints/:id - Get sprint by ID
router.get(
  '/:id',
  authenticate,
  validateSprintId,
  SprintController.getSprintById
);

// PUT /api/v1/sprints/:id - Update sprint
router.put(
  '/:id',
  authenticate,
  validateSprintId,
  validateUpdateSprint,
  SprintController.updateSprint
);

// POST /api/v1/sprints/:id/start - Start sprint
router.post(
  '/:id/start',
  authenticate,
  validateSprintId,
  SprintController.startSprint
);

// POST /api/v1/sprints/:id/complete - Complete sprint
router.post(
  '/:id/complete',
  authenticate,
  validateSprintId,
  SprintController.completeSprint
);

// DELETE /api/v1/sprints/:id - Delete sprint
router.delete(
  '/:id',
  authenticate,
  validateSprintId,
  SprintController.deleteSprint
);

// GET /api/v1/sprints/:id/issues - Get sprint issues
router.get(
  '/:id/issues',
  authenticate,
  validateSprintId,
  SprintController.getSprintIssues
);

// GET /api/v1/sprints/:id/burndown - Get sprint burndown data
router.get(
  '/:id/burndown',
  authenticate,
  validateSprintId,
  SprintController.getSprintBurndown
);

// GET /api/v1/sprints/:id/report - Get sprint report
router.get(
  '/:id/report',
  authenticate,
  validateSprintId,
  SprintController.getSprintReport
);

module.exports = router;
