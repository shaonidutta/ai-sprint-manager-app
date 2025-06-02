require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../config/logger');

const createDatabase = async () => {
  let connection;
  
  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    logger.info('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    logger.info(`Database '${process.env.DB_NAME}' created or already exists`);

    // Close the connection and reconnect with the database specified
    await connection.end();

    // Reconnect with the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    logger.info(`Connected to database '${process.env.DB_NAME}'`);

    // Create tables
    await createTables(connection);
    
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const createTables = async (connection) => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      password_reset_token VARCHAR(255),
      password_reset_expires DATETIME,
      avatar_url VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_email_verified (email_verified),
      INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Email OTPs table
    `CREATE TABLE IF NOT EXISTS email_otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      attempts INT DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_email_otp (email, otp),
      INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Projects table
    `CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      project_key VARCHAR(10) UNIQUE NOT NULL,
      owner_id INT NOT NULL,
      ai_requests_count INT DEFAULT 0,
      ai_requests_reset_date DATE DEFAULT (CURDATE()),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_project_key (project_key),
      INDEX idx_owner_id (owner_id),
      INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // User-Project relationship table
    `CREATE TABLE IF NOT EXISTS user_projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      project_id INT NOT NULL,
      role ENUM('Admin', 'Project Manager', 'Developer') NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE KEY unique_active_user_project (user_id, project_id, deleted_at),
      INDEX idx_user_id (user_id),
      INDEX idx_project_id (project_id),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Boards table
    `CREATE TABLE IF NOT EXISTS boards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      is_default BOOLEAN DEFAULT FALSE,
      created_by INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_project_id (project_id),
      INDEX idx_is_default (is_default)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Board columns table
    `CREATE TABLE IF NOT EXISTS board_columns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      board_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      status_mapping VARCHAR(50) NOT NULL,
      position INT NOT NULL,
      wip_limit INT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
      INDEX idx_board_id (board_id),
      INDEX idx_position (position),
      INDEX idx_status_mapping (status_mapping),
      INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Sprints table
    `CREATE TABLE IF NOT EXISTS sprints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      board_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      goal TEXT,
      start_date DATE,
      end_date DATE,
      capacity_story_points INT,
      status ENUM('Planning', 'Active', 'Completed') DEFAULT 'Planning',
      created_by INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_board_id (board_id),
      INDEX idx_status (status),
      INDEX idx_start_date (start_date),
      INDEX idx_end_date (end_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Issues table
    `CREATE TABLE IF NOT EXISTS issues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      board_id INT NOT NULL,
      sprint_id INT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      issue_type ENUM('Story', 'Bug', 'Task', 'Epic') DEFAULT 'Story',
      status ENUM('To Do', 'In Progress', 'Done', 'Blocked') DEFAULT 'To Do',
      priority ENUM('P1', 'P2', 'P3', 'P4') DEFAULT 'P3',
      story_points INT NULL,
      original_estimate INT NULL,
      time_spent INT DEFAULT 0,
      time_remaining INT NULL,
      assignee_id INT NULL,
      reporter_id INT NOT NULL,
      blocked_reason TEXT NULL,
      issue_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
      FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_board_id (board_id),
      INDEX idx_sprint_id (sprint_id),
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_assignee_id (assignee_id),
      INDEX idx_reporter_id (reporter_id),
      INDEX idx_issue_type (issue_type),
      INDEX idx_issue_order (issue_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Refresh tokens table
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Issue comments table
    `CREATE TABLE IF NOT EXISTS issue_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      issue_id INT NOT NULL,
      user_id INT NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_issue_id (issue_id),
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Time logs table
    `CREATE TABLE IF NOT EXISTS time_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      issue_id INT NOT NULL,
      user_id INT NOT NULL,
      hours_logged INT NOT NULL,
      description TEXT,
      logged_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_issue_id (issue_id),
      INDEX idx_user_id (user_id),
      INDEX idx_logged_date (logged_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // AI requests table
    `CREATE TABLE IF NOT EXISTS ai_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      project_id INT NOT NULL,
      feature VARCHAR(50) NOT NULL,
      request_data JSON,
      response_data JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_project_id (project_id),
      INDEX idx_feature (feature)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Email verifications table
    `CREATE TABLE IF NOT EXISTS email_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      verified_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_token (token),
      INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // User activities table
    `CREATE TABLE IF NOT EXISTS user_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(50) NULL,
      resource_id INT NULL,
      details JSON NULL,
      ip_address VARCHAR(45) NULL,
      user_agent TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_action (action),
      INDEX idx_resource_type (resource_type),
      INDEX idx_resource_id (resource_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Team Member Capacity table
    `CREATE TABLE IF NOT EXISTS team_member_capacity (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Risk Heatmap Data table
    `CREATE TABLE IF NOT EXISTS risk_heatmap_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      sprint_id INT NULL,
      risk_type ENUM('workload', 'dependency', 'skill_mismatch', 'timeline', 'capacity') NOT NULL,
      entity_type ENUM('team_member', 'issue', 'sprint') NOT NULL,
      entity_id INT NOT NULL,
      risk_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
      risk_score DECIMAL(5,2) NOT NULL,
      risk_factors JSON,
      mitigation_suggestions JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
      INDEX idx_project_id (project_id),
      INDEX idx_sprint_id (sprint_id),
      INDEX idx_risk_type (risk_type),
      INDEX idx_entity_type (entity_type),
      INDEX idx_risk_level (risk_level)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Team Member Skills table
    `CREATE TABLE IF NOT EXISTS team_member_skills (
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
      INDEX idx_skill_name (skill_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  for (const [index, tableSQL] of tables.entries()) {
    try {
      await connection.execute(tableSQL);
      logger.info(`Table ${index + 1}/${tables.length} created successfully`);
    } catch (error) {
      logger.error(`Failed to create table ${index + 1}:`, error);
      throw error;
    }
  }
};

// Run migration if called directly
if (require.main === module) {
  createDatabase()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createDatabase };
