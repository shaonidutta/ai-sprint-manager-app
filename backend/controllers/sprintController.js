const Sprint = require('../models/Sprint');
const logger = require('../config/logger');
const database = require('../config/database'); // Added for direct DB access
const { formatSuccessResponse, formatErrorResponse } = require('../utils/errors');

class SprintController {
  // GET /api/v1/boards/:id/sprints
  static async getBoardSprints(req, res) {
    try {
      const { id: boardId } = req.params;
      const userId = req.user.id;
      const { page, limit, status, search } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        search: search || ''
      };

      const result = await Sprint.findByBoardId(boardId, userId, options);

      res.status(200).json(formatSuccessResponse(
        result,
        'Sprints retrieved successfully'
      ));
    } catch (error) {
      logger.error('Error getting board sprints:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/sprints/:id
  static async getSprintById(req, res) {
    try {
      const { id } = req.params;
      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint's board
      const userId = req.user.id;
      const boardId = sprint.board.id;
      
      // This will throw an error if user doesn't have access
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      res.status(200).json(formatSuccessResponse(
        { sprint },
        'Sprint retrieved successfully'
      ));
    } catch (error) {
      logger.error('Error getting sprint by ID:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // POST /api/v1/boards/:id/sprints
  static async createSprint(req, res) {
    try {
      const { id: boardId } = req.params;
      const userId = req.user.id;
      const { 
        name, 
        goal, 
        startDate, 
        endDate, 
        capacityStoryPoints,
        status
      } = req.body;

      const sprintData = {
        board_id: boardId,
        name,
        goal,
        start_date: startDate,
        end_date: endDate,
        capacity_story_points: capacityStoryPoints,
        status: status || 'Planning',
        created_by: userId
      };

      const sprint = await Sprint.create(sprintData);

      res.status(201).json(formatSuccessResponse(
        { sprint },
        'Sprint created successfully'
      ));
    } catch (error) {
      logger.error('Error creating sprint:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // PUT /api/v1/sprints/:id
  static async updateSprint(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { 
        name, 
        goal, 
        startDate, 
        endDate, 
        capacityStoryPoints,
        status
      } = req.body;

      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint
      const boardId = sprint.board.id;
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      // Update sprint properties
      if (name !== undefined) sprint.name = name;
      if (goal !== undefined) sprint.goal = goal;
      if (startDate !== undefined) sprint.start_date = startDate;
      if (endDate !== undefined) sprint.end_date = endDate;
      if (capacityStoryPoints !== undefined) sprint.capacity_story_points = capacityStoryPoints;
      if (status !== undefined) sprint.status = status;

      await sprint.save();

      res.status(200).json(formatSuccessResponse(
        { sprint },
        'Sprint updated successfully'
      ));
    } catch (error) {
      logger.error('Error updating sprint:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // POST /api/v1/sprints/:id/start
  static async startSprint(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint
      const boardId = sprint.board.id;
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      await sprint.start(userId);

      res.status(200).json(formatSuccessResponse(
        { sprint },
        'Sprint started successfully'
      ));
    } catch (error) {
      logger.error('Error starting sprint:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // POST /api/v1/sprints/:id/complete
  static async completeSprint(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint
      const boardId = sprint.board.id;
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      await sprint.complete(userId);

      res.status(200).json(formatSuccessResponse(
        { sprint },
        'Sprint completed successfully'
      ));
    } catch (error) {
      logger.error('Error completing sprint:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // DELETE /api/v1/sprints/:id
  static async deleteSprint(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint
      const boardId = sprint.board.id;
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      await sprint.delete();

      res.status(200).json(formatSuccessResponse(
        null,
        'Sprint deleted successfully'
      ));
    } catch (error) {
      logger.error('Error deleting sprint:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/sprints/:id/issues
  static async getSprintIssues(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint
      const boardId = sprint.board.id;
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      const issues = await sprint.getIssues();

      res.status(200).json(formatSuccessResponse(
        { issues },
        'Sprint issues retrieved successfully'
      ));
    } catch (error) {
      logger.error('Error getting sprint issues:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/sprints/:id/burndown
  static async getSprintBurndown(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint
      const boardId = sprint.board.id;
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      const burndownData = await sprint.getBurndownData();

      res.status(200).json(formatSuccessResponse(
        { burndown: burndownData },
        'Sprint burndown data retrieved successfully'
      ));
    } catch (error) {
      logger.error('Error getting sprint burndown:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/sprints/:id/report
  static async getSprintReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const sprint = await Sprint.findById(id);

      // Check if user has access to this sprint
      const boardId = sprint.board.id;
      await Sprint.findByBoardId(boardId, userId, { limit: 1 });

      const [issues, burndownData] = await Promise.all([
        sprint.getIssues(),
        sprint.getBurndownData()
      ]);

      // Calculate sprint statistics
      const totalIssues = issues.length;
      const completedIssues = issues.filter(issue => issue.status === 'Done').length;
      const totalStoryPoints = issues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
      const completedStoryPoints = issues
        .filter(issue => issue.status === 'Done')
        .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

      const report = {
        sprint: {
          id: sprint.id,
          name: sprint.name,
          goal: sprint.goal,
          startDate: sprint.start_date,
          endDate: sprint.end_date,
          status: sprint.status,
          capacityStoryPoints: sprint.capacity_story_points
        },
        statistics: {
          totalIssues,
          completedIssues,
          completionRate: totalIssues > 0 ? (completedIssues / totalIssues * 100).toFixed(1) : 0,
          totalStoryPoints,
          completedStoryPoints,
          storyPointsCompletionRate: totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints * 100).toFixed(1) : 0
        },
        issues,
        burndown: burndownData
      };

      res.status(200).json(formatSuccessResponse(
        { report },
        'Sprint report retrieved successfully'
      ));
    } catch (error) {
      logger.error('Error getting sprint report:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/sprints/:id/status - Get sprint scope status
  static async getSprintStatus(req, res) {
    try {
      const { id: sprintId } = req.params;
      const userId = req.user.id;

      // First, retrieve the sprint to ensure it exists and to get board_id for access check
      const sprint = await Sprint.findById(sprintId); // Leverages existing access checks within findById if board context is needed

      // Check if user has access to this sprint's board (already part of Sprint.findById logic if it fetches board details)
      // If Sprint.findById doesn't inherently check user access to the *board* itself, an explicit check might be needed here.
      // Assuming Sprint.findById or an associated method handles board access for the user.
      // If not, add: await Sprint.findByBoardId(sprint.board.id, userId, { limit: 1 }); to ensure user has board access.

      // SELECT baseline_points, scope_threshold_pct, and scope_alerted from sprints
      const [sprintDetails] = await database.query(
        'SELECT baseline_points, scope_threshold_pct, scope_alerted FROM sprints WHERE id = ?',
        [sprintId]
      );

      if (!sprintDetails) {
        // This case should ideally be caught by Sprint.findById already
        return res.status(404).json(formatErrorResponse({ code: 'NOT_FOUND', message: 'Sprint not found' }));
      }

      // SELECT COALESCE(SUM(story_points), 0) AS current_points from issues
      const [issuePoints] = await database.query(
        'SELECT COALESCE(SUM(story_points), 0) AS current_points FROM issues WHERE sprint_id = ?',
        [sprintId]
      );
      
      const responsePayload = {
        baselinePoints: sprintDetails.baseline_points,
        currentPoints: issuePoints.current_points,
        thresholdPct: parseFloat(sprintDetails.scope_threshold_pct), // Ensure it's a number
        scopeAlerted: Boolean(sprintDetails.scope_alerted) // Ensure it's a boolean
      };

      res.status(200).json(formatSuccessResponse(
        responsePayload,
        'Sprint status retrieved successfully'
      ));

    } catch (error) {
      logger.error(`Error getting sprint status for ID ${req.params.id}:`, error);
      if (error.name === 'NotFoundError') {
        return res.status(404).json(formatErrorResponse({ code: 'NOT_FOUND', message: 'Sprint not found' }));
      }
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }
}

module.exports = SprintController;
