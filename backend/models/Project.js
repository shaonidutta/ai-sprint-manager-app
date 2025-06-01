const database = require('../config/database');
const logger = require('../config/logger');

class Project {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.project_key = data.project_key;
    this.owner_id = data.owner_id;
    this.ai_requests_count = data.ai_requests_count || 0;
    this.ai_requests_reset_date = data.ai_requests_reset_date;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Static methods for database operations
  static async findById(id) {
    try {
      const query = 'SELECT * FROM projects WHERE id = ? AND is_active = true';
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Project(rows[0]);
    } catch (error) {
      logger.error('Error finding project by ID:', error);
      throw error;
    }
  }

  static async findByProjectKey(projectKey) {
    try {
      const query = 'SELECT * FROM projects WHERE project_key = ? AND is_active = true';
      const rows = await database.query(query, [projectKey]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Project(rows[0]);
    } catch (error) {
      logger.error('Error finding project by key:', error);
      throw error;
    }
  }

  static async findByOwnerId(ownerId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM projects 
        WHERE owner_id = ? AND is_active = true 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const rows = await database.query(query, [ownerId, limit, offset]);
      
      return rows.map(row => new Project(row));
    } catch (error) {
      logger.error('Error finding projects by owner ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT p.* FROM projects p
        INNER JOIN user_projects up ON p.id = up.project_id
        WHERE up.user_id = ? AND p.is_active = true AND up.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const rows = await database.query(query, [userId, limit, offset]);
      
      return rows.map(row => new Project(row));
    } catch (error) {
      logger.error('Error finding projects by user ID:', error);
      throw error;
    }
  }

  static async create(projectData) {
    try {
      // Generate unique project key
      const projectKey = await Project.generateUniqueProjectKey(projectData.name);
      
      const query = `
        INSERT INTO projects (
          name, description, project_key, owner_id, 
          ai_requests_reset_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, CURDATE(), NOW(), NOW())
      `;
      
      const values = [
        projectData.name,
        projectData.description || null,
        projectKey,
        projectData.owner_id
      ];
      
      const result = await database.query(query, values);
      
      // Add owner to user_projects table as Admin
      await database.query(`
        INSERT INTO user_projects (user_id, project_id, role, created_at)
        VALUES (?, ?, 'Admin', NOW())
      `, [projectData.owner_id, result.insertId]);

      // Create default board for the project
      const Board = require('./Board');
      await Board.createDefaultBoard(result.insertId, projectData.owner_id);

      // Return the created project
      return await Project.findById(result.insertId);
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  }

  static async generateUniqueProjectKey(projectName) {
    try {
      // Generate base key from project name
      let baseKey = projectName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);
      
      if (baseKey.length < 2) {
        baseKey = 'PROJ';
      }
      
      // Check if key exists and add number if needed
      let projectKey = baseKey;
      let counter = 1;
      
      while (await Project.findByProjectKey(projectKey)) {
        projectKey = baseKey + counter;
        counter++;
        
        // Ensure key doesn't exceed 10 characters
        if (projectKey.length > 10) {
          baseKey = baseKey.substring(0, 8);
          projectKey = baseKey + counter;
        }
      }
      
      return projectKey;
    } catch (error) {
      logger.error('Error generating unique project key:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        // Update existing project
        const query = `
          UPDATE projects SET 
            name = ?, description = ?, is_active = ?, updated_at = NOW()
          WHERE id = ?
        `;
        
        const values = [
          this.name,
          this.description,
          this.is_active,
          this.id
        ];
        
        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save project without ID. Use Project.create() for new projects.');
      }
    } catch (error) {
      logger.error('Error saving project:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Soft delete
      const query = 'UPDATE projects SET is_active = false, updated_at = NOW() WHERE id = ?';
      await database.query(query, [this.id]);
      
      this.is_active = false;
      return this;
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  }

  async getTeamMembers() {
    try {
      const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, 
               up.role, up.created_at as joined_at
        FROM users u
        INNER JOIN user_projects up ON u.id = up.user_id
        WHERE up.project_id = ? AND u.is_active = true AND up.deleted_at IS NULL
        ORDER BY up.created_at ASC
      `;
      
      const rows = await database.query(query, [this.id]);
      return rows;
    } catch (error) {
      logger.error('Error getting team members:', error);
      throw error;
    }
  }

  async addTeamMember(userId, role = 'Developer') {
    try {
      // Check if user is already a member
      const existingQuery = `
        SELECT id FROM user_projects 
        WHERE user_id = ? AND project_id = ? AND deleted_at IS NULL
      `;
      const existing = await database.query(existingQuery, [userId, this.id]);
      
      if (existing.length > 0) {
        throw new Error('User is already a member of this project');
      }
      
      // Add user to project
      const query = `
        INSERT INTO user_projects (user_id, project_id, role, created_at)
        VALUES (?, ?, ?, NOW())
      `;
      
      await database.query(query, [userId, this.id, role]);
      return true;
    } catch (error) {
      logger.error('Error adding team member:', error);
      throw error;
    }
  }

  async removeTeamMember(userId) {
    try {
      // Don't allow removing the owner
      if (userId === this.owner_id) {
        throw new Error('Cannot remove project owner from team');
      }
      
      // Soft delete the relationship
      const query = `
        UPDATE user_projects 
        SET deleted_at = NOW() 
        WHERE user_id = ? AND project_id = ? AND deleted_at IS NULL
      `;
      
      await database.query(query, [userId, this.id]);
      return true;
    } catch (error) {
      logger.error('Error removing team member:', error);
      throw error;
    }
  }

  async updateTeamMemberRole(userId, newRole) {
    try {
      // Don't allow changing owner role
      if (userId === this.owner_id) {
        throw new Error('Cannot change project owner role');
      }
      
      const query = `
        UPDATE user_projects 
        SET role = ? 
        WHERE user_id = ? AND project_id = ? AND deleted_at IS NULL
      `;
      
      await database.query(query, [newRole, userId, this.id]);
      return true;
    } catch (error) {
      logger.error('Error updating team member role:', error);
      throw error;
    }
  }

  async incrementAIRequestCount() {
    try {
      const query = `
        UPDATE projects 
        SET ai_requests_count = ai_requests_count + 1, updated_at = NOW()
        WHERE id = ?
      `;
      
      await database.query(query, [this.id]);
      this.ai_requests_count += 1;
      return this;
    } catch (error) {
      logger.error('Error incrementing AI request count:', error);
      throw error;
    }
  }

  async resetAIRequestCount() {
    try {
      const query = `
        UPDATE projects 
        SET ai_requests_count = 0, ai_requests_reset_date = CURDATE(), updated_at = NOW()
        WHERE id = ?
      `;
      
      await database.query(query, [this.id]);
      this.ai_requests_count = 0;
      this.ai_requests_reset_date = new Date();
      return this;
    } catch (error) {
      logger.error('Error resetting AI request count:', error);
      throw error;
    }
  }

  // Convert to JSON (exclude sensitive data if needed)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      project_key: this.project_key,
      owner_id: this.owner_id,
      ai_requests_count: this.ai_requests_count,
      ai_requests_reset_date: this.ai_requests_reset_date,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Check if user has access to project
  async hasUserAccess(userId) {
    try {
      const query = `
        SELECT id FROM user_projects 
        WHERE user_id = ? AND project_id = ? AND deleted_at IS NULL
      `;
      const rows = await database.query(query, [userId, this.id]);
      return rows.length > 0;
    } catch (error) {
      logger.error('Error checking user access:', error);
      throw error;
    }
  }

  // Get user role in project
  async getUserRole(userId) {
    try {
      const query = `
        SELECT role FROM user_projects 
        WHERE user_id = ? AND project_id = ? AND deleted_at IS NULL
      `;
      const rows = await database.query(query, [userId, this.id]);
      return rows.length > 0 ? rows[0].role : null;
    } catch (error) {
      logger.error('Error getting user role:', error);
      throw error;
    }
  }
}

module.exports = Project;
