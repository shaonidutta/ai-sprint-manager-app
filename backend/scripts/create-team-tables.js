require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');

const createTeamTables = async () => {
  try {
    await database.connect();
    logger.info('Connected to database');

    // Create team_member_capacity table
    const capacitySQL = `
      CREATE TABLE IF NOT EXISTS team_member_capacity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        sprint_id INT NOT NULL,
        available_hours DECIMAL(5,2) DEFAULT 40.0,
        capacity_percentage DECIMAL(5,2) DEFAULT 100.0,
        story_points_capacity INT DEFAULT 10,
        skill_tags JSON,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_sprint (user_id, sprint_id),
        INDEX idx_user_id (user_id),
        INDEX idx_sprint_id (sprint_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await database.query(capacitySQL);
    console.log('✅ team_member_capacity table created successfully');

    // Create team_member_skills table
    const skillsSQL = `
      CREATE TABLE IF NOT EXISTS team_member_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        project_id INT NOT NULL,
        skill_name VARCHAR(100) NOT NULL,
        proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
        years_experience DECIMAL(3,1) DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_project_skill (user_id, project_id, skill_name),
        INDEX idx_user_id (user_id),
        INDEX idx_project_id (project_id),
        INDEX idx_skill_name (skill_name),
        INDEX idx_proficiency_level (proficiency_level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await database.query(skillsSQL);
    console.log('✅ team_member_skills table created successfully');

    // Verify tables were created
    const tables = await database.query("SHOW TABLES LIKE '%team%'");
    console.log('\n📋 Team tables now available:');
    console.table(tables);

    // Show table structures
    console.log('\n📋 team_member_capacity structure:');
    const capacityStructure = await database.query('DESCRIBE team_member_capacity');
    console.table(capacityStructure);

    console.log('\n📋 team_member_skills structure:');
    const skillsStructure = await database.query('DESCRIBE team_member_skills');
    console.table(skillsStructure);

    logger.info('Team tables created successfully');

  } catch (error) {
    logger.error('Error creating team tables:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Run if called directly
if (require.main === module) {
  createTeamTables()
    .then(() => {
      console.log('\n🎉 Team tables creation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Team tables creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createTeamTables };
