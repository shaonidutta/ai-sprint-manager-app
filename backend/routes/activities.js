const express = require('express');
const router = express.Router();

// Import controllers
const activityController = require('../controllers/activityController');

// Import middleware
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/v1/activities/user
 * @desc    Get current user's activities
 * @access  Private
 */
router.get('/user',
  authMiddleware.authenticate,
  activityController.getUserActivities
);

/**
 * @route   GET /api/v1/activities/user/stats
 * @desc    Get current user's activity statistics
 * @access  Private
 */
router.get('/user/stats',
  authMiddleware.authenticate,
  activityController.getUserActivityStats
);

/**
 * @route   GET /api/v1/activities/project/:projectId
 * @desc    Get project activities (for project members)
 * @access  Private
 */
router.get('/project/:projectId',
  authMiddleware.authenticate,
  // TODO: Add project member verification middleware
  activityController.getProjectActivities
);

/**
 * @route   POST /api/v1/activities/cleanup
 * @desc    Clean up old activities (admin only)
 * @access  Private (Admin)
 */
router.post('/cleanup',
  authMiddleware.authenticate,
  // TODO: Add admin role verification middleware
  activityController.cleanupOldActivities
);

module.exports = router;
