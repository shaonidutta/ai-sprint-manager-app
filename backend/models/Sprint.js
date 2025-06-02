const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class Sprint {
  constructor(data = {}) {
    this.id = data.id || null;
    this.board_id = data.board_id || data.boardId || null;
    this.name = data.name || null;
    this.goal = data.goal || null;
    this.start_date = data.start_date || data.startDate || null;
    this.end_date = data.end_date || data.endDate || null;
    this.capacity_story_points = data.capacity_story_points || data.capacityStoryPoints || null;
    this.status = data.status || 'Planning';
    this.created_by = data.created_by || data.createdBy || null;
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.board_id) {
      errors.push('Board ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Sprint name is required');
    }

    if (this.name && this.name.length > 255) {
      errors.push('Sprint name must be less than 255 characters');
    }

    if (this.goal && this.goal.length > 1000) {
      errors.push('Sprint goal must be less than 1000 characters');
    }

    const validStatuses = ['Planning', 'Active', 'Completed'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid status. Must be one of: ' + validStatuses.join(', '));
    }

    if (this.start_date && this.end_date) {
      const startDate = new Date(this.start_date);
      const endDate = new Date(this.end_date);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    if (this.capacity_story_points && this.capacity_story_points < 0) {
      errors.push('Capacity story points must be positive');
    }

    if (!this.created_by) {
      errors.push('Created by user ID is required');
    }

    if (errors.length > 0) {
      throw new ValidationError('Sprint validation failed', errors);
    }

    return true;
  }

  // Static methods
  static async create(sprintData) {
    try {
      const sprint = new Sprint(sprintData);
      sprint.validate();

      // Check if board exists and user has permission
      const boardCheck = await database.query(
        `SELECT b.id, b.project_id, up.role 
         FROM boards b 
         INNER JOIN projects p ON b.project_id = p.id
         INNER JOIN user_projects up ON p.id = up.project_id 
         WHERE b.id = ? AND up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL`,
        [sprint.board_id, sprint.created_by]
      );

      if (boardCheck.length === 0) {
        throw new ValidationError('Board not found or user does not have access');
      }

      const userRole = boardCheck[0].role;
      if (!['Admin', 'Manager'].includes(userRole)) {
        throw new ValidationError('Insufficient permissions to create sprint');
      }

      // Check if there's already an active sprint for this board
      if (sprint.status === 'Active') {
        const activeSprintCheck = await database.query(
          'SELECT id FROM sprints WHERE board_id = ? AND status = "Active"',
          [sprint.board_id]
        );

        if (activeSprintCheck.length > 0) {
          throw new ValidationError('There is already an active sprint for this board');
        }
      }

      const query = `
        INSERT INTO sprints (board_id, name, goal, start_date, end_date, capacity_story_points, status, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        sprint.board_id,
        sprint.name.trim(),
        sprint.goal ? sprint.goal.trim() : null,
        sprint.start_date,
        sprint.end_date,
        sprint.capacity_story_points,
        sprint.status,
        sprint.created_by
      ];
      
      const result = await database.query(query, values);
      sprint.id = result.insertId;
      
      logger.info(`Sprint created: ${sprint.id} by user ${sprint.created_by}`);
      return await Sprint.findById(sprint.id);
    } catch (error) {
      logger.error('Error creating sprint:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT s.*, 
               b.name as board_name, b.project_id,
               p.name as project_name, p.project_key,
               u.first_name, u.last_name, u.email as creator_email
        FROM sprints s
        INNER JOIN boards b ON s.board_id = b.id
        INNER JOIN projects p ON b.project_id = p.id
        INNER JOIN users u ON s.created_by = u.id
        WHERE s.id = ?
      `;
      
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        throw new NotFoundError('Sprint not found');
      }
      
      const sprintData = rows[0];
      const sprint = new Sprint(sprintData);
      
      // Add additional properties
      sprint.board = {
        id: sprintData.board_id,
        name: sprintData.board_name,
        projectId: sprintData.project_id
      };
      
      sprint.project = {
        id: sprintData.project_id,
        name: sprintData.project_name,
        key: sprintData.project_key
      };
      
      sprint.creator = {
        id: sprintData.created_by,
        firstName: sprintData.first_name,
        lastName: sprintData.last_name,
        email: sprintData.creator_email
      };
      
      return sprint;
    } catch (error) {
      logger.error('Error finding sprint by ID:', error);
      throw error;
    }
  }

  static async findByBoardId(boardId, userId, options = {}) {
    try {
      const { page = 1, limit = 10, status, search = '' } = options;

      // Ensure parameters are integers
      const boardIdInt = parseInt(boardId);
      const userIdInt = parseInt(userId);
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const offsetInt = (pageInt - 1) * limitInt;

      // Check if user has access to board
      const accessCheck = await database.query(
        `SELECT b.project_id
         FROM boards b
         INNER JOIN user_projects up ON b.project_id = up.project_id
         WHERE b.id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
        [boardIdInt, userIdInt]
      );

      if (accessCheck.length === 0) {
        throw new ValidationError('Access denied to board');
      }

      let whereClause = 'WHERE s.board_id = ?';
      let queryParams = [boardIdInt];

      if (status) {
        whereClause += ' AND s.status = ?';
        queryParams.push(status);
      }

      if (search) {
        whereClause += ' AND (s.name LIKE ? OR s.goal LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      // Use string interpolation for LIMIT and OFFSET to avoid MySQL parameter issues
      const query = `
        SELECT s.*,
               u.first_name, u.last_name
        FROM sprints s
        INNER JOIN users u ON s.created_by = u.id
        ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT ${limitInt} OFFSET ${offsetInt}
      `;
      
      const rows = await database.query(query, queryParams);
      
      const sprints = rows.map(row => {
        const sprint = new Sprint(row);
        sprint.creator = {
          id: row.created_by,
          firstName: row.first_name,
          lastName: row.last_name
        };
        // Initialize stats - will be populated separately if needed
        sprint.stats = {
          issueCount: 0,
          completedStoryPoints: 0,
          totalStoryPoints: 0
        };
        return sprint;
      });

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM sprints s 
        ${whereClause}
      `;
      const countResult = await database.query(countQuery, queryParams);
      const total = countResult[0].total;

      return {
        sprints,
        pagination: {
          page: pageInt,
          limit: limitInt,
          total,
          totalPages: Math.ceil(total / limitInt)
        }
      };
    } catch (error) {
      logger.error('Error finding sprints by board ID:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        this.validate();

        const query = `
          UPDATE sprints SET
            name = ?, goal = ?, start_date = ?, end_date = ?,
            capacity_story_points = ?, status = ?, updated_at = NOW()
          WHERE id = ?
        `;

        const values = [
          this.name.trim(),
          this.goal ? this.goal.trim() : null,
          this.start_date,
          this.end_date,
          this.capacity_story_points,
          this.status,
          this.id
        ];

        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save sprint without ID. Use Sprint.create() for new sprints.');
      }
    } catch (error) {
      logger.error('Error saving sprint:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Check if sprint has issues
      const issueCount = await database.query(
        'SELECT COUNT(*) as count FROM issues WHERE sprint_id = ?',
        [this.id]
      );

      if (issueCount[0].count > 0) {
        throw new ValidationError('Cannot delete sprint with existing issues');
      }

      // Delete the sprint
      const query = 'DELETE FROM sprints WHERE id = ?';
      await database.query(query, [this.id]);

      logger.info(`Sprint deleted: ${this.id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting sprint:', error);
      throw error;
    }
  }

  async start(userId) {
    try {
      // Check if there's already an active sprint for this board
      const activeSprintCheck = await database.query(
        'SELECT id FROM sprints WHERE board_id = ? AND status = "Active" AND id != ?',
        [this.board_id, this.id]
      );

      if (activeSprintCheck.length > 0) {
        throw new ValidationError('There is already an active sprint for this board');
      }

      this.status = 'Active';
      if (!this.start_date) {
        this.start_date = new Date().toISOString().split('T')[0];
      }

      await this.save();

      logger.info(`Sprint ${this.id} started by user ${userId}`);
      return this;
    } catch (error) {
      logger.error('Error starting sprint:', error);
      throw error;
    }
  }

  async complete(userId) {
    try {
      this.status = 'Completed';
      if (!this.end_date) {
        this.end_date = new Date().toISOString().split('T')[0];
      }

      await this.save();

      logger.info(`Sprint ${this.id} completed by user ${userId}`);
      return this;
    } catch (error) {
      logger.error('Error completing sprint:', error);
      throw error;
    }
  }

  async getIssues() {
    try {
      const query = `
        SELECT i.*,
               assignee.first_name as assignee_first_name, assignee.last_name as assignee_last_name,
               reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name
        FROM issues i
        LEFT JOIN users assignee ON i.assignee_id = assignee.id
        INNER JOIN users reporter ON i.reporter_id = reporter.id
        WHERE i.sprint_id = ?
        ORDER BY i.created_at DESC
      `;

      const rows = await database.query(query, [this.id]);

      return rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        issue_type: row.issue_type,  // Keep snake_case for consistency
        status: row.status,
        priority: row.priority,
        story_points: row.story_points,  // Keep snake_case for consistency
        assignee: row.assignee_id ? {
          id: row.assignee_id,
          first_name: row.assignee_first_name,  // Keep snake_case for consistency
          last_name: row.assignee_last_name     // Keep snake_case for consistency
        } : null,
        reporter: {
          id: row.reporter_id,
          first_name: row.reporter_first_name,  // Keep snake_case for consistency
          last_name: row.reporter_last_name     // Keep snake_case for consistency
        },
        created_at: row.created_at,  // Keep snake_case for consistency
        updated_at: row.updated_at   // Keep snake_case for consistency
      }));
    } catch (error) {
      logger.error('Error getting sprint issues:', error);
      throw error;
    }
  }

  async getBurndownData() {
    try {
      // Get daily progress data for burndown chart
      const query = `
        SELECT
          DATE(tl.logged_date) as date,
          SUM(CASE WHEN i.status = 'Done' THEN i.story_points ELSE 0 END) as completed_points
        FROM time_logs tl
        INNER JOIN issues i ON tl.issue_id = i.id
        WHERE i.sprint_id = ? AND tl.logged_date BETWEEN ? AND ?
        GROUP BY DATE(tl.logged_date)
        ORDER BY date
      `;

      const startDate = this.start_date || new Date().toISOString().split('T')[0];
      const endDate = this.end_date || new Date().toISOString().split('T')[0];

      const rows = await database.query(query, [this.id, startDate, endDate]);

      // Calculate total story points for the sprint
      const totalPointsQuery = `
        SELECT SUM(story_points) as total_points
        FROM issues
        WHERE sprint_id = ?
      `;

      const totalResult = await database.query(totalPointsQuery, [this.id]);
      const totalPoints = totalResult[0].total_points || 0;

      return {
        totalPoints,
        dailyProgress: rows,
        startDate,
        endDate
      };
    } catch (error) {
      logger.error('Error getting sprint burndown data:', error);
      throw error;
    }
  }
}

module.exports = Sprint;
