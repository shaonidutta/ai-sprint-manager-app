const Board = require('../models/Board');
const BoardSimple = require('../models/Board_simple');
const logger = require('../config/logger');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/errors');

class BoardController {
  // GET /api/v1/projects/:id/boards
  static async getProjectBoards(req, res) {
    try {
      const { id: projectId } = req.params;
      const userId = req.user.id;
      const { page, limit, search } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || ''
      };

      // Try the simple approach first to avoid malformed packet errors
      logger.info('Using simplified boards query to avoid malformed packet issues');
      const result = await BoardSimple.findByProjectIdSimple(projectId, userId, options);

      res.status(200).json(formatSuccessResponse({
        message: 'Boards retrieved successfully',
        data: result
      }));
    } catch (error) {
      logger.error('Error getting project boards:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/boards/:id
  static async getBoardById(req, res) {
    try {
      const { id } = req.params;
      const board = await Board.findById(id);

      // Check if user has access to this board's project
      const userId = req.user.id;
      const projectId = board.project.id;
      
      // This will throw an error if user doesn't have access
      await Board.findByProjectId(projectId, userId, { limit: 1 });

      res.status(200).json(formatSuccessResponse({
        message: 'Board retrieved successfully',
        data: { board }
      }));
    } catch (error) {
      logger.error('Error getting board by ID:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // POST /api/v1/projects/:id/boards
  static async createBoard(req, res) {
    try {
      const { id: projectId } = req.params;
      const userId = req.user.id;
      const { name, description, isDefault } = req.body;

      const boardData = {
        project_id: projectId,
        name,
        description,
        is_default: isDefault || false,
        created_by: userId
      };

      const board = await Board.create(boardData);

      res.status(201).json(formatSuccessResponse({
        message: 'Board created successfully',
        data: { board }
      }));
    } catch (error) {
      logger.error('Error creating board:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // PUT /api/v1/boards/:id
  static async updateBoard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { name, description, isDefault } = req.body;

      const board = await Board.findById(id);

      // Check if user has permission to update this board
      const projectId = board.project.id;
      await Board.findByProjectId(projectId, userId, { limit: 1 });

      // Update board properties
      if (name !== undefined) board.name = name;
      if (description !== undefined) board.description = description;
      if (isDefault !== undefined) {
        board.is_default = isDefault;
        
        // If setting as default, unset other default boards
        if (isDefault) {
          const database = require('../config/database');
          await database.query(
            'UPDATE boards SET is_default = false WHERE project_id = ? AND id != ?',
            [projectId, id]
          );
        }
      }

      await board.save();

      res.status(200).json(formatSuccessResponse({
        message: 'Board updated successfully',
        data: { board }
      }));
    } catch (error) {
      logger.error('Error updating board:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // DELETE /api/v1/boards/:id
  static async deleteBoard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const board = await Board.findById(id);

      // Check if user has permission to delete this board
      const projectId = board.project.id;
      await Board.findByProjectId(projectId, userId, { limit: 1 });

      await board.delete();

      res.status(200).json(formatSuccessResponse({
        message: 'Board deleted successfully'
      }));
    } catch (error) {
      logger.error('Error deleting board:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/boards/:id/issues
  static async getBoardIssues(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { status, assigneeId, sprintId, page, limit } = req.query;

      const board = await Board.findById(id);

      // Check if user has access to this board
      const projectId = board.project.id;
      await Board.findByProjectId(projectId, userId, { limit: 1 });

      const options = {
        status,
        assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
        sprintId: sprintId ? parseInt(sprintId) : undefined,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50
      };

      const issues = await board.getIssues(options);

      res.status(200).json(formatSuccessResponse({
        message: 'Board issues retrieved successfully',
        data: { issues }
      }));
    } catch (error) {
      logger.error('Error getting board issues:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }

  // GET /api/v1/boards/:id/kanban
  static async getKanbanView(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { sprintId } = req.query;

      const board = await Board.findById(id);

      // Check if user has access to this board
      const projectId = board.project.id;
      await Board.findByProjectId(projectId, userId, { limit: 1 });

      // Get issues grouped by status
      const statuses = ['To Do', 'In Progress', 'Done', 'Blocked'];
      const kanbanData = {};

      for (const status of statuses) {
        const options = {
          status,
          sprintId: sprintId ? parseInt(sprintId) : undefined,
          limit: 100 // Get more issues for kanban view
        };
        
        const issues = await board.getIssues(options);
        kanbanData[status] = issues;
      }

      res.status(200).json(formatSuccessResponse({
        message: 'Kanban view retrieved successfully',
        data: { 
          board: {
            id: board.id,
            name: board.name,
            description: board.description
          },
          columns: kanbanData
        }
      }));
    } catch (error) {
      logger.error('Error getting kanban view:', error);
      res.status(error.statusCode || 500).json(formatErrorResponse(error));
    }
  }
}

module.exports = BoardController;
