const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class TeamMemberSkills {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || data.userId || null;
    this.project_id = data.project_id || data.projectId || null;
    this.skill_name = data.skill_name || data.skillName || null;
    this.proficiency_level = data.proficiency_level || data.proficiencyLevel || 'Beginner';
    this.years_experience = data.years_experience || data.yearsExperience || 0.0;
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.user_id || this.user_id <= 0) {
      errors.push('User ID is required and must be positive');
    }

    if (!this.project_id || this.project_id <= 0) {
      errors.push('Project ID is required and must be positive');
    }

    if (!this.skill_name || this.skill_name.trim().length === 0) {
      errors.push('Skill name is required');
    }

    if (this.skill_name && this.skill_name.length > 100) {
      errors.push('Skill name must be 100 characters or less');
    }

    const validProficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (!validProficiencyLevels.includes(this.proficiency_level)) {
      errors.push('Proficiency level must be one of: Beginner, Intermediate, Advanced, Expert');
    }

    if (this.years_experience < 0 || this.years_experience > 99.9) {
      errors.push('Years of experience must be between 0 and 99.9');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  // Static methods
  static async create(skillData) {
    try {
      const skill = new TeamMemberSkills(skillData);
      skill.validate();

      // Check if skill already exists for this user-project combination
      const existingSkill = await database.query(
        'SELECT id FROM team_member_skills WHERE user_id = ? AND project_id = ? AND skill_name = ?',
        [skill.user_id, skill.project_id, skill.skill_name]
      );

      if (existingSkill.length > 0) {
        throw new ValidationError('Skill already exists for this user and project');
      }

      const query = `
        INSERT INTO team_member_skills (
          user_id, project_id, skill_name, proficiency_level, years_experience
        ) VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        skill.user_id,
        skill.project_id,
        skill.skill_name.trim(),
        skill.proficiency_level,
        skill.years_experience
      ];

      const result = await database.query(query, values);
      skill.id = result.insertId;

      logger.info(`Team member skill created: ${skill.id} for user ${skill.user_id} in project ${skill.project_id}`);
      return await TeamMemberSkills.findById(skill.id);
    } catch (error) {
      logger.error('Error creating team member skill:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT tms.*, 
               u.first_name, u.last_name, u.email,
               p.name as project_name
        FROM team_member_skills tms
        INNER JOIN users u ON tms.user_id = u.id
        INNER JOIN projects p ON tms.project_id = p.id
        WHERE tms.id = ?
      `;

      const rows = await database.query(query, [id]);

      if (rows.length === 0) {
        throw new NotFoundError('Team member skill not found');
      }

      const skillData = rows[0];
      const skill = new TeamMemberSkills(skillData);

      // Add additional data
      skill.user_name = `${skillData.first_name} ${skillData.last_name}`;
      skill.user_email = skillData.email;
      skill.project_name = skillData.project_name;

      return skill;
    } catch (error) {
      logger.error('Error finding team member skill by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const query = `
        SELECT tms.*, 
               u.first_name, u.last_name, u.email,
               p.name as project_name
        FROM team_member_skills tms
        INNER JOIN users u ON tms.user_id = u.id
        INNER JOIN projects p ON tms.project_id = p.id
        WHERE tms.user_id = ?
        ORDER BY tms.project_id, tms.skill_name
      `;

      const rows = await database.query(query, [userId]);
      return rows.map(row => {
        const skill = new TeamMemberSkills(row);
        skill.user_name = `${row.first_name} ${row.last_name}`;
        skill.user_email = row.email;
        skill.project_name = row.project_name;
        return skill;
      });
    } catch (error) {
      logger.error('Error finding team member skills by user ID:', error);
      throw error;
    }
  }

  static async findByProjectId(projectId) {
    try {
      const query = `
        SELECT tms.*, 
               u.first_name, u.last_name, u.email,
               p.name as project_name
        FROM team_member_skills tms
        INNER JOIN users u ON tms.user_id = u.id
        INNER JOIN projects p ON tms.project_id = p.id
        WHERE tms.project_id = ?
        ORDER BY u.first_name, u.last_name, tms.skill_name
      `;

      const rows = await database.query(query, [projectId]);
      return rows.map(row => {
        const skill = new TeamMemberSkills(row);
        skill.user_name = `${row.first_name} ${row.last_name}`;
        skill.user_email = row.email;
        skill.project_name = row.project_name;
        return skill;
      });
    } catch (error) {
      logger.error('Error finding team member skills by project ID:', error);
      throw error;
    }
  }

  static async findByUserAndProject(userId, projectId) {
    try {
      const query = `
        SELECT tms.*, 
               u.first_name, u.last_name, u.email,
               p.name as project_name
        FROM team_member_skills tms
        INNER JOIN users u ON tms.user_id = u.id
        INNER JOIN projects p ON tms.project_id = p.id
        WHERE tms.user_id = ? AND tms.project_id = ?
        ORDER BY tms.skill_name
      `;

      const rows = await database.query(query, [userId, projectId]);
      return rows.map(row => {
        const skill = new TeamMemberSkills(row);
        skill.user_name = `${row.first_name} ${row.last_name}`;
        skill.user_email = row.email;
        skill.project_name = row.project_name;
        return skill;
      });
    } catch (error) {
      logger.error('Error finding team member skills by user and project:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        this.validate();

        const query = `
          UPDATE team_member_skills SET
            skill_name = ?, proficiency_level = ?, years_experience = ?, updated_at = NOW()
          WHERE id = ?
        `;

        const values = [
          this.skill_name.trim(),
          this.proficiency_level,
          this.years_experience,
          this.id
        ];

        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save skill without ID. Use TeamMemberSkills.create() for new skills.');
      }
    } catch (error) {
      logger.error('Error saving team member skill:', error);
      throw error;
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete skill without ID');
      }

      const query = 'DELETE FROM team_member_skills WHERE id = ?';
      await database.query(query, [this.id]);

      logger.info(`Team member skill deleted: ${this.id}`);
      return true;
    } catch (error) {
      logger.error('Error deleting team member skill:', error);
      throw error;
    }
  }

  // Get skill level as number for calculations
  getProficiencyScore() {
    const scores = {
      'Beginner': 1,
      'Intermediate': 2,
      'Advanced': 3,
      'Expert': 4
    };
    return scores[this.proficiency_level] || 1;
  }

  // Get skill summary for display
  getSkillSummary() {
    return {
      id: this.id,
      skill_name: this.skill_name,
      proficiency_level: this.proficiency_level,
      proficiency_score: this.getProficiencyScore(),
      years_experience: this.years_experience,
      user_name: this.user_name,
      project_name: this.project_name
    };
  }
}

module.exports = TeamMemberSkills;
