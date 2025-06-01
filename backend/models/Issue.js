const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class Issue {
  constructor(data = {}) {
    this.id = data.id || null;
    this.board_id = data.board_id || data.boardId || null;
    this.sprint_id = data.sprint_id || data.sprintId || null;
    this.title = data.title || null;
    this.description = data.description || null;
    this.issue_type = data.issue_type || data.issueType || 'Story';
    this.status = data.status || 'To Do';
    this.priority = data.priority || 'P3';
    this.story_points = data.story_points || data.storyPoints || null;
    this.original_estimate = data.original_estimate || data.originalEstimate || null;
    this.time_spent = data.time_spent || data.timeSpent || 0;
    this.time_remaining = data.time_remaining || data.timeRemaining || null;
    this.assignee_id = data.assignee_id || data.assigneeId || null;
    this.reporter_id = data.reporter_id || data.reporterId || null;
    this.blocked_reason = data.blocked_reason || data.blockedReason || null;
    this.issue_order = data.issue_order || data.issueOrder || 0;
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.board_id) {
      errors.push('Board ID is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Issue title is required');
    }

    if (this.title && this.title.length > 500) {
      errors.push('Issue title must be less than 500 characters');
    }

    if (this.description && this.description.length > 5000) {
      errors.push('Issue description must be less than 5000 characters');
    }

    const validIssueTypes = ['Story', 'Bug', 'Task', 'Epic'];
    if (!validIssueTypes.includes(this.issue_type)) {
      errors.push('Invalid issue type. Must be one of: ' + validIssueTypes.join(', '));
    }

    const validStatuses = ['To Do', 'In Progress', 'Done', 'Blocked'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid status. Must be one of: ' + validStatuses.join(', '));
    }

    const validPriorities = ['P1', 'P2', 'P3', 'P4'];
    if (!validPriorities.includes(this.priority)) {
      errors.push('Invalid priority. Must be one of: ' + validPriorities.join(', '));
    }

    if (this.story_points && (this.story_points < 0 || this.story_points > 100)) {
      errors.push('Story points must be between 0 and 100');
    }

    if (this.original_estimate && this.original_estimate < 0) {
      errors.push('Original estimate must be positive');
    }

    if (this.time_spent < 0) {
      errors.push('Time spent must be positive');
    }

    if (this.time_remaining && this.time_remaining < 0) {
      errors.push('Time remaining must be positive');
    }

    if (!this.reporter_id) {
      errors.push('Reporter ID is required');
    }

    if (this.status === 'Blocked' && (!this.blocked_reason || this.blocked_reason.trim().length === 0)) {
      errors.push('Blocked reason is required when status is Blocked');
    }

    if (errors.length > 0) {
      throw new ValidationError('Issue validation failed', errors);
    }

    return true;
  }

  // Static methods
  static async create(issueData) {
    try {
      const issue = new Issue(issueData);
      issue.validate();

      // Check if board exists and user has access
      const boardCheck = await database.query(
        `SELECT b.id, b.project_id, up.role 
         FROM boards b 
         INNER JOIN projects p ON b.project_id = p.id
         INNER JOIN user_projects up ON p.id = up.project_id 
         WHERE b.id = ? AND up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL`,
        [issue.board_id, issue.reporter_id]
      );

      if (boardCheck.length === 0) {
        throw new ValidationError('Board not found or user does not have access');
      }

      // Check if assignee exists and has access to project (if assigned)
      if (issue.assignee_id) {
        const assigneeCheck = await database.query(
          `SELECT up.user_id 
           FROM user_projects up 
           WHERE up.project_id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
          [boardCheck[0].project_id, issue.assignee_id]
        );

        if (assigneeCheck.length === 0) {
          throw new ValidationError('Assignee does not have access to this project');
        }
      }

      // Check if sprint exists and belongs to the same board (if assigned)
      if (issue.sprint_id) {
        const sprintCheck = await database.query(
          'SELECT id FROM sprints WHERE id = ? AND board_id = ?',
          [issue.sprint_id, issue.board_id]
        );

        if (sprintCheck.length === 0) {
          throw new ValidationError('Sprint not found or does not belong to this board');
        }
      }

      // Get the next order for this status
      const orderQuery = `
        SELECT COALESCE(MAX(issue_order), 0) + 1 as next_order
        FROM issues
        WHERE board_id = ? AND status = ?
      `;
      const orderResult = await database.query(orderQuery, [issue.board_id, issue.status]);
      issue.issue_order = orderResult[0].next_order;

      const query = `
        INSERT INTO issues (
          board_id, sprint_id, title, description, issue_type, status, priority,
          story_points, original_estimate, time_spent, time_remaining,
          assignee_id, reporter_id, blocked_reason, issue_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        issue.board_id,
        issue.sprint_id,
        issue.title.trim(),
        issue.description ? issue.description.trim() : null,
        issue.issue_type,
        issue.status,
        issue.priority,
        issue.story_points,
        issue.original_estimate,
        issue.time_spent,
        issue.time_remaining,
        issue.assignee_id,
        issue.reporter_id,
        issue.blocked_reason ? issue.blocked_reason.trim() : null,
        issue.issue_order
      ];
      
      const result = await database.query(query, values);
      issue.id = result.insertId;
      
      logger.info(`Issue created: ${issue.id} by user ${issue.reporter_id}`);
      return await Issue.findById(issue.id);
    } catch (error) {
      logger.error('Error creating issue:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT i.*, 
               b.name as board_name, b.project_id,
               p.name as project_name, p.project_key,
               assignee.first_name as assignee_first_name, assignee.last_name as assignee_last_name,
               assignee.email as assignee_email,
               reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name,
               reporter.email as reporter_email,
               s.name as sprint_name, s.status as sprint_status
        FROM issues i
        INNER JOIN boards b ON i.board_id = b.id
        INNER JOIN projects p ON b.project_id = p.id
        LEFT JOIN users assignee ON i.assignee_id = assignee.id
        INNER JOIN users reporter ON i.reporter_id = reporter.id
        LEFT JOIN sprints s ON i.sprint_id = s.id
        WHERE i.id = ?
      `;
      
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        throw new NotFoundError('Issue not found');
      }
      
      const issueData = rows[0];
      const issue = new Issue(issueData);
      
      // Add additional properties
      issue.board = {
        id: issueData.board_id,
        name: issueData.board_name,
        projectId: issueData.project_id
      };
      
      issue.project = {
        id: issueData.project_id,
        name: issueData.project_name,
        key: issueData.project_key
      };
      
      issue.assignee = issueData.assignee_id ? {
        id: issueData.assignee_id,
        firstName: issueData.assignee_first_name,
        lastName: issueData.assignee_last_name,
        email: issueData.assignee_email
      } : null;
      
      issue.reporter = {
        id: issueData.reporter_id,
        firstName: issueData.reporter_first_name,
        lastName: issueData.reporter_last_name,
        email: issueData.reporter_email
      };
      
      issue.sprint = issueData.sprint_id ? {
        id: issueData.sprint_id,
        name: issueData.sprint_name,
        status: issueData.sprint_status
      } : null;
      
      return issue;
    } catch (error) {
      logger.error('Error finding issue by ID:', error);
      throw error;
    }
  }

  static async findByBoardId(boardId, userId, options = {}) {
    try {
      const { page = 1, limit = 50, status, assigneeId, sprintId, search = '', issueType, priority } = options;
      const offset = (page - 1) * limit;

      // Check if user has access to board
      const accessCheck = await database.query(
        `SELECT b.project_id
         FROM boards b
         INNER JOIN user_projects up ON b.project_id = up.project_id
         WHERE b.id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
        [boardId, userId]
      );

      if (accessCheck.length === 0) {
        throw new ValidationError('Access denied to board');
      }

      let whereClause = 'WHERE i.board_id = ?';
      let queryParams = [boardId];

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

      if (issueType) {
        whereClause += ' AND i.issue_type = ?';
        queryParams.push(issueType);
      }

      if (priority) {
        whereClause += ' AND i.priority = ?';
        queryParams.push(priority);
      }

      if (search) {
        whereClause += ' AND (i.title LIKE ? OR i.description LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      const query = `
        SELECT i.*,
               assignee.first_name as assignee_first_name, assignee.last_name as assignee_last_name,
               reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name,
               s.name as sprint_name
        FROM issues i
        LEFT JOIN users assignee ON i.assignee_id = assignee.id
        INNER JOIN users reporter ON i.reporter_id = reporter.id
        LEFT JOIN sprints s ON i.sprint_id = s.id
        ${whereClause}
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);
      const rows = await database.query(query, queryParams);

      const issues = rows.map(row => {
        const issue = new Issue(row);
        issue.assignee = row.assignee_id ? {
          id: row.assignee_id,
          firstName: row.assignee_first_name,
          lastName: row.assignee_last_name
        } : null;
        issue.reporter = {
          id: row.reporter_id,
          firstName: row.reporter_first_name,
          lastName: row.reporter_last_name
        };
        issue.sprint = row.sprint_id ? {
          id: row.sprint_id,
          name: row.sprint_name
        } : null;
        return issue;
      });

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM issues i
        ${whereClause}
      `;
      const countParams = queryParams.slice(0, -2); // Remove limit and offset
      const countResult = await database.query(countQuery, countParams);
      const total = countResult[0].total;

      return {
        issues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error finding issues by board ID:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        this.validate();

        const query = `
          UPDATE issues SET
            title = ?, description = ?, issue_type = ?, status = ?, priority = ?,
            story_points = ?, original_estimate = ?, time_spent = ?, time_remaining = ?,
            assignee_id = ?, blocked_reason = ?, updated_at = NOW()
          WHERE id = ?
        `;

        const values = [
          this.title.trim(),
          this.description ? this.description.trim() : null,
          this.issue_type,
          this.status,
          this.priority,
          this.story_points,
          this.original_estimate,
          this.time_spent,
          this.time_remaining,
          this.assignee_id,
          this.blocked_reason ? this.blocked_reason.trim() : null,
          this.id
        ];

        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save issue without ID. Use Issue.create() for new issues.');
      }
    } catch (error) {
      logger.error('Error saving issue:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Delete related comments first
      await database.query('DELETE FROM issue_comments WHERE issue_id = ?', [this.id]);

      // Delete related time logs
      await database.query('DELETE FROM time_logs WHERE issue_id = ?', [this.id]);

      // Delete the issue
      const query = 'DELETE FROM issues WHERE id = ?';
      await database.query(query, [this.id]);

      logger.info(`Issue deleted: ${this.id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting issue:', error);
      throw error;
    }
  }

  async updateStatus(newStatus, userId) {
    try {
      const validStatuses = ['To Do', 'In Progress', 'Done', 'Blocked'];
      if (!validStatuses.includes(newStatus)) {
        throw new ValidationError('Invalid status');
      }

      this.status = newStatus;

      // Clear blocked reason if status is not Blocked
      if (newStatus !== 'Blocked') {
        this.blocked_reason = null;
      }

      await this.save();

      logger.info(`Issue ${this.id} status updated to ${newStatus} by user ${userId}`);
      return this;
    } catch (error) {
      logger.error('Error updating issue status:', error);
      throw error;
    }
  }
}

module.exports = Issue;
