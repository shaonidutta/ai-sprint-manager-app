const Sprint = require('../models/Sprint');
const logger = require('../config/logger');
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprints retrieved successfully',
        data: result
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint retrieved successfully',
        data: { sprint }
      }));
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

      res.status(201).json(formatSuccessResponse({
        message: 'Sprint created successfully',
        data: { sprint }
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint updated successfully',
        data: { sprint }
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint started successfully',
        data: { sprint }
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint completed successfully',
        data: { sprint }
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint deleted successfully'
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint issues retrieved successfully',
        data: { issues }
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint burndown data retrieved successfully',
        data: { burndown: burndownData }
      }));
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

      res.status(200).json(formatSuccessResponse({
        message: 'Sprint report retrieved successfully',
        data: { report }
      }));
    } catch (error) {
      logger.error('Error getting sprint report:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }
}

module.exports = SprintController;
