const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class TeamMemberCapacity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || data.userId || null;
    this.sprint_id = data.sprint_id || data.sprintId || null;
    this.available_hours = data.available_hours || data.availableHours || 40.0;
    this.capacity_percentage = data.capacity_percentage || data.capacityPercentage || 100.0;
    this.story_points_capacity = data.story_points_capacity || data.storyPointsCapacity || 10;
    this.skill_tags = data.skill_tags || data.skillTags || null;
    this.notes = data.notes || null;
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.user_id) {
      errors.push('User ID is required');
    }

    if (!this.sprint_id) {
      errors.push('Sprint ID is required');
    }

    if (this.available_hours < 0 || this.available_hours > 168) {
      errors.push('Available hours must be between 0 and 168 (hours per week)');
    }

    if (this.capacity_percentage < 0 || this.capacity_percentage > 100) {
      errors.push('Capacity percentage must be between 0 and 100');
    }

    if (this.story_points_capacity < 0) {
      errors.push('Story points capacity must be non-negative');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  // Static methods
  static async create(capacityData) {
    try {
      const capacity = new TeamMemberCapacity(capacityData);
      capacity.validate();

      // Check if capacity already exists for this user-sprint combination
      const existingCapacity = await database.query(
        'SELECT id FROM team_member_capacity WHERE user_id = ? AND sprint_id = ?',
        [capacity.user_id, capacity.sprint_id]
      );

      if (existingCapacity.length > 0) {
        throw new ValidationError('Capacity already exists for this user and sprint');
      }

      const query = `
        INSERT INTO team_member_capacity (
          user_id, sprint_id, available_hours, capacity_percentage, 
          story_points_capacity, skill_tags, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const skillTagsJson = capacity.skill_tags ? JSON.stringify(capacity.skill_tags) : null;

      const values = [
        capacity.user_id,
        capacity.sprint_id,
        capacity.available_hours,
        capacity.capacity_percentage,
        capacity.story_points_capacity,
        skillTagsJson,
        capacity.notes ? capacity.notes.trim() : null
      ];

      const result = await database.query(query, values);
      capacity.id = result.insertId;

      logger.info(`Team member capacity created: ${capacity.id} for user ${capacity.user_id} in sprint ${capacity.sprint_id}`);
      return await TeamMemberCapacity.findById(capacity.id);
    } catch (error) {
      logger.error('Error creating team member capacity:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT tmc.*, 
               u.first_name, u.last_name, u.email,
               s.name as sprint_name, s.status as sprint_status,
               p.name as project_name, p.id as project_id
        FROM team_member_capacity tmc
        INNER JOIN users u ON tmc.user_id = u.id
        INNER JOIN sprints s ON tmc.sprint_id = s.id
        INNER JOIN boards b ON s.board_id = b.id
        INNER JOIN projects p ON b.project_id = p.id
        WHERE tmc.id = ?
      `;

      const rows = await database.query(query, [id]);

      if (rows.length === 0) {
        throw new NotFoundError('Team member capacity not found');
      }

      const capacityData = rows[0];
      const capacity = new TeamMemberCapacity(capacityData);

      // Parse JSON fields
      if (capacityData.skill_tags) {
        capacity.skill_tags = JSON.parse(capacityData.skill_tags);
      }

      // Add additional properties
      capacity.user = {
        id: capacityData.user_id,
        firstName: capacityData.first_name,
        lastName: capacityData.last_name,
        email: capacityData.email
      };

      capacity.sprint = {
        id: capacityData.sprint_id,
        name: capacityData.sprint_name,
        status: capacityData.sprint_status
      };

      capacity.project = {
        id: capacityData.project_id,
        name: capacityData.project_name
      };

      return capacity;
    } catch (error) {
      logger.error('Error finding team member capacity by ID:', error);
      throw error;
    }
  }

  static async findBySprintId(sprintId) {
    try {
      const query = `
        SELECT tmc.*, 
               u.first_name, u.last_name, u.email,
               s.name as sprint_name, s.status as sprint_status
        FROM team_member_capacity tmc
        INNER JOIN users u ON tmc.user_id = u.id
        INNER JOIN sprints s ON tmc.sprint_id = s.id
        WHERE tmc.sprint_id = ?
        ORDER BY u.first_name, u.last_name
      `;

      const rows = await database.query(query, [sprintId]);

      return rows.map(row => {
        const capacity = new TeamMemberCapacity(row);
        
        // Parse JSON fields
        if (row.skill_tags) {
          capacity.skill_tags = JSON.parse(row.skill_tags);
        }

        // Add user info
        capacity.user = {
          id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email
        };

        capacity.sprint = {
          id: row.sprint_id,
          name: row.sprint_name,
          status: row.sprint_status
        };

        return capacity;
      });
    } catch (error) {
      logger.error('Error finding team member capacities by sprint ID:', error);
      throw error;
    }
  }

  static async findByUserAndSprint(userId, sprintId) {
    try {
      const query = `
        SELECT tmc.*, 
               u.first_name, u.last_name, u.email,
               s.name as sprint_name, s.status as sprint_status
        FROM team_member_capacity tmc
        INNER JOIN users u ON tmc.user_id = u.id
        INNER JOIN sprints s ON tmc.sprint_id = s.id
        WHERE tmc.user_id = ? AND tmc.sprint_id = ?
      `;

      const rows = await database.query(query, [userId, sprintId]);

      if (rows.length === 0) {
        return null;
      }

      const capacityData = rows[0];
      const capacity = new TeamMemberCapacity(capacityData);

      // Parse JSON fields
      if (capacityData.skill_tags) {
        capacity.skill_tags = JSON.parse(capacityData.skill_tags);
      }

      // Add additional properties
      capacity.user = {
        id: capacityData.user_id,
        firstName: capacityData.first_name,
        lastName: capacityData.last_name,
        email: capacityData.email
      };

      capacity.sprint = {
        id: capacityData.sprint_id,
        name: capacityData.sprint_name,
        status: capacityData.sprint_status
      };

      return capacity;
    } catch (error) {
      logger.error('Error finding team member capacity by user and sprint:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        this.validate();

        const skillTagsJson = this.skill_tags ? JSON.stringify(this.skill_tags) : null;

        const query = `
          UPDATE team_member_capacity SET
            available_hours = ?, capacity_percentage = ?, story_points_capacity = ?,
            skill_tags = ?, notes = ?, updated_at = NOW()
          WHERE id = ?
        `;

        const values = [
          this.available_hours,
          this.capacity_percentage,
          this.story_points_capacity,
          skillTagsJson,
          this.notes ? this.notes.trim() : null,
          this.id
        ];

        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save capacity without ID. Use TeamMemberCapacity.create() for new capacities.');
      }
    } catch (error) {
      logger.error('Error saving team member capacity:', error);
      throw error;
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete capacity without ID');
      }

      await database.query('DELETE FROM team_member_capacity WHERE id = ?', [this.id]);
      logger.info(`Team member capacity deleted: ${this.id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting team member capacity:', error);
      throw error;
    }
  }

  // Calculate actual workload based on assigned issues
  async calculateActualWorkload() {
    try {
      const query = `
        SELECT COALESCE(SUM(i.story_points), 0) as assigned_points
        FROM issues i
        WHERE i.assignee_id = ? AND i.sprint_id = ? AND i.status != 'Done'
      `;

      const result = await database.query(query, [this.user_id, this.sprint_id]);
      const assignedPoints = result[0].assigned_points;

      const utilizationPercentage = this.story_points_capacity > 0 
        ? Math.round((assignedPoints / this.story_points_capacity) * 100)
        : 0;

      return {
        assigned_points: assignedPoints,
        capacity_points: this.story_points_capacity,
        utilization_percentage: utilizationPercentage,
        is_overloaded: utilizationPercentage > 100,
        available_points: Math.max(0, this.story_points_capacity - assignedPoints)
      };
    } catch (error) {
      logger.error('Error calculating actual workload:', error);
      throw error;
    }
  }
}

module.exports = TeamMemberCapacity;
