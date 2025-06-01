const aiService = require('../services/aiService');
const Issue = require('../models/Issue');
const Sprint = require('../models/Sprint');
const Board = require('../models/Board');
const database = require('../config/database');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');
const { logAIRequest } = require('../middleware/activityLogger');

// Get AI quota status for a project
const getQuotaStatus = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify user has access to project
    const accessCheck = await database.query(
      `SELECT up.role FROM user_projects up 
       WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [projectId, userId]
    );

    if (accessCheck.length === 0) {
      return next(new AppError('Access denied to project', 403));
    }

    if (!aiService.isReady()) {
      return next(new AppError('AI service not available', 503));
    }

    const quota = await aiService.checkQuota(projectId);

    res.json(formatSuccessResponse({
      message: 'AI quota status retrieved successfully',
      data: {
        quota_limit: aiService.quotaLimit,
        quota_remaining: quota.remaining,
        quota_used: aiService.quotaLimit - quota.remaining,
        reset_date: quota.resetDate,
        ai_service_available: aiService.isReady()
      }
    }));

  } catch (error) {
    logger.error('Error getting AI quota status:', error);
    next(new AppError('Failed to get AI quota status', 500));
  }
};

// Generate sprint planning suggestions
const generateSprintPlan = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { sprintGoal, capacity, duration, issueIds } = req.body;
    const userId = req.user.id;

    // Verify user has access to project
    const accessCheck = await database.query(
      `SELECT up.role FROM user_projects up 
       WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [projectId, userId]
    );

    if (accessCheck.length === 0) {
      return next(new AppError('Access denied to project', 403));
    }

    if (!aiService.isReady()) {
      return next(new AppError('AI service not available', 503));
    }

    // Get issues for the sprint planning
    let issues = [];
    if (issueIds && issueIds.length > 0) {
      const issueQuery = `
        SELECT i.*, b.project_id
        FROM issues i
        JOIN boards b ON i.board_id = b.id
        WHERE i.id IN (${issueIds.map(() => '?').join(',')}) AND b.project_id = ?
      `;
      issues = await database.query(issueQuery, [...issueIds, projectId]);
    } else {
      // Get backlog issues if no specific issues provided
      const issueQuery = `
        SELECT i.*, b.project_id
        FROM issues i
        JOIN boards b ON i.board_id = b.id
        WHERE b.project_id = ? AND i.status = 'To Do' AND i.sprint_id IS NULL
        ORDER BY i.priority, i.created_at
        LIMIT 20
      `;
      issues = await database.query(issueQuery, [projectId]);
    }

    const sprintData = {
      sprintGoal,
      capacity,
      duration,
      issues: issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        issue_type: issue.issue_type,
        priority: issue.priority,
        story_points: issue.story_points
      }))
    };

    const aiResponse = await aiService.generateSprintPlan(projectId, userId, sprintData);

    // Log activity
    try {
      await logAIRequest(req, userId, 'sprint_planning', projectId, sprintData);
    } catch (activityError) {
      logger.error('Failed to log AI sprint planning activity:', activityError);
    }

    res.json(formatSuccessResponse({
      message: 'Sprint plan generated successfully',
      data: {
        sprint_plan: aiResponse,
        input_data: sprintData
      }
    }));

  } catch (error) {
    logger.error('Error generating sprint plan:', error);
    next(new AppError('Failed to generate sprint plan', 500));
  }
};

// Detect scope creep in active sprint
const detectScopeCreep = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { sprintId } = req.body;
    const userId = req.user.id;

    // Verify user has access to project
    const accessCheck = await database.query(
      `SELECT up.role FROM user_projects up 
       WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [projectId, userId]
    );

    if (accessCheck.length === 0) {
      return next(new AppError('Access denied to project', 403));
    }

    if (!aiService.isReady()) {
      return next(new AppError('AI service not available', 503));
    }

    // Get sprint data
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return next(new AppError('Sprint not found', 404));
    }

    // Get original issues (from sprint start) - this would need to be tracked separately
    // For now, we'll use current issues as a simplified approach
    const currentIssuesQuery = `
      SELECT * FROM issues WHERE sprint_id = ?
    `;
    const currentIssues = await database.query(currentIssuesQuery, [sprintId]);

    const sprintData = {
      sprintGoal: sprint.goal,
      originalIssues: currentIssues, // In real implementation, this should be historical data
      currentIssues: currentIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        story_points: issue.story_points
      }))
    };

    const aiResponse = await aiService.detectScopeCreep(projectId, userId, sprintData);

    // Log activity
    try {
      await logAIRequest(req, userId, 'scope_creep_detection', projectId, { sprintId });
    } catch (activityError) {
      logger.error('Failed to log AI scope creep detection activity:', activityError);
    }

    res.json(formatSuccessResponse({
      message: 'Scope creep analysis completed',
      data: {
        scope_analysis: aiResponse,
        sprint_info: {
          id: sprint.id,
          name: sprint.name,
          goal: sprint.goal,
          status: sprint.status
        }
      }
    }));

  } catch (error) {
    logger.error('Error detecting scope creep:', error);
    next(new AppError('Failed to detect scope creep', 500));
  }
};

// Assess project risks
const assessRisks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify user has access to project
    const accessCheck = await database.query(
      `SELECT up.role FROM user_projects up 
       WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [projectId, userId]
    );

    if (accessCheck.length === 0) {
      return next(new AppError('Access denied to project', 403));
    }

    if (!aiService.isReady()) {
      return next(new AppError('AI service not available', 503));
    }

    // Get project data for risk assessment
    const [issues, sprints, blockedIssues, teamSize] = await Promise.all([
      database.query(`
        SELECT i.* FROM issues i
        JOIN boards b ON i.board_id = b.id
        WHERE b.project_id = ?
        ORDER BY i.created_at DESC
        LIMIT 50
      `, [projectId]),
      
      database.query(`
        SELECT s.* FROM sprints s
        JOIN boards b ON s.board_id = b.id
        WHERE b.project_id = ?
      `, [projectId]),
      
      database.query(`
        SELECT i.* FROM issues i
        JOIN boards b ON i.board_id = b.id
        WHERE b.project_id = ? AND i.status = 'Blocked'
      `, [projectId]),
      
      database.query(`
        SELECT COUNT(*) as count FROM user_projects
        WHERE project_id = ? AND deleted_at IS NULL
      `, [projectId])
    ]);

    const projectData = {
      issues: issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        priority: issue.priority
      })),
      sprints: sprints.map(sprint => ({
        id: sprint.id,
        name: sprint.name,
        status: sprint.status
      })),
      blockedIssues: blockedIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        blocked_reason: issue.blocked_reason
      })),
      teamSize: teamSize[0].count
    };

    const aiResponse = await aiService.assessRisks(projectId, userId, projectData);

    // Log activity
    try {
      await logAIRequest(req, userId, 'risk_assessment', projectId, { projectId });
    } catch (activityError) {
      logger.error('Failed to log AI risk assessment activity:', activityError);
    }

    res.json(formatSuccessResponse({
      message: 'Risk assessment completed',
      data: {
        risk_assessment: aiResponse,
        project_summary: {
          total_issues: projectData.issues.length,
          total_sprints: projectData.sprints.length,
          blocked_issues: projectData.blockedIssues.length,
          team_size: projectData.teamSize
        }
      }
    }));

  } catch (error) {
    logger.error('Error assessing risks:', error);
    next(new AppError('Failed to assess risks', 500));
  }
};

// Generate retrospective insights
const generateRetrospectiveInsights = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { sprintId, teamFeedback, metrics } = req.body;
    const userId = req.user.id;

    // Verify user has access to project
    const accessCheck = await database.query(
      `SELECT up.role FROM user_projects up
       WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [projectId, userId]
    );

    if (accessCheck.length === 0) {
      return next(new AppError('Access denied to project', 403));
    }

    if (!aiService.isReady()) {
      return next(new AppError('AI service not available', 503));
    }

    // Get sprint data
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return next(new AppError('Sprint not found', 404));
    }

    // Get sprint issues and calculate metrics
    const sprintIssues = await database.query(`
      SELECT * FROM issues WHERE sprint_id = ?
    `, [sprintId]);

    const completedIssues = sprintIssues.filter(issue => issue.status === 'Done');
    const plannedPoints = sprintIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0);
    const completedPoints = completedIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0);

    const retrospectiveData = {
      sprintData: {
        goal: sprint.goal,
        plannedPoints,
        completedPoints,
        completedIssues: completedIssues.length,
        totalIssues: sprintIssues.length
      },
      teamFeedback: teamFeedback || {},
      metrics: metrics || {}
    };

    const aiResponse = await aiService.generateRetrospectiveInsights(projectId, userId, retrospectiveData);

    // Log activity
    try {
      await logAIRequest(req, userId, 'retrospective_insights', projectId, { sprintId });
    } catch (activityError) {
      logger.error('Failed to log AI retrospective insights activity:', activityError);
    }

    res.json(formatSuccessResponse({
      message: 'Retrospective insights generated successfully',
      data: {
        retrospective_insights: aiResponse,
        sprint_summary: retrospectiveData.sprintData
      }
    }));

  } catch (error) {
    logger.error('Error generating retrospective insights:', error);
    next(new AppError('Failed to generate retrospective insights', 500));
  }
};

module.exports = {
  getQuotaStatus,
  generateSprintPlan,
  detectScopeCreep,
  assessRisks,
  generateRetrospectiveInsights
};
