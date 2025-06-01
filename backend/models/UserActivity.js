const database = require('../config/database');
const logger = require('../config/logger');

class UserActivity {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.action = data.action;
    this.resource_type = data.resource_type;
    this.resource_id = data.resource_id;
    this.details = data.details;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.created_at = data.created_at;
  }

  // Static methods for database operations
  static async create(activityData) {
    try {
      const query = `
        INSERT INTO user_activities (
          user_id, action, resource_type, resource_id, 
          details, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const values = [
        activityData.user_id,
        activityData.action,
        activityData.resource_type || null,
        activityData.resource_id || null,
        JSON.stringify(activityData.details || {}),
        activityData.ip_address || null,
        activityData.user_agent || null
      ];
      
      const result = await database.query(query, values);
      return result.insertId;
    } catch (error) {
      logger.error('Error creating user activity:', error);
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, action = null, resource_type = null } = options;
      
      let query = `
        SELECT ua.*, u.first_name, u.last_name, u.email
        FROM user_activities ua
        LEFT JOIN users u ON ua.user_id = u.id
        WHERE ua.user_id = ?
      `;
      
      const params = [userId];
      
      if (action) {
        query += ' AND ua.action = ?';
        params.push(action);
      }
      
      if (resource_type) {
        query += ' AND ua.resource_type = ?';
        params.push(resource_type);
      }
      
      query += ` ORDER BY ua.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

      const rows = await database.query(query, params);
      
      return rows.map(row => {
        const activity = new UserActivity(row);
        // Parse details JSON
        try {
          activity.details = JSON.parse(row.details || '{}');
        } catch (e) {
          activity.details = {};
        }
        return activity;
      });
    } catch (error) {
      logger.error('Error finding user activities:', error);
      throw error;
    }
  }

  static async findByProjectId(projectId, options = {}) {
    try {
      const { limit = 100, offset = 0, action = null } = options;
      
      let query = `
        SELECT ua.*, u.first_name, u.last_name, u.email
        FROM user_activities ua
        LEFT JOIN users u ON ua.user_id = u.id
        WHERE (ua.resource_type = 'project' AND ua.resource_id = ?)
           OR (ua.resource_type IN ('board', 'issue', 'sprint') 
               AND ua.resource_id IN (
                 SELECT b.id FROM boards b WHERE b.project_id = ?
                 UNION
                 SELECT i.id FROM issues i 
                 JOIN boards b ON i.board_id = b.id 
                 WHERE b.project_id = ?
                 UNION
                 SELECT s.id FROM sprints s 
                 JOIN boards b ON s.board_id = b.id 
                 WHERE b.project_id = ?
               ))
      `;
      
      const params = [projectId, projectId, projectId, projectId];
      
      if (action) {
        query += ' AND ua.action = ?';
        params.push(action);
      }
      
      query += ` ORDER BY ua.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

      const rows = await database.query(query, params);
      
      return rows.map(row => {
        const activity = new UserActivity(row);
        try {
          activity.details = JSON.parse(row.details || '{}');
        } catch (e) {
          activity.details = {};
        }
        return activity;
      });
    } catch (error) {
      logger.error('Error finding project activities:', error);
      throw error;
    }
  }

  static async getActivityStats(userId, days = 30) {
    try {
      const query = `
        SELECT 
          action,
          resource_type,
          COUNT(*) as count,
          DATE(created_at) as activity_date
        FROM user_activities 
        WHERE user_id = ? 
          AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY action, resource_type, DATE(created_at)
        ORDER BY activity_date DESC
      `;
      
      const rows = await database.query(query, [userId, days]);
      return rows;
    } catch (error) {
      logger.error('Error getting activity stats:', error);
      throw error;
    }
  }

  static async cleanupOldActivities(daysToKeep = 90) {
    try {
      const query = `
        DELETE FROM user_activities 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      
      const result = await database.query(query, [daysToKeep]);
      logger.info(`Cleaned up ${result.affectedRows} old activity records`);
      return result.affectedRows;
    } catch (error) {
      logger.error('Error cleaning up old activities:', error);
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      action: this.action,
      resource_type: this.resource_type,
      resource_id: this.resource_id,
      details: this.details,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      created_at: this.created_at
    };
  }
}

module.exports = UserActivity;
