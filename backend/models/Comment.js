const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class Comment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.issue_id = data.issue_id || data.issueId || null;
    this.user_id = data.user_id || data.userId || null;
    this.content = data.content || null;
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

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Comment content is required');
    }

    if (this.content && this.content.length > 2000) {
      errors.push('Comment content must be less than 2000 characters');
    }

    if (errors.length > 0) {
      throw new ValidationError('Comment validation failed', errors);
    }

    return true;
  }

  // Static methods
  static async create(commentData) {
    try {
      const comment = new Comment(commentData);
      comment.validate();

      // Check if issue exists and user has access
      const issueCheck = await database.query(
        `SELECT i.id, b.project_id 
         FROM issues i 
         INNER JOIN boards b ON i.board_id = b.id
         INNER JOIN user_projects up ON b.project_id = up.project_id 
         WHERE i.id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
        [comment.issue_id, comment.user_id]
      );

      if (issueCheck.length === 0) {
        throw new ValidationError('Issue not found or user does not have access');
      }

      const query = `
        INSERT INTO issue_comments (issue_id, user_id, content) 
        VALUES (?, ?, ?)
      `;
      
      const values = [
        comment.issue_id,
        comment.user_id,
        comment.content.trim()
      ];
      
      const result = await database.query(query, values);
      comment.id = result.insertId;
      
      logger.info(`Comment created: ${comment.id} by user ${comment.user_id}`);
      return await Comment.findById(comment.id);
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT c.*, 
               u.first_name, u.last_name, u.email, u.avatar_url,
               i.title as issue_title
        FROM issue_comments c
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN issues i ON c.issue_id = i.id
        WHERE c.id = ?
      `;
      
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        throw new NotFoundError('Comment not found');
      }
      
      const commentData = rows[0];
      const comment = new Comment(commentData);
      
      // Add additional properties
      comment.user = {
        id: commentData.user_id,
        firstName: commentData.first_name,
        lastName: commentData.last_name,
        email: commentData.email,
        avatarUrl: commentData.avatar_url
      };
      
      comment.issue = {
        id: commentData.issue_id,
        title: commentData.issue_title
      };
      
      return comment;
    } catch (error) {
      logger.error('Error finding comment by ID:', error);
      throw error;
    }
  }

  static async findByIssueId(issueId, userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
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

      const query = `
        SELECT c.*,
               u.first_name, u.last_name, u.email, u.avatar_url
        FROM issue_comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.issue_id = ?
        ORDER BY c.created_at ASC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const rows = await database.query(query, [issueId]);
      
      const comments = rows.map(row => {
        const comment = new Comment(row);
        comment.user = {
          id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          avatarUrl: row.avatar_url
        };
        return comment;
      });

      // Get total count for pagination
      const countQuery = 'SELECT COUNT(*) as total FROM issue_comments WHERE issue_id = ?';
      const countResult = await database.query(countQuery, [issueId]);
      const total = countResult[0].total;

      return {
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error finding comments by issue ID:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        this.validate();
        
        const query = `
          UPDATE issue_comments SET 
            content = ?, updated_at = NOW()
          WHERE id = ?
        `;
        
        const values = [
          this.content.trim(),
          this.id
        ];
        
        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save comment without ID. Use Comment.create() for new comments.');
      }
    } catch (error) {
      logger.error('Error saving comment:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const query = 'DELETE FROM issue_comments WHERE id = ?';
      await database.query(query, [this.id]);
      
      logger.info(`Comment deleted: ${this.id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Check if user can edit/delete this comment
  canEdit(userId) {
    return this.user_id === userId;
  }
}

module.exports = Comment;
