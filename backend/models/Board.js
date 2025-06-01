const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class Board {
  constructor(data = {}) {
    this.id = data.id || null;
    this.project_id = data.project_id || data.projectId || null;
    this.name = data.name || null;
    this.description = data.description || null;
    this.is_default = data.is_default !== undefined ? data.is_default : data.isDefault || false;
    this.created_by = data.created_by || data.createdBy || null;
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.project_id) {
      errors.push('Project ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Board name is required');
    }

    if (this.name && this.name.length > 255) {
      errors.push('Board name must be less than 255 characters');
    }

    if (this.description && this.description.length > 1000) {
      errors.push('Board description must be less than 1000 characters');
    }

    if (!this.created_by) {
      errors.push('Created by user ID is required');
    }

    if (errors.length > 0) {
      throw new ValidationError('Board validation failed', errors);
    }

    return true;
  }

  // Static methods
  static async create(boardData) {
    try {
      const board = new Board(boardData);
      board.validate();

      // Check if project exists and user has permission
      const projectCheck = await database.query(
        `SELECT p.id, up.role 
         FROM projects p 
         INNER JOIN user_projects up ON p.id = up.project_id 
         WHERE p.id = ? AND up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL`,
        [board.project_id, board.created_by]
      );

      if (projectCheck.length === 0) {
        throw new ValidationError('Project not found or user does not have access');
      }

      const userRole = projectCheck[0].role;
      if (!['Admin', 'Manager'].includes(userRole)) {
        throw new ValidationError('Insufficient permissions to create board');
      }

      // If this is set as default, unset other default boards for this project
      if (board.is_default) {
        await database.query(
          'UPDATE boards SET is_default = false WHERE project_id = ?',
          [board.project_id]
        );
      }

      const query = `
        INSERT INTO boards (project_id, name, description, is_default, created_by) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        board.project_id,
        board.name.trim(),
        board.description ? board.description.trim() : null,
        board.is_default,
        board.created_by
      ];
      
      const result = await database.query(query, values);
      board.id = result.insertId;
      
      logger.info(`Board created: ${board.id} by user ${board.created_by}`);
      return await Board.findById(board.id);
    } catch (error) {
      logger.error('Error creating board:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT b.*, p.name as project_name, p.project_key,
               u.first_name, u.last_name, u.email as creator_email
        FROM boards b
        INNER JOIN projects p ON b.project_id = p.id
        INNER JOIN users u ON b.created_by = u.id
        WHERE b.id = ?
      `;
      
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        throw new NotFoundError('Board not found');
      }
      
      const boardData = rows[0];
      const board = new Board(boardData);
      
      // Add additional properties
      board.project = {
        id: boardData.project_id,
        name: boardData.project_name,
        key: boardData.project_key
      };
      
      board.creator = {
        id: boardData.created_by,
        firstName: boardData.first_name,
        lastName: boardData.last_name,
        email: boardData.creator_email
      };
      
      return board;
    } catch (error) {
      logger.error('Error finding board by ID:', error);
      throw error;
    }
  }

  static async findByProjectId(projectId, userId, options = {}) {
    try {
      const { page = 1, limit = 10, search = '' } = options;
      const offset = (page - 1) * limit;

      // Ensure parameters are integers
      const projectIdInt = parseInt(projectId);
      const limitInt = parseInt(limit);
      const offsetInt = parseInt(offset);

      // Check if user has access to project
      const accessCheck = await database.query(
        `SELECT role FROM user_projects
         WHERE project_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [projectIdInt, userId]
      );

      if (accessCheck.length === 0) {
        throw new ValidationError('Access denied to project');
      }

      let whereClause = 'WHERE b.project_id = ?';
      let queryParams = [projectIdInt];

      if (search) {
        whereClause += ' AND (b.name LIKE ? OR b.description LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      // Build query without subqueries and use string interpolation for LIMIT/OFFSET
      // to avoid MySQL parameter issues
      let query = `
        SELECT b.*, p.name as project_name, p.project_key as project_key,
               u.first_name, u.last_name
        FROM boards b
        INNER JOIN projects p ON b.project_id = p.id
        INNER JOIN users u ON b.created_by = u.id
        ${whereClause}
        ORDER BY b.is_default DESC, b.created_at DESC
        LIMIT ${limitInt}`;

      // Only add OFFSET if it's greater than 0
      if (offsetInt > 0) {
        query += ` OFFSET ${offsetInt}`;
      }

      logger.info('Executing boards query:', { query, queryParams });
      const rows = await database.query(query, queryParams);
      logger.info('Boards query result:', { rowCount: rows.length });

      const boards = rows.map(row => {
        const board = new Board(row);
        board.project = {
          id: row.project_id,
          name: row.project_name,
          key: row.project_key
        };
        board.creator = {
          id: row.created_by,
          firstName: row.first_name,
          lastName: row.last_name
        };
        board.stats = {
          issueCount: 0, // Will be populated separately if needed
          sprintCount: 0 // Will be populated separately if needed
        };
        return board;
      });

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM boards b
        INNER JOIN projects p ON b.project_id = p.id
        INNER JOIN users u ON b.created_by = u.id
        ${whereClause}
      `;
      // Use the same parameters as the main query (no LIMIT/OFFSET parameters were added to queryParams)
      const countResult = await database.query(countQuery, queryParams);
      const total = countResult[0].total;

      return {
        boards,
        pagination: {
          page: parseInt(page),
          limit: limitInt,
          total,
          totalPages: Math.ceil(total / limitInt)
        }
      };
    } catch (error) {
      logger.error('Error finding boards by project ID:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        // Update existing board
        const query = `
          UPDATE boards SET
            name = ?, description = ?, is_default = ?, updated_at = NOW()
          WHERE id = ?
        `;

        const values = [
          this.name.trim(),
          this.description ? this.description.trim() : null,
          this.is_default,
          this.id
        ];

        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save board without ID. Use Board.create() for new boards.');
      }
    } catch (error) {
      logger.error('Error saving board:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Check if this is the default board
      if (this.is_default) {
        throw new ValidationError('Cannot delete default board');
      }

      // Check if board has issues
      const issueCount = await database.query(
        'SELECT COUNT(*) as count FROM issues WHERE board_id = ?',
        [this.id]
      );

      if (issueCount[0].count > 0) {
        throw new ValidationError('Cannot delete board with existing issues');
      }

      // Delete the board
      const query = 'DELETE FROM boards WHERE id = ?';
      await database.query(query, [this.id]);

      logger.info(`Board deleted: ${this.id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting board:', error);
      throw error;
    }
  }

  static async createDefaultBoard(projectId, userId) {
    try {
      const boardData = {
        project_id: projectId,
        name: 'Main Board',
        description: 'Default board for project',
        is_default: true,
        created_by: userId
      };

      return await Board.create(boardData);
    } catch (error) {
      logger.error('Error creating default board:', error);
      throw error;
    }
  }

  async getIssues(options = {}) {
    try {
      const { status, assigneeId, sprintId, page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE i.board_id = ?';
      let queryParams = [this.id];

      if (status) {
        whereClause += ' AND i.status = ?';
        queryParams.push(status);
      }

      if (assigneeId) {
        whereClause += ' AND i.assignee_id = ?';
        queryParams.push(assigneeId);
      }

      if (sprintId) {
        whereClause += ' AND i.sprint_id = ?';
        queryParams.push(sprintId);
      }

      const query = `
        SELECT i.*,
               assignee.first_name as assignee_first_name, assignee.last_name as assignee_last_name,
               reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name,
               s.name as sprint_name
        FROM issues i
        LEFT JOIN users assignee ON i.assignee_id = assignee.id
        LEFT JOIN users reporter ON i.reporter_id = reporter.id
        LEFT JOIN sprints s ON i.sprint_id = s.id
        ${whereClause}
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);
      const rows = await database.query(query, queryParams);

      return rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        issueType: row.issue_type,
        status: row.status,
        priority: row.priority,
        storyPoints: row.story_points,
        assignee: row.assignee_id ? {
          id: row.assignee_id,
          firstName: row.assignee_first_name,
          lastName: row.assignee_last_name
        } : null,
        reporter: {
          id: row.reporter_id,
          firstName: row.reporter_first_name,
          lastName: row.reporter_last_name
        },
        sprint: row.sprint_id ? {
          id: row.sprint_id,
          name: row.sprint_name
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting board issues:', error);
      throw error;
    }
  }
}

module.exports = Board;
