const aiService = require('../services/aiService');
const openaiService = require('../services/openaiService');
const Issue = require('../models/Issue');
const Sprint = require('../models/Sprint');
const Board = require('../models/Board');
const database = require('../config/database');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAIRequest } = require('../middleware/activityLogger');

// Get AI quota status for a project
const getQuotaStatus = async (req, res, next) => {
  try {
    logger.info('[getQuotaStatus] Starting quota status check');
    const { projectId } = req.params;
    const userId = req.user.id;
    logger.info(`[getQuotaStatus] User ${userId} checking access for project ${projectId}`);

    // Verify user has access to project
    logger.info(`[getQuotaStatus] Checking user access to project`);
    const accessCheck = await database.query(
      `SELECT up.role FROM user_projects up
       WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [projectId, userId]
    );
    logger.info(`[getQuotaStatus] Project access check result: ${JSON.stringify(accessCheck)}`);

    if (accessCheck.length === 0) {
      logger.warn(`[getQuotaStatus] Access denied for user ${userId} to project ${projectId}`);
      return next(new AppError('Access denied to project', 403));
    }

    logger.info('[getQuotaStatus] Before calling aiService.isReady()');
    const isAIServiceReady = aiService.isReady();
    logger.info(`[getQuotaStatus] After calling aiService.isReady(): ${isAIServiceReady}`);
    if (!isAIServiceReady) {
      logger.warn('[getQuotaStatus] AI service not ready');
      return next(new AppError('AI service not available', 503));
    }

    logger.info(`[getQuotaStatus] Before calling aiService.checkQuota for project ${projectId}`);
    const quota = await aiService.checkQuota(projectId);
    logger.info(`[getQuotaStatus] After calling aiService.checkQuota: ${JSON.stringify(quota)}`);

    logger.info('[getQuotaStatus] Preparing response');
    res.json(successResponse({
      quota_limit: aiService.quotaLimit,
      quota_remaining: quota.remaining,
      quota_used: aiService.quotaLimit - quota.remaining,
      reset_date: quota.resetDate,
      ai_service_available: aiService.isReady()
    }, 'AI quota status retrieved successfully'));
    logger.info('[getQuotaStatus] Response sent successfully');

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

    logger.info('Sprint plan request received', { projectId, userId, sprintGoal });

    // Check AI service availability FIRST to avoid unnecessary database queries
    if (!aiService.isReady()) {
      logger.warn('AI service not available for sprint planning', { projectId, userId });
      return next(new AppError('AI service not available', 503));
    }

    // Verify user has access to project
    logger.info('Checking user access to project', { projectId, userId });
    const accessCheck = await database.query(
      `SELECT up.role FROM user_projects up
       WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [projectId, userId]
    );

    if (accessCheck.length === 0) {
      logger.warn('User access denied to project', { projectId, userId });
      return next(new AppError('Access denied to project', 403));
    }

    logger.info('User access confirmed', { projectId, userId, role: accessCheck[0].role });

    // Get comprehensive issue data and team information for sprint planning
    let issues = [];
    let teamMembers = [];

    try {
      // Get team members for capacity calculation
      const teamQuery = `
        SELECT u.id, u.first_name, u.last_name, u.email, up.role
        FROM users u
        INNER JOIN user_projects up ON u.id = up.user_id
        WHERE up.project_id = ? AND u.is_active = true AND up.deleted_at IS NULL
      `;
      teamMembers = await database.query(teamQuery, [projectId]);
      logger.info(`Found ${teamMembers.length} team members for project ${projectId}`);

      if (issueIds && issueIds.length > 0) {
        // Get specific issues with full details
        const issueQuery = `
          SELECT i.*, b.project_id,
                 assignee.first_name as assignee_first_name,
                 assignee.last_name as assignee_last_name,
                 assignee.email as assignee_email,
                 reporter.first_name as reporter_first_name,
                 reporter.last_name as reporter_last_name
          FROM issues i
          JOIN boards b ON i.board_id = b.id
          LEFT JOIN users assignee ON i.assignee_id = assignee.id
          INNER JOIN users reporter ON i.reporter_id = reporter.id
          WHERE i.id IN (${issueIds.map(() => '?').join(',')}) AND b.project_id = ?
          ORDER BY
            CASE i.priority
              WHEN 'P1' THEN 1
              WHEN 'P2' THEN 2
              WHEN 'P3' THEN 3
              WHEN 'P4' THEN 4
              ELSE 5
            END, i.created_at
        `;
        issues = await database.query(issueQuery, [...issueIds, projectId]);
      } else {
        // Get comprehensive backlog issues if no specific issues provided
        try {
          const issueQuery = `
            SELECT i.*, b.project_id,
                   assignee.first_name as assignee_first_name,
                   assignee.last_name as assignee_last_name,
                   assignee.email as assignee_email,
                   reporter.first_name as reporter_first_name,
                   reporter.last_name as reporter_last_name
            FROM issues i
            JOIN boards b ON i.board_id = b.id
            LEFT JOIN users assignee ON i.assignee_id = assignee.id
            INNER JOIN users reporter ON i.reporter_id = reporter.id
            WHERE b.project_id = ? AND i.status = 'To Do' AND i.sprint_id IS NULL
            ORDER BY
              CASE i.priority
                WHEN 'P1' THEN 1
                WHEN 'P2' THEN 2
                WHEN 'P3' THEN 3
                WHEN 'P4' THEN 4
                ELSE 5
              END, i.created_at
            LIMIT 30
          `;
          issues = await database.query(issueQuery, [projectId]);
          logger.info(`Found ${issues.length} backlog issues for project ${projectId}`);
        } catch (dbError) {
          logger.warn('Issues table not found or empty, using enhanced mock data for AI demo', { projectId, error: dbError.message });
          // Enhanced mock issues for demonstration
          issues = [
            {
              id: 101,
              title: 'Implement User Authentication System',
              description: 'Create secure login/logout functionality with JWT tokens and password hashing',
              issue_type: 'Story',
              priority: 'P1',
              story_points: 8,
              assignee_first_name: null,
              assignee_last_name: null
            },
            {
              id: 102,
              title: 'Design Dashboard UI Components',
              description: 'Create reusable React components for the main dashboard interface',
              issue_type: 'Story',
              priority: 'P2',
              story_points: 5,
              assignee_first_name: null,
              assignee_last_name: null
            },
            {
              id: 103,
              title: 'Implement API Rate Limiting',
              description: 'Add rate limiting middleware to prevent API abuse',
              issue_type: 'Task',
              priority: 'P2',
              story_points: 3,
              assignee_first_name: null,
              assignee_last_name: null
            },
            {
              id: 104,
              title: 'Database Performance Optimization',
              description: 'Optimize database queries and add proper indexing',
              issue_type: 'Task',
              priority: 'P3',
              story_points: null,
              assignee_first_name: null,
              assignee_last_name: null
            },
            {
              id: 105,
              title: 'Setup CI/CD Pipeline',
              description: 'Configure automated testing and deployment pipeline',
              issue_type: 'Epic',
              priority: 'P3',
              story_points: 13,
              assignee_first_name: null,
              assignee_last_name: null
            }
          ];
          // Mock team members if database is not set up
          teamMembers = [
            { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'Developer' },
            { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'Developer' },
            { id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike@example.com', role: 'Tester' }
          ];
        }
      }
    } catch (error) {
      logger.error('Error fetching data for sprint planning:', error);
      // Enhanced fallback data
      issues = [
        {
          id: 101,
          title: 'Sample User Story 1',
          description: 'A sample user story for demonstration',
          issue_type: 'Story',
          priority: 'P1',
          story_points: 5,
          assignee_first_name: null,
          assignee_last_name: null
        },
        {
          id: 102,
          title: 'Sample Task 1',
          description: 'A sample task for demonstration',
          issue_type: 'Task',
          priority: 'P2',
          story_points: 3,
          assignee_first_name: null,
          assignee_last_name: null
        }
      ];
      teamMembers = [
        { id: 1, first_name: 'Demo', last_name: 'User', email: 'demo@example.com', role: 'Developer' }
      ];
    }

    const sprintData = {
      sprintGoal,
      capacity,
      duration,
      teamMembers,
      issues: issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        issue_type: issue.issue_type,
        priority: issue.priority,
        story_points: issue.story_points,
        assignee_first_name: issue.assignee_first_name,
        assignee_last_name: issue.assignee_last_name,
        assignee_email: issue.assignee_email,
        reporter_first_name: issue.reporter_first_name,
        reporter_last_name: issue.reporter_last_name
      }))
    };

    logger.info(`Generating sprint plan with ${issues.length} issues and ${teamMembers.length} team members`);
    const aiResponse = await aiService.generateSprintPlan(projectId, userId, sprintData);

    // Log activity
    try {
      await logAIRequest(req, userId, 'sprint_planning', projectId, {
        sprintGoal,
        capacity,
        duration,
        issueCount: issues.length,
        teamSize: teamMembers.length
      });
    } catch (activityError) {
      logger.error('Failed to log AI sprint planning activity:', activityError);
    }

    // Enhanced response with comprehensive sprint plan data
    res.json(successResponse({
      sprint_plan: aiResponse,
      input_data: {
        sprintGoal,
        capacity,
        duration,
        teamMembers: teamMembers.map(member => ({
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          role: member.role
        })),
        available_issues: issues.map(issue => ({
          id: issue.id,
          title: issue.title,
          issue_type: issue.issue_type,
          priority: issue.priority,
          story_points: issue.story_points,
          assignee: issue.assignee_first_name ?
            `${issue.assignee_first_name} ${issue.assignee_last_name}` : 'Unassigned'
        }))
      },
      metadata: {
        total_available_issues: issues.length,
        team_size: teamMembers.length,
        generated_at: new Date().toISOString(),
        ai_model_used: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
      }
    }, 'Sprint plan generated successfully'));

  } catch (error) {
    logger.error('Error generating sprint plan:', error);
    next(new AppError('Failed to generate sprint plan', 500));
  }
};

// Detect scope creep in active sprint
const detectScopeCreep = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { sprintId, originalScope } = req.body;
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

    // Get current sprint issues
    const currentIssuesQuery = `
      SELECT * FROM issues WHERE sprint_id = ?
    `;
    const currentIssues = await database.query(currentIssuesQuery, [sprintId]);

    // Calculate current sprint metrics
    const currentStoryPoints = currentIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0);
    const currentIssueCount = currentIssues.length;

    const sprintData = {
      sprintGoal: sprint.goal,
      originalScope: originalScope || 'No original scope provided', // User-provided description
      currentIssues: currentIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        story_points: issue.story_points
      })),
      // Add quantitative metrics for better analysis
      currentStoryPoints,
      currentIssueCount,
      sprintDuration: sprint.end_date && sprint.start_date ?
        Math.ceil((new Date(sprint.end_date) - new Date(sprint.start_date)) / (1000 * 60 * 60 * 24)) : null
    };

    const aiResponse = await aiService.detectScopeCreep(projectId, userId, sprintData);

    // Log activity
    try {
      await logAIRequest(req, userId, 'scope_creep_detection', projectId, { sprintId });
    } catch (activityError) {
      logger.error('Failed to log AI scope creep detection activity:', activityError);
    }

    res.json(successResponse({
      scope_analysis: aiResponse,
      sprint_info: {
        id: sprint.id,
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status
      }
    }, 'Scope creep analysis completed'));

  } catch (error) {
    logger.error('Error detecting scope creep:', error);
    next(new AppError('Failed to detect scope creep', 500));
  }
};

// Calculate team workload from existing data
const calculateTeamWorkloadFromExistingData = async (projectId) => {
  const query = `
    SELECT
      u.id, u.first_name, u.last_name, up.role,
      COUNT(i.id) as total_issues,
      COALESCE(SUM(CASE WHEN i.status != 'Done' THEN i.story_points ELSE 0 END), 0) as active_story_points,
      COALESCE(SUM(i.story_points), 0) as total_story_points,
      COUNT(CASE WHEN i.status = 'In Progress' THEN 1 END) as in_progress_issues,
      COUNT(CASE WHEN i.status = 'Blocked' THEN 1 END) as blocked_issues,
      COUNT(CASE WHEN i.priority IN ('P1', 'P2') THEN 1 END) as high_priority_issues,
      CASE
        WHEN up.role = 'Admin' THEN 15
        WHEN up.role = 'Project Manager' THEN 20
        WHEN up.role = 'Developer' THEN 40
        ELSE 30
      END as estimated_capacity
    FROM users u
    INNER JOIN user_projects up ON u.id = up.user_id
    LEFT JOIN issues i ON u.id = i.assignee_id AND i.sprint_id IN (
      SELECT s.id FROM sprints s
      INNER JOIN boards b ON s.board_id = b.id
      WHERE b.project_id = ? AND s.status = 'Active'
    )
    WHERE up.project_id = ? AND u.is_active = true AND up.deleted_at IS NULL
    GROUP BY u.id, u.first_name, u.last_name, up.role
  `;

  return await database.query(query, [projectId, projectId]);
};

// Assess project risks
const assessRisks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { includeHeatmap } = req.body;
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

    // NEW: Generate heatmap data if requested
    let heatmapData = null;
    if (includeHeatmap) {
      try {
        const teamWorkloadData = await calculateTeamWorkloadFromExistingData(projectId);
        const projectContext = {
          totalIssues: issues.length,
          activeSprint: sprints.find(s => s.status === 'Active')?.name || 'No active sprint',
          teamSize: teamWorkloadData.length
        };

        heatmapData = await openaiService.generateRiskHeatmap(teamWorkloadData, projectContext);
        logger.info('Risk heatmap generated successfully', { projectId, teamSize: teamWorkloadData.length });
      } catch (heatmapError) {
        logger.error('Error generating risk heatmap:', heatmapError);
        // Continue without heatmap data rather than failing the entire request
        heatmapData = null;
      }
    }

    // Log activity
    try {
      await logAIRequest(req, userId, 'risk_assessment', projectId, {
        projectId,
        includeHeatmap: !!includeHeatmap
      });
    } catch (activityError) {
      logger.error('Failed to log AI risk assessment activity:', activityError);
    }

    const response = {
      risk_assessment: aiResponse,
      project_summary: {
        total_issues: projectData.issues.length,
        total_sprints: projectData.sprints.length,
        blocked_issues: projectData.blockedIssues.length,
        team_size: projectData.teamSize
      }
    };

    // Add heatmap data if generated
    if (heatmapData) {
      response.heatmap_data = heatmapData;
    }

    res.json(successResponse(response, 'Risk assessment completed'));

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

    res.json(successResponse({
      retrospective_insights: aiResponse,
      sprint_summary: retrospectiveData.sprintData
    }, 'Retrospective insights generated successfully'));

  } catch (error) {
    logger.error('Error generating retrospective insights:', error);
    next(new AppError('Failed to generate retrospective insights', 500));
  }
};

// Generate sprint creation plan from tasks list
const generateSprintCreationPlan = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { boardId, startDate, endDate, totalStoryPoints, tasksList, rejectedTasks, editedTasks } = req.body;
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

    // Get team members for assignment
    const teamMembers = await database.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, up.role
      FROM users u
      INNER JOIN user_projects up ON u.id = up.user_id
      WHERE up.project_id = ? AND u.is_active = true AND up.deleted_at IS NULL
    `, [projectId]);

    // Prepare data for AI processing
    const sprintCreationData = {
      boardId,
      startDate,
      endDate,
      totalStoryPoints,
      tasksList,
      teamMembers,
      createdBy: userId,
      reporterId: userId,
      rejectedTasks,
      editedTasks
    };

    const aiResponse = await aiService.generateSprintCreationPlan(projectId, userId, sprintCreationData);

    // Log activity
    try {
      await logAIRequest(req, userId, 'sprint_creation_plan', projectId, {
        boardId,
        totalStoryPoints,
        tasksCount: tasksList.length,
        teamSize: teamMembers.length
      });
    } catch (activityError) {
      logger.error('Failed to log AI sprint creation plan activity:', activityError);
    }

    res.json(successResponse({
      sprint_plan: aiResponse,
      input_data: {
        boardId,
        startDate,
        endDate,
        totalStoryPoints,
        tasksList,
        teamMembers: teamMembers.map(member => ({
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          role: member.role
        }))
      },
      metadata: {
        tasks_count: tasksList.length,
        team_size: teamMembers.length,
        generated_at: new Date().toISOString(),
        ai_model_used: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
      }
    }, 'Sprint creation plan generated successfully'));

  } catch (error) {
    logger.error('Error generating sprint creation plan:', error);
    next(new AppError('Failed to generate sprint creation plan', 500));
  }
};

// Create sprint and issues from AI-generated plan
const createSprintFromPlan = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const sprintPlanData = req.body;
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

    // Use database.transaction to handle begin, commit, and rollback
    await database.transaction(async (connection) => {
      // Create sprint
      const sprintData = {
        board_id: sprintPlanData.board_id,
        name: sprintPlanData.name,
        goal: sprintPlanData.goal,
        start_date: sprintPlanData.start_date,
        end_date: sprintPlanData.end_date,
        capacity_story_points: sprintPlanData.capacity_story_points,
        status: sprintPlanData.status || 'Active',
        created_by: sprintPlanData.created_by || userId
      };

      const [sprintExecuteResult] = await connection.execute(`
        INSERT INTO sprints (board_id, name, goal, start_date, end_date, capacity_story_points, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sprintData.board_id,
        sprintData.name,
        sprintData.goal,
        sprintData.start_date,
        sprintData.end_date,
        sprintData.capacity_story_points,
        sprintData.status,
        sprintData.created_by
      ]);

      const sprintId = sprintExecuteResult.insertId;

      // Create issues
      const createdIssues = [];
      for (const issue of sprintPlanData.issues) {
        const [issueExecuteResult] = await connection.execute(`
          INSERT INTO issues (board_id, sprint_id, title, description, issue_type, status, priority, story_points, original_estimate, assignee_id, reporter_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sprintPlanData.board_id,
          sprintId,
          issue.title,
          issue.description || '',
          issue.issue_type,
          issue.status || 'To Do',
          issue.priority,
          issue.story_points || null,
          issue.original_estimate || null,
          issue.assignee_id || null,
          issue.reporter_id || sprintPlanData.created_by || userId
        ]);

        createdIssues.push({
          id: issueExecuteResult.insertId,
          title: issue.title,
          issue_type: issue.issue_type,
          priority: issue.priority,
          story_points: issue.story_points
        });
      }

      // Log activity (still outside the transaction commit/rollback logic, but after successful DB operations)
      // If logging needs to be part of the transaction, it should also use 'connection'
      // For now, keeping it as is, assuming it's a separate concern that doesn't need to roll back.
      try {
        await logAIRequest(req, userId, 'sprint_created', projectId, {
          sprintId,
          issuesCount: createdIssues.length,
          totalStoryPoints: sprintPlanData.capacity_story_points
        });
      } catch (activityError) {
        logger.error('Failed to log sprint creation activity:', activityError);
      }

      res.json(successResponse({
        sprint: {
          id: sprintId,
          name: sprintData.name,
          goal: sprintData.goal,
          status: sprintData.status,
          capacity_story_points: sprintData.capacity_story_points
        },
        issues: createdIssues,
        summary: {
          sprint_id: sprintId,
          issues_created: createdIssues.length,
          total_story_points: createdIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0)
        }
      }, 'Sprint and issues created successfully'));
    }); // database.transaction handles commit/rollback

  } catch (error) {
    // This catch block now handles errors from database.transaction or other preceding logic
    logger.error('Error creating sprint from plan:', error);
    next(new AppError('Failed to create sprint from plan', 500));
  }
};

module.exports = {
  getQuotaStatus,
  generateSprintPlan,
  detectScopeCreep,
  assessRisks,
  generateRetrospectiveInsights,
  generateSprintCreationPlan,
  createSprintFromPlan
};
