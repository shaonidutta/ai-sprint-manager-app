-- Drop existing tables if they exist
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS email_otps;
DROP TABLE IF EXISTS users;

-- Create users table with OTP verification support
CREATE TABLE users (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create email_otps table for OTP verification
CREATE TABLE email_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    attempts INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email_otp (email, otp),
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_email (user_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE user_activities;
TRUNCATE TABLE ai_requests;
TRUNCATE TABLE time_logs;
TRUNCATE TABLE issue_comments;
TRUNCATE TABLE issues;
TRUNCATE TABLE sprints;
TRUNCATE TABLE board_columns;
TRUNCATE TABLE boards;
TRUNCATE TABLE user_projects;
TRUNCATE TABLE projects;
TRUNCATE TABLE email_otps;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Users table data
-- Note: Passwords are hashed with bcrypt, all passwords are 'Password123!'
INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified, is_active, created_at, updated_at) VALUES
(1, 'john.doe@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'John', 'Doe', true, true, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(2, 'jane.smith@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Jane', 'Smith', true, true, '2024-01-01 10:30:00', '2024-01-01 10:30:00'),
(3, 'bob.wilson@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Bob', 'Wilson', false, true, '2024-01-01 11:00:00', '2024-01-01 11:00:00'),
(4, 'alice.johnson@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Alice', 'Johnson', true, true, '2024-01-01 11:30:00', '2024-01-01 11:30:00'),
(5, 'charlie.brown@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Charlie', 'Brown', false, true, '2024-01-01 12:00:00', '2024-01-01 12:00:00');

-- Email OTPs table data (for unverified users)
INSERT INTO email_otps (user_id, email, otp, attempts, expires_at, created_at) VALUES
(3, 'bob.wilson@example.com', '123456', 0, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW()),
(5, 'charlie.brown@example.com', '345678', 0, DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW());

-- Projects table data
INSERT INTO projects (id, name, description, project_key, owner_id, ai_requests_count, ai_requests_reset_date, is_active, created_at, updated_at) VALUES
(1, 'E-commerce Platform', 'Online shopping platform development project', 'ECOM01', 1, 0, CURDATE(), true, '2024-01-01 13:00:00', '2024-01-01 13:00:00'),
(2, 'Mobile Banking App', 'Secure mobile banking application', 'BANK01', 2, 2, CURDATE(), true, '2024-01-01 13:30:00', '2024-01-01 13:30:00'),
(3, 'Customer Portal', 'Self-service customer portal redesign', 'CUST01', 4, 5, CURDATE(), true, '2024-01-01 14:00:00', '2024-01-01 14:00:00');

-- User Projects table data (roles: Admin, Project Manager, Developer)
INSERT INTO user_projects (user_id, project_id, role, created_at) VALUES
-- E-commerce Platform team
(1, 1, 'Admin', '2024-01-01 13:00:00'),        -- John Doe (Owner)
(2, 1, 'Project Manager', '2024-01-01 13:05:00'), -- Jane Smith
(3, 1, 'Developer', '2024-01-01 13:10:00'),     -- Bob Wilson
(4, 1, 'Developer', '2024-01-01 13:15:00'),     -- Alice Johnson

-- Mobile Banking App team
(2, 2, 'Admin', '2024-01-01 13:30:00'),        -- Jane Smith (Owner)
(1, 2, 'Developer', '2024-01-01 13:35:00'),     -- John Doe
(5, 2, 'Developer', '2024-01-01 13:40:00'),     -- Charlie Brown

-- Customer Portal team
(4, 3, 'Admin', '2024-01-01 14:00:00'),        -- Alice Johnson (Owner)
(3, 3, 'Project Manager', '2024-01-01 14:05:00'), -- Bob Wilson
(5, 3, 'Developer', '2024-01-01 14:10:00');      -- Charlie Brown

-- Boards table data
INSERT INTO boards (id, project_id, name, description, is_default, created_by, created_at, updated_at) VALUES
-- E-commerce Platform boards
(1, 1, 'Main Board', 'Default board for E-commerce Platform', true, 1, '2024-01-01 13:00:00', '2024-01-01 13:00:00'),
(2, 1, 'Frontend Development', 'Frontend team board', false, 1, '2024-01-01 13:01:00', '2024-01-01 13:01:00'),

-- Mobile Banking App boards
(3, 2, 'Main Board', 'Default board for Mobile Banking App', true, 2, '2024-01-01 13:30:00', '2024-01-01 13:30:00'),
(4, 2, 'Security Features', 'Security implementation board', false, 2, '2024-01-01 13:31:00', '2024-01-01 13:31:00'),

-- Customer Portal boards
(5, 3, 'Main Board', 'Default board for Customer Portal', true, 4, '2024-01-01 14:00:00', '2024-01-01 14:00:00');

-- Board Columns table data
INSERT INTO board_columns (board_id, name, status_mapping, position, wip_limit, is_active, created_at, updated_at) VALUES
-- E-commerce Platform - Main Board columns
(1, 'To Do', 'To Do', 1, NULL, true, '2024-01-01 13:00:00', '2024-01-01 13:00:00'),
(1, 'In Progress', 'In Progress', 2, 5, true, '2024-01-01 13:00:00', '2024-01-01 13:00:00'),
(1, 'Done', 'Done', 3, NULL, true, '2024-01-01 13:00:00', '2024-01-01 13:00:00'),
(1, 'Blocked', 'Blocked', 4, NULL, true, '2024-01-01 13:00:00', '2024-01-01 13:00:00'),

-- E-commerce Platform - Frontend Board columns
(2, 'To Do', 'To Do', 1, NULL, true, '2024-01-01 13:01:00', '2024-01-01 13:01:00'),
(2, 'In Progress', 'In Progress', 2, 5, true, '2024-01-01 13:01:00', '2024-01-01 13:01:00'),
(2, 'Done', 'Done', 3, NULL, true, '2024-01-01 13:01:00', '2024-01-01 13:01:00'),
(2, 'Blocked', 'Blocked', 4, NULL, true, '2024-01-01 13:01:00', '2024-01-01 13:01:00'),

-- Mobile Banking App - Main Board columns
(3, 'To Do', 'To Do', 1, NULL, true, '2024-01-01 13:30:00', '2024-01-01 13:30:00'),
(3, 'In Progress', 'In Progress', 2, 5, true, '2024-01-01 13:30:00', '2024-01-01 13:30:00'),
(3, 'Done', 'Done', 3, NULL, true, '2024-01-01 13:30:00', '2024-01-01 13:30:00'),
(3, 'Blocked', 'Blocked', 4, NULL, true, '2024-01-01 13:30:00', '2024-01-01 13:30:00'),

-- Mobile Banking App - Security Board columns
(4, 'To Do', 'To Do', 1, NULL, true, '2024-01-01 13:31:00', '2024-01-01 13:31:00'),
(4, 'In Progress', 'In Progress', 2, 5, true, '2024-01-01 13:31:00', '2024-01-01 13:31:00'),
(4, 'Done', 'Done', 3, NULL, true, '2024-01-01 13:31:00', '2024-01-01 13:31:00'),
(4, 'Blocked', 'Blocked', 4, NULL, true, '2024-01-01 13:31:00', '2024-01-01 13:31:00'),

-- Customer Portal - Main Board columns
(5, 'To Do', 'To Do', 1, NULL, true, '2024-01-01 14:00:00', '2024-01-01 14:00:00'),
(5, 'In Progress', 'In Progress', 2, 5, true, '2024-01-01 14:00:00', '2024-01-01 14:00:00'),
(5, 'Done', 'Done', 3, NULL, true, '2024-01-01 14:00:00', '2024-01-01 14:00:00'),
(5, 'Blocked', 'Blocked', 4, NULL, true, '2024-01-01 14:00:00', '2024-01-01 14:00:00');

-- Sprints table data
INSERT INTO sprints (id, board_id, name, goal, start_date, end_date, capacity_story_points, status, created_by, created_at, updated_at) VALUES
-- E-commerce Platform - Main Board sprints
(1, 1, 'Sprint 1', 'Initial project setup and basic features', '2024-01-01', '2024-01-14', 20, 'Completed', 1, '2024-01-01 13:00:00', '2024-01-14 17:00:00'),
(2, 1, 'Sprint 2', 'Core shopping features implementation', '2024-01-15', '2024-01-28', 25, 'Active', 1, '2024-01-15 09:00:00', '2024-01-15 09:00:00'),

-- Mobile Banking App - Main Board sprints
(3, 3, 'Sprint 1', 'User authentication and basic banking features', '2024-01-01', '2024-01-14', 15, 'Completed', 2, '2024-01-01 13:30:00', '2024-01-14 17:00:00'),
(4, 3, 'Sprint 2', 'Transaction management and notifications', '2024-01-15', '2024-01-28', 20, 'Active', 2, '2024-01-15 09:00:00', '2024-01-15 09:00:00'),

-- Customer Portal - Main Board sprints
(5, 5, 'Sprint 1', 'Portal redesign and user feedback', '2024-01-01', '2024-01-14', 18, 'Completed', 4, '2024-01-01 14:00:00', '2024-01-14 17:00:00'),
(6, 5, 'Sprint 2', 'Self-service features implementation', '2024-01-15', '2024-01-28', 22, 'Active', 4, '2024-01-15 09:00:00', '2024-01-15 09:00:00');

-- Issues table data
INSERT INTO issues (id, board_id, sprint_id, title, description, issue_type, status, priority, story_points, original_estimate, time_spent, time_remaining, assignee_id, reporter_id, blocked_reason, created_at, updated_at) VALUES
-- E-commerce Platform - Sprint 1 (Completed)
(1, 1, 1, 'Set up project infrastructure', 'Initialize repository, configure CI/CD, set up environments', 'Task', 'Done', 'P2', 5, 8, 8, 0, 1, 1, NULL, '2024-01-01 13:00:00', '2024-01-14 15:00:00'),
(2, 1, 1, 'Design database schema', 'Create ERD and implement initial database migrations', 'Task', 'Done', 'P2', 3, 5, 6, 0, 3, 1, NULL, '2024-01-01 13:30:00', '2024-01-14 16:00:00'),
(3, 1, 1, 'Implement user authentication', 'User registration and login functionality', 'Story', 'Done', 'P1', 8, 13, 15, 0, 4, 2, NULL, '2024-01-01 14:00:00', '2024-01-14 17:00:00'),

-- E-commerce Platform - Sprint 2 (Active)
(4, 1, 2, 'Product catalog implementation', 'Create product listing and detail pages', 'Story', 'In Progress', 'P2', 8, 16, 6, 10, 4, 2, NULL, '2024-01-15 09:00:00', '2024-01-15 09:00:00'),
(5, 1, 2, 'Shopping cart functionality', 'Implement cart management and order creation', 'Story', 'To Do', 'P1', 13, 20, 0, 20, 3, 2, NULL, '2024-01-15 09:30:00', '2024-01-15 09:30:00'),
(6, 1, 2, 'Fix product image upload', 'Images not displaying correctly in product grid', 'Bug', 'Blocked', 'P1', 3, 5, 2, 3, 4, 1, 'Waiting for cloud storage credentials', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),

-- Mobile Banking App - Sprint 1 (Completed)
(7, 3, 3, 'Implement secure login', 'Biometric authentication and 2FA setup', 'Story', 'Done', 'P1', 8, 13, 14, 0, 2, 2, NULL, '2024-01-01 13:30:00', '2024-01-14 16:00:00'),
(8, 3, 3, 'Account balance display', 'Show user account balances and recent transactions', 'Story', 'Done', 'P2', 5, 8, 7, 0, 5, 2, NULL, '2024-01-01 14:00:00', '2024-01-14 17:00:00'),

-- Mobile Banking App - Sprint 2 (Active)
(9, 3, 4, 'Implement fund transfers', 'Allow transfers between accounts and to other users', 'Story', 'In Progress', 'P1', 13, 20, 8, 12, 1, 2, NULL, '2024-01-15 09:00:00', '2024-01-15 09:00:00'),
(10, 3, 4, 'Push notification setup', 'Configure and test transaction notifications', 'Task', 'To Do', 'P2', 5, 8, 0, 8, 5, 2, NULL, '2024-01-15 09:30:00', '2024-01-15 09:30:00'),

-- Customer Portal - Sprint 1 (Completed)
(11, 5, 5, 'Redesign login page', 'Implement new design and improve UX', 'Story', 'Done', 'P2', 5, 8, 10, 0, 4, 4, NULL, '2024-01-01 14:00:00', '2024-01-14 16:00:00'),
(12, 5, 5, 'User profile updates', 'Allow users to manage their profile information', 'Story', 'Done', 'P2', 8, 13, 11, 0, 5, 4, NULL, '2024-01-01 14:30:00', '2024-01-14 17:00:00'),

-- Customer Portal - Sprint 2 (Active)
(13, 5, 6, 'Implement ticket system', 'Allow users to create and track support tickets', 'Story', 'In Progress', 'P1', 13, 20, 7, 13, 5, 4, NULL, '2024-01-15 09:00:00', '2024-01-15 09:00:00'),
(14, 5, 6, 'Knowledge base integration', 'Add searchable help articles', 'Story', 'To Do', 'P2', 8, 13, 0, 13, 3, 4, NULL, '2024-01-15 09:30:00', '2024-01-15 09:30:00');

-- Issue Comments table data
INSERT INTO issue_comments (issue_id, user_id, comment, created_at, updated_at) VALUES
(4, 2, 'Started working on the product listing page', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),
(4, 4, 'Product grid layout is complete, working on filters now', '2024-01-15 14:00:00', '2024-01-15 14:00:00'),
(6, 1, 'Cloud storage credentials requested from DevOps team', '2024-01-15 11:00:00', '2024-01-15 11:00:00'),
(9, 2, 'API integration for fund transfers is in progress', '2024-01-15 13:00:00', '2024-01-15 13:00:00'),
(13, 4, 'Basic ticket creation flow is implemented', '2024-01-15 15:00:00', '2024-01-15 15:00:00');

-- Time Logs table data
INSERT INTO time_logs (issue_id, user_id, hours_logged, description, logged_date, created_at) VALUES
(4, 4, 6, 'Implemented product grid layout', '2024-01-15', '2024-01-15 17:00:00'),
(6, 4, 2, 'Investigated image upload issue', '2024-01-15', '2024-01-15 17:00:00'),
(9, 1, 8, 'Fund transfer API implementation', '2024-01-15', '2024-01-15 17:00:00'),
(13, 5, 7, 'Ticket system basic implementation', '2024-01-15', '2024-01-15 17:00:00');

-- AI Requests table data
INSERT INTO ai_requests (user_id, project_id, feature, request_data, response_data, created_at) VALUES
(1, 1, 'sprint-plan', '{"sprintId": 2, "teamCapacity": 25}', '{"recommendations": ["Focus on core shopping features", "Split large stories into smaller tasks"]}', '2024-01-15 09:00:00'),
(2, 2, 'risk-assessment', '{"sprintId": 4}', '{"risks": ["Complex integration points", "Security compliance requirements"]}', '2024-01-15 10:00:00'),
(4, 3, 'scope-creep', '{"sprintId": 6}', '{"analysis": {"scopeIncreased": true, "recommendations": ["Review sprint capacity", "Prioritize core features"]}}', '2024-01-15 11:00:00'); 