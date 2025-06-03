-- ============================================
-- SQL Script to Create Missing Team Tables
-- ============================================

-- 1. Team Member Capacity Table
-- This table tracks team member capacity for each sprint
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Team Member Skills Table  
-- This table tracks skills and proficiency levels for team members per project
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data for Testing (Optional)
-- ============================================

-- Sample team member capacity data
-- INSERT INTO team_member_capacity (user_id, sprint_id, available_hours, capacity_percentage, story_points_capacity, skill_tags, notes) VALUES
-- (1, 1, 40.0, 100.0, 10, '["JavaScript", "React", "Node.js"]', 'Full capacity for this sprint'),
-- (2, 1, 32.0, 80.0, 8, '["Python", "Django", "PostgreSQL"]', 'Reduced capacity due to training'),
-- (3, 1, 40.0, 100.0, 12, '["Java", "Spring Boot", "MySQL"]', 'Senior developer - higher capacity');

-- Sample team member skills data
-- INSERT INTO team_member_skills (user_id, project_id, skill_name, proficiency_level, years_experience) VALUES
-- (1, 1, 'JavaScript', 'Advanced', 3.5),
-- (1, 1, 'React', 'Expert', 4.0),
-- (1, 1, 'Node.js', 'Intermediate', 2.0),
-- (2, 1, 'Python', 'Expert', 5.0),
-- (2, 1, 'Django', 'Advanced', 3.0),
-- (2, 1, 'PostgreSQL', 'Intermediate', 2.5),
-- (3, 1, 'Java', 'Expert', 8.0),
-- (3, 1, 'Spring Boot', 'Advanced', 4.0),
-- (3, 1, 'MySQL', 'Advanced', 6.0);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if tables were created successfully
-- SHOW TABLES LIKE '%team%';

-- Verify table structures
-- DESCRIBE team_member_capacity;
-- DESCRIBE team_member_skills;

-- Check foreign key constraints
-- SELECT 
--   TABLE_NAME,
--   COLUMN_NAME,
--   CONSTRAINT_NAME,
--   REFERENCED_TABLE_NAME,
--   REFERENCED_COLUMN_NAME
-- FROM information_schema.KEY_COLUMN_USAGE
-- WHERE TABLE_SCHEMA = 'sprint_management' 
--   AND TABLE_NAME IN ('team_member_capacity', 'team_member_skills')
--   AND REFERENCED_TABLE_NAME IS NOT NULL;
