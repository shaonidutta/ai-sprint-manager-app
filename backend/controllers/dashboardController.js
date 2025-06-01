const database = require('../config/database');
const logger = require('../config/logger');

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get total projects for user
    const projectsQuery = `
      SELECT COUNT(*) as total_projects
      FROM projects p
      INNER JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL
    `;
    const projectsResult = await database.query(projectsQuery, [userId]);
    const totalProjects = projectsResult[0]?.total_projects || 0;

    // Get active sprints for user's projects
    const sprintsQuery = `
      SELECT COUNT(*) as active_sprints
      FROM sprints s
      INNER JOIN boards b ON s.board_id = b.id
      INNER JOIN projects p ON b.project_id = p.id
      INNER JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ? AND s.status = 'active' AND p.is_active = true AND up.deleted_at IS NULL
    `;
    const sprintsResult = await database.query(sprintsQuery, [userId]);
    const activeSprints = sprintsResult[0]?.active_sprints || 0;

    // Get completed tasks for user's projects
    const completedTasksQuery = `
      SELECT COUNT(*) as completed_tasks
      FROM issues i
      INNER JOIN boards b ON i.board_id = b.id
      INNER JOIN projects p ON b.project_id = p.id
      INNER JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ? AND i.status = 'done' AND p.is_active = true AND up.deleted_at IS NULL
    `;
    const completedTasksResult = await database.query(completedTasksQuery, [userId]);
    const completedTasks = completedTasksResult[0]?.completed_tasks || 0;

    // Get pending tasks for user's projects
    const pendingTasksQuery = `
      SELECT COUNT(*) as pending_tasks
      FROM issues i
      INNER JOIN boards b ON i.board_id = b.id
      INNER JOIN projects p ON b.project_id = p.id
      INNER JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ? AND i.status IN ('todo', 'in_progress') AND p.is_active = true AND up.deleted_at IS NULL
    `;
    const pendingTasksResult = await database.query(pendingTasksQuery, [userId]);
    const pendingTasks = pendingTasksResult[0]?.pending_tasks || 0;

    res.json({
      success: true,
      data: {
        totalProjects,
        activeSprints,
        completedTasks,
        pendingTasks
      }
    });

  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    next(error);
  }
};

// Get recent activity
const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get recent activities from user's projects (simplified for now)
    const activityQuery = `
      SELECT
        'project_created' as activity_type,
        p.name as project_name,
        p.created_at as timestamp,
        CONCAT('Created project "', p.name, '"') as description
      FROM projects p
      INNER JOIN user_projects up ON p.id = up.project_id
      WHERE up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT ?
    `;

    const activityQueryWithLimit = activityQuery.replace('LIMIT ?', `LIMIT ${parseInt(limit)}`);
    const activities = await database.query(activityQueryWithLimit, [userId]);

    // Format timestamps
    const formattedActivities = activities.map(activity => ({
      ...activity,
      timestamp: formatRelativeTime(activity.timestamp)
    }));

    res.json({
      success: true,
      data: formattedActivities
    });

  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    next(error);
  }
};

// Get AI insights
const getAIInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // For now, return static insights. In the future, this would be AI-generated
    const insights = [
      {
        type: 'suggestion',
        title: 'Sprint Planning Suggestion',
        message: 'Consider breaking down large tasks into smaller, manageable pieces for better velocity tracking.',
        priority: 'medium'
      },
      {
        type: 'success',
        title: 'Performance Update',
        message: 'Your team velocity has been consistent. Great work maintaining steady progress!',
        priority: 'low'
      }
    ];

    // TODO: Implement actual AI insights based on user's project data
    // This would involve:
    // 1. Analyzing sprint velocity
    // 2. Detecting scope creep patterns
    // 3. Identifying bottlenecks
    // 4. Suggesting improvements

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    logger.error('Error fetching AI insights:', error);
    next(error);
  }
};

// Helper function to format relative time
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getAIInsights
};
