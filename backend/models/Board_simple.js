const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class BoardSimple {
  constructor(data) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.name = data.name;
    this.description = data.description;
    this.is_default = data.is_default;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Simplified version of findByProjectId to avoid malformed packet issues
  static async findByProjectIdSimple(projectId, userId, options = {}) {
    try {
      const { page = 1, limit = 10, search = '' } = options;
      
      // Ensure parameters are integers
      const projectIdInt = parseInt(projectId);
      const limitInt = parseInt(limit);

      // Check if user has access to project
      const accessCheck = await database.query(
        `SELECT role FROM user_projects
         WHERE project_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [projectIdInt, userId]
      );

      if (accessCheck.length === 0) {
        throw new ValidationError('Access denied to project');
      }

      // Use a very simple query to avoid malformed packet issues
      let query = 'SELECT * FROM boards WHERE project_id = ?';
      let queryParams = [projectIdInt];

      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      // Use string interpolation for LIMIT to avoid MySQL parameter issues
      query += ` ORDER BY is_default DESC, created_at DESC LIMIT ${limitInt}`;

      logger.info('Executing simple boards query:', { query, queryParams });
      const rows = await database.query(query, queryParams);
      logger.info('Simple boards query result:', { rowCount: rows.length });

      const boards = rows.map(row => {
        const board = new BoardSimple(row);
        // Add minimal additional data
        board.project = {
          id: row.project_id
        };
        board.creator = {
          id: row.created_by
        };
        board.stats = {
          issueCount: 0,
          sprintCount: 0
        };
        return board;
      });

      // Simple count query
      let countQuery = 'SELECT COUNT(*) as total FROM boards WHERE project_id = ?';
      let countParams = [projectIdInt];

      if (search) {
        countQuery += ' AND (name LIKE ? OR description LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const countResult = await database.query(countQuery, countParams);
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
      logger.error('Error in simple boards query:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      project_id: this.project_id,
      name: this.name,
      description: this.description,
      is_default: this.is_default,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
      project: this.project,
      creator: this.creator,
      stats: this.stats
    };
  }
}

module.exports = BoardSimple;
