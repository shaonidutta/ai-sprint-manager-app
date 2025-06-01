const UserActivity = require('../models/UserActivity');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

// Get user activities
const getUserActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      limit = 50, 
      offset = 0, 
      action = null, 
      resource_type = null 
    } = req.query;

    // Validate limit and offset
    const parsedLimit = Math.min(parseInt(limit) || 50, 100); // Max 100 items
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);

    const options = {
      limit: parsedLimit,
      offset: parsedOffset,
      action,
      resource_type
    };

    const activities = await UserActivity.findByUserId(userId, options);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total: activities.length
        }
      }
    });

  } catch (error) {
    logger.error('Get user activities error:', error);
    next(new AppError('Failed to get user activities', 500));
  }
};

// Get project activities (for project members)
const getProjectActivities = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { 
      limit = 100, 
      offset = 0, 
      action = null 
    } = req.query;

    // Validate limit and offset
    const parsedLimit = Math.min(parseInt(limit) || 100, 200); // Max 200 items for project activities
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);

    const options = {
      limit: parsedLimit,
      offset: parsedOffset,
      action
    };

    const activities = await UserActivity.findByProjectId(projectId, options);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
          total: activities.length
        }
      }
    });

  } catch (error) {
    logger.error('Get project activities error:', error);
    next(new AppError('Failed to get project activities', 500));
  }
};

// Get user activity statistics
const getUserActivityStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Validate days parameter
    const parsedDays = Math.min(Math.max(parseInt(days) || 30, 1), 365); // Between 1 and 365 days

    const stats = await UserActivity.getActivityStats(userId, parsedDays);

    // Process stats to group by action and resource type
    const processedStats = {
      total_activities: 0,
      activities_by_action: {},
      activities_by_resource_type: {},
      activities_by_date: {},
      period_days: parsedDays
    };

    stats.forEach(stat => {
      processedStats.total_activities += stat.count;

      // Group by action
      if (!processedStats.activities_by_action[stat.action]) {
        processedStats.activities_by_action[stat.action] = 0;
      }
      processedStats.activities_by_action[stat.action] += stat.count;

      // Group by resource type
      if (stat.resource_type) {
        if (!processedStats.activities_by_resource_type[stat.resource_type]) {
          processedStats.activities_by_resource_type[stat.resource_type] = 0;
        }
        processedStats.activities_by_resource_type[stat.resource_type] += stat.count;
      }

      // Group by date
      const dateKey = stat.activity_date;
      if (!processedStats.activities_by_date[dateKey]) {
        processedStats.activities_by_date[dateKey] = 0;
      }
      processedStats.activities_by_date[dateKey] += stat.count;
    });

    res.json({
      success: true,
      data: {
        stats: processedStats
      }
    });

  } catch (error) {
    logger.error('Get user activity stats error:', error);
    next(new AppError('Failed to get activity statistics', 500));
  }
};

// Clean up old activities (admin only)
const cleanupOldActivities = async (req, res, next) => {
  try {
    const { days = 90 } = req.body;

    // Validate days parameter
    const parsedDays = Math.max(parseInt(days) || 90, 30); // Minimum 30 days

    const deletedCount = await UserActivity.cleanupOldActivities(parsedDays);

    logger.info(`Cleaned up ${deletedCount} old activity records`, { 
      userId: req.user.id,
      daysToKeep: parsedDays
    });

    res.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} old activity records`,
      data: {
        deleted_count: deletedCount,
        days_kept: parsedDays
      }
    });

  } catch (error) {
    logger.error('Cleanup old activities error:', error);
    next(new AppError('Failed to cleanup old activities', 500));
  }
};

module.exports = {
  getUserActivities,
  getProjectActivities,
  getUserActivityStats,
  cleanupOldActivities
};
