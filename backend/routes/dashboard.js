const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats',
  authMiddleware.authenticate,
  dashboardController.getDashboardStats
);

/**
 * @route   GET /api/v1/dashboard/activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/activity',
  authMiddleware.authenticate,
  dashboardController.getRecentActivity
);

/**
 * @route   GET /api/v1/dashboard/ai-insights
 * @desc    Get AI insights
 * @access  Private
 */
router.get('/ai-insights',
  authMiddleware.authenticate,
  dashboardController.getAIInsights
);

module.exports = router;
