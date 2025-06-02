const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class TimeLog {
  constructor(data = {}) {
    this.id = data.id || null;
    this.issue_id = data.issue_id || data.issueId || null;
    this.user_id = data.user_id || data.userId || null;
    this.hours_logged = data.hours_logged || data.hoursLogged || data.time_spent || data.timeSpent || 0;
    this.description = data.description || null;
    this.logged_date = data.logged_date || data.loggedDate || null;
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.issue_id) {
      errors.push('Issue ID is required');
    }

    if (!this.user_id) {
      errors.push('User ID is required');
    }

    if (!this.hours_logged || this.hours_logged <= 0) {
      errors.push('Hours logged must be greater than 0');
    }

    if (this.hours_logged > 24) { // 24 hours maximum
      errors.push('Hours logged cannot exceed 24 hours per log');
    }

    if (!this.logged_date) {
      errors.push('Logged date is required');
    }

    if (this.description && this.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    // Validate date format
    if (this.logged_date) {
      const date = new Date(this.logged_date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid logged date format');
      }
      
      // Don't allow future dates
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        errors.push('Cannot log time for future dates');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Time log validation failed', errors);
    }

    return true;
  }

  // Static methods
  static async create(timeLogData) {
    try {
      const timeLog = new TimeLog(timeLogData);
      timeLog.validate();

      // Check if issue exists and user has access
      const issueCheck = await database.query(
        `SELECT i.id, b.project_id 
         FROM issues i 
         INNER JOIN boards b ON i.board_id = b.id
         INNER JOIN user_projects up ON b.project_id = up.project_id 
         WHERE i.id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
        [timeLog.issue_id, timeLog.user_id]
      );

      if (issueCheck.length === 0) {
        throw new ValidationError('Issue not found or user does not have access');
      }

      const query = `
        INSERT INTO time_logs (issue_id, user_id, hours_logged, description, logged_date)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        timeLog.issue_id,
        timeLog.user_id,
        timeLog.hours_logged,
        timeLog.description ? timeLog.description.trim() : null,
        timeLog.logged_date
      ];
      
      const result = await database.query(query, values);
      timeLog.id = result.insertId;

      // Update issue time_spent
      await database.query(
        'UPDATE issues SET time_spent = time_spent + ? WHERE id = ?',
        [timeLog.time_spent, timeLog.issue_id]
      );
      
      logger.info(`Time log created: ${timeLog.id} by user ${timeLog.user_id}`);
      return await TimeLog.findById(timeLog.id);
    } catch (error) {
      logger.error('Error creating time log:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT tl.*, 
               u.first_name, u.last_name, u.email,
               i.title as issue_title
        FROM time_logs tl
        INNER JOIN users u ON tl.user_id = u.id
        INNER JOIN issues i ON tl.issue_id = i.id
        WHERE tl.id = ?
      `;
      
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        throw new NotFoundError('Time log not found');
      }
      
      const timeLogData = rows[0];
      const timeLog = new TimeLog(timeLogData);
      
      // Add additional properties
      timeLog.user = {
        id: timeLogData.user_id,
        firstName: timeLogData.first_name,
        lastName: timeLogData.last_name,
        email: timeLogData.email
      };
      
      timeLog.issue = {
        id: timeLogData.issue_id,
        title: timeLogData.issue_title
      };
      
      return timeLog;
    } catch (error) {
      logger.error('Error finding time log by ID:', error);
      throw error;
    }
  }

  static async findByIssueId(issueId, userId, options = {}) {
    try {
      const { page = 1, limit = 20, startDate, endDate } = options;
      const offset = (page - 1) * limit;

      // Check if user has access to issue
      const accessCheck = await database.query(
        `SELECT i.id 
         FROM issues i 
         INNER JOIN boards b ON i.board_id = b.id
         INNER JOIN user_projects up ON b.project_id = up.project_id 
         WHERE i.id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
        [issueId, userId]
      );

      if (accessCheck.length === 0) {
        throw new ValidationError('Access denied to issue');
      }

      let whereClause = 'WHERE tl.issue_id = ?';
      let queryParams = [issueId];

      if (startDate) {
        whereClause += ' AND tl.logged_date >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND tl.logged_date <= ?';
        queryParams.push(endDate);
      }

      const query = `
        SELECT tl.*,
               u.first_name, u.last_name, u.email
        FROM time_logs tl
        INNER JOIN users u ON tl.user_id = u.id
        ${whereClause}
        ORDER BY tl.logged_date DESC, tl.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const rows = await database.query(query, queryParams);
      
      const timeLogs = rows.map(row => {
        const timeLog = new TimeLog(row);
        timeLog.user = {
          id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email
        };
        return timeLog;
      });

      // Get total count and sum for pagination
      const countQuery = `
        SELECT COUNT(*) as total, SUM(time_spent) as total_time
        FROM time_logs tl
        ${whereClause}
      `;
      const countResult = await database.query(countQuery, queryParams);
      const { total, total_time } = countResult[0];

      return {
        timeLogs,
        totalTime: total_time || 0,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error finding time logs by issue ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    try {
      const { page = 1, limit = 20, startDate, endDate, projectId } = options;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE tl.user_id = ?';
      let queryParams = [userId];

      if (startDate) {
        whereClause += ' AND tl.logged_date >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND tl.logged_date <= ?';
        queryParams.push(endDate);
      }

      if (projectId) {
        whereClause += ' AND b.project_id = ?';
        queryParams.push(projectId);
      }

      const query = `
        SELECT tl.*,
               i.title as issue_title,
               p.name as project_name, p.key as project_key
        FROM time_logs tl
        INNER JOIN issues i ON tl.issue_id = i.id
        INNER JOIN boards b ON i.board_id = b.id
        INNER JOIN projects p ON b.project_id = p.id
        INNER JOIN user_projects up ON p.id = up.project_id
        ${whereClause} AND up.user_id = ? AND up.deleted_at IS NULL
        ORDER BY tl.logged_date DESC, tl.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      queryParams.push(userId);
      const rows = await database.query(query, queryParams);
      
      const timeLogs = rows.map(row => {
        const timeLog = new TimeLog(row);
        timeLog.issue = {
          id: row.issue_id,
          title: row.issue_title
        };
        timeLog.project = {
          id: row.project_id,
          name: row.project_name,
          key: row.project_key
        };
        return timeLog;
      });

      // Get total count and sum
      const countQuery = `
        SELECT COUNT(*) as total, SUM(tl.time_spent) as total_time
        FROM time_logs tl
        INNER JOIN issues i ON tl.issue_id = i.id
        INNER JOIN boards b ON i.board_id = b.id
        INNER JOIN projects p ON b.project_id = p.id
        INNER JOIN user_projects up ON p.id = up.project_id
        ${whereClause} AND up.user_id = ? AND up.deleted_at IS NULL
      `;
      const countParams = queryParams.slice(0, -3); // Remove user_id, limit and offset
      countParams.push(userId);
      const countResult = await database.query(countQuery, countParams);
      const { total, total_time } = countResult[0];

      return {
        timeLogs,
        totalTime: total_time || 0,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error finding time logs by user ID:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        this.validate();
        
        // Get old time spent to calculate difference
        const oldTimeLog = await TimeLog.findById(this.id);
        const timeDifference = this.time_spent - oldTimeLog.time_spent;
        
        const query = `
          UPDATE time_logs SET 
            time_spent = ?, description = ?, logged_date = ?, updated_at = NOW()
          WHERE id = ?
        `;
        
        const values = [
          this.time_spent,
          this.description ? this.description.trim() : null,
          this.logged_date,
          this.id
        ];
        
        await database.query(query, values);

        // Update issue time_spent
        await database.query(
          'UPDATE issues SET time_spent = time_spent + ? WHERE id = ?',
          [timeDifference, this.issue_id]
        );
        
        return this;
      } else {
        throw new Error('Cannot save time log without ID. Use TimeLog.create() for new time logs.');
      }
    } catch (error) {
      logger.error('Error saving time log:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Update issue time_spent before deleting
      await database.query(
        'UPDATE issues SET time_spent = time_spent - ? WHERE id = ?',
        [this.time_spent, this.issue_id]
      );

      const query = 'DELETE FROM time_logs WHERE id = ?';
      await database.query(query, [this.id]);
      
      logger.info(`Time log deleted: ${this.id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting time log:', error);
      throw error;
    }
  }

  // Check if user can edit/delete this time log
  canEdit(userId) {
    return this.user_id === userId;
  }
}

module.exports = TimeLog;
