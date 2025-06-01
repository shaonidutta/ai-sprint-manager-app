-- Create database
CREATE DATABASE IF NOT EXISTS `sprint_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sprint_management`;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Drop table if exists `user_projects`
DROP TABLE IF EXISTS `user_projects`;

-- Create table `user_projects`
CREATE TABLE `user_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `role` enum('Admin','Project Manager','Developer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_active_user_project` (`user_id`,`project_id`,`deleted_at`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_role` (`role`),
  CONSTRAINT `user_projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_projects_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `user_projects`
INSERT INTO `user_projects` (`id`, `user_id`, `project_id`, `role`, `created_at`, `deleted_at`) VALUES
(1, 1, 1, 'Admin', '2024-01-01 07:30:00', NULL),
(2, 2, 1, 'Project Manager', '2024-01-01 07:35:00', NULL),
(3, 3, 1, 'Developer', '2024-01-01 07:40:00', NULL),
(4, 4, 1, 'Developer', '2024-01-01 07:45:00', NULL),
(5, 2, 2, 'Admin', '2024-01-01 08:00:00', NULL),
(6, 1, 2, 'Developer', '2024-01-01 08:05:00', NULL),
(7, 5, 2, 'Developer', '2024-01-01 08:10:00', NULL),
(8, 4, 3, 'Admin', '2024-01-01 08:30:00', NULL),
(9, 3, 3, 'Project Manager', '2024-01-01 08:35:00', NULL),
(10, 5, 3, 'Developer', '2024-01-01 08:40:00', NULL),
(11, 12, 4, 'Admin', '2025-06-01 09:58:21', NULL);

-- Drop table if exists `user_activities`
DROP TABLE IF EXISTS `user_activities`;

-- Create table `user_activities`
CREATE TABLE `user_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `user_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `user_activities`
INSERT INTO `user_activities` (`id`, `user_id`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(4, 12, 'register', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 09:43:54'),
(5, 12, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 09:44:57');

-- Drop table if exists `time_logs`
DROP TABLE IF EXISTS `time_logs`;

-- Create table `time_logs`
CREATE TABLE `time_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_id` int NOT NULL,
  `user_id` int NOT NULL,
  `hours_logged` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logged_date` date NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_logged_date` (`logged_date`),
  CONSTRAINT `time_logs_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `time_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `time_logs`
INSERT INTO `time_logs` (`id`, `issue_id`, `user_id`, `hours_logged`, `description`, `logged_date`, `created_at`) VALUES
(1, 4, 4, 6, 'Implemented product grid layout', '2024-01-14 18:30:00', '2024-01-15 11:30:00'),
(2, 6, 4, 2, 'Investigated image upload issue', '2024-01-14 18:30:00', '2024-01-15 11:30:00'),
(3, 9, 1, 8, 'Fund transfer API implementation', '2024-01-14 18:30:00', '2024-01-15 11:30:00'),
(4, 13, 5, 7, 'Ticket system basic implementation', '2024-01-14 18:30:00', '2024-01-15 11:30:00');

-- Drop table if exists `refresh_tokens`
DROP TABLE IF EXISTS `refresh_tokens`;

-- Create table `refresh_tokens`
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `refresh_tokens`
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`) VALUES
(1, 12, '$2a$10$sFmATPLvjJ8UaPQOquy83u7anDmuMhWc4NsNCMwukxpHNwkM5IMgC', '2025-06-08 04:14:57', '2025-06-01 04:14:57');

-- Drop table if exists `issue_comments`
DROP TABLE IF EXISTS `issue_comments`;

-- Create table `issue_comments`
CREATE TABLE `issue_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `issue_comments_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `issue_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `issue_comments`
INSERT INTO `issue_comments` (`id`, `issue_id`, `user_id`, `comment`, `created_at`, `updated_at`) VALUES
(1, 4, 2, 'Started working on the product listing page', '2024-01-15 04:30:00', '2024-01-15 04:30:00'),
(2, 4, 4, 'Product grid layout is complete, working on filters now', '2024-01-15 08:30:00', '2024-01-15 08:30:00'),
(3, 6, 1, 'Cloud storage credentials requested from DevOps team', '2024-01-15 05:30:00', '2024-01-15 05:30:00'),
(4, 9, 2, 'API integration for fund transfers is in progress', '2024-01-15 07:30:00', '2024-01-15 07:30:00'),
(5, 13, 4, 'Basic ticket creation flow is implemented', '2024-01-15 09:30:00', '2024-01-15 09:30:00');

-- Drop table if exists `issues`
DROP TABLE IF EXISTS `issues`;

-- Create table `issues`
CREATE TABLE `issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `sprint_id` int DEFAULT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `issue_type` enum('Story','Bug','Task','Epic') COLLATE utf8mb4_unicode_ci DEFAULT 'Story',
  `status` enum('To Do','In Progress','Done','Blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'To Do',
  `priority` enum('P1','P2','P3','P4') COLLATE utf8mb4_unicode_ci DEFAULT 'P3',
  `story_points` int DEFAULT NULL,
  `original_estimate` int DEFAULT NULL,
  `time_spent` int DEFAULT '0',
  `time_remaining` int DEFAULT NULL,
  `assignee_id` int DEFAULT NULL,
  `reporter_id` int NOT NULL,
  `blocked_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_board_id` (`board_id`),
  KEY `idx_sprint_id` (`sprint_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assignee_id` (`assignee_id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_issue_type` (`issue_type`),
  CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `issues_ibfk_2` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`) ON DELETE SET NULL,
  CONSTRAINT `issues_ibfk_3` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `issues_ibfk_4` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `issues`
INSERT INTO `issues` (`id`, `board_id`, `sprint_id`, `title`, `description`, `issue_type`, `status`, `priority`, `story_points`, `original_estimate`, `time_spent`, `time_remaining`, `assignee_id`, `reporter_id`, `blocked_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Set up project infrastructure', 'Initialize repository, configure CI/CD, set up environments', 'Task', 'Done', 'P2', 5, 8, 8, 0, 1, 1, NULL, '2024-01-01 07:30:00', '2024-01-14 09:30:00'),
(2, 1, 1, 'Design database schema', 'Create ERD and implement initial database migrations', 'Task', 'Done', 'P2', 3, 5, 6, 0, 3, 1, NULL, '2024-01-01 08:00:00', '2024-01-14 10:30:00'),
(3, 1, 1, 'Implement user authentication', 'User registration and login functionality', 'Story', 'Done', 'P1', 8, 13, 15, 0, 4, 2, NULL, '2024-01-01 08:30:00', '2024-01-14 11:30:00'),
(4, 1, 2, 'Product catalog implementation', 'Create product listing and detail pages', 'Story', 'In Progress', 'P2', 8, 16, 6, 10, 4, 2, NULL, '2024-01-15 03:30:00', '2024-01-15 03:30:00'),
(5, 1, 2, 'Shopping cart functionality', 'Implement cart management and order creation', 'Story', 'To Do', 'P1', 13, 20, 0, 20, 3, 2, NULL, '2024-01-15 04:00:00', '2024-01-15 04:00:00'),
(6, 1, 2, 'Fix product image upload', 'Images not displaying correctly in product grid', 'Bug', 'Blocked', 'P1', 3, 5, 2, 3, 4, 1, 'Waiting for cloud storage credentials', '2024-01-15 04:30:00', '2024-01-15 04:30:00'),
(7, 3, 3, 'Implement secure login', 'Biometric authentication and 2FA setup', 'Story', 'Done', 'P1', 8, 13, 14, 0, 2, 2, NULL, '2024-01-01 08:00:00', '2024-01-14 10:30:00'),
(8, 3, 3, 'Account balance display', 'Show user account balances and recent transactions', 'Story', 'Done', 'P2', 5, 8, 7, 0, 5, 2, NULL, '2024-01-01 08:30:00', '2024-01-14 11:30:00'),
(9, 3, 4, 'Implement fund transfers', 'Allow transfers between accounts and to other users', 'Story', 'In Progress', 'P1', 13, 20, 8, 12, 1, 2, NULL, '2024-01-15 03:30:00', '2024-01-15 03:30:00'),
(10, 3, 4, 'Push notification setup', 'Configure and test transaction notifications', 'Task', 'To Do', 'P2', 5, 8, 0, 8, 5, 2, NULL, '2024-01-15 04:00:00', '2024-01-15 04:00:00'),
(11, 5, 5, 'Redesign login page', 'Implement new design and improve UX', 'Story', 'Done', 'P2', 5, 8, 10, 0, 4, 4, NULL, '2024-01-01 08:30:00', '2024-01-14 10:30:00'),
(12, 5, 5, 'User profile updates', 'Allow users to manage their profile information', 'Story', 'Done', 'P2', 8, 13, 11, 0, 5, 4, NULL, '2024-01-01 09:00:00', '2024-01-14 11:30:00'),
(13, 5, 6, 'Implement ticket system', 'Allow users to create and track support tickets', 'Story', 'In Progress', 'P1', 13, 20, 7, 13, 5, 4, NULL, '2024-01-15 03:30:00', '2024-01-15 03:30:00'),
(14, 5, 6, 'Knowledge base integration', 'Add searchable help articles', 'Story', 'To Do', 'P2', 8, 13, 0, 13, 3, 4, NULL, '2024-01-15 04:00:00', '2024-01-15 04:00:00');

-- Drop table if exists `sprints`
DROP TABLE IF EXISTS `sprints`;

-- Create table `sprints`
CREATE TABLE `sprints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `goal` text COLLATE utf8mb4_unicode_ci,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `capacity_story_points` int DEFAULT NULL,
  `status` enum('Planning','Active','Completed') COLLATE utf8mb4_unicode_ci DEFAULT 'Planning',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_board_id` (`board_id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_end_date` (`end_date`),
  CONSTRAINT `sprints_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sprints_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `sprints`
INSERT INTO `sprints` (`id`, `board_id`, `name`, `goal`, `start_date`, `end_date`, `capacity_story_points`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Sprint 1', 'Initial project setup and basic features', '2023-12-31 18:30:00', '2024-01-13 18:30:00', 20, 'Completed', 1, '2024-01-01 07:30:00', '2024-01-14 11:30:00'),
(2, 1, 'Sprint 2', 'Core shopping features implementation', '2024-01-14 18:30:00', '2024-01-27 18:30:00', 25, 'Active', 1, '2024-01-15 03:30:00', '2024-01-15 03:30:00'),
(3, 3, 'Sprint 1', 'User authentication and basic banking features', '2023-12-31 18:30:00', '2024-01-13 18:30:00', 15, 'Completed', 2, '2024-01-01 08:00:00', '2024-01-14 11:30:00'),
(4, 3, 'Sprint 2', 'Transaction management and notifications', '2024-01-14 18:30:00', '2024-01-27 18:30:00', 20, 'Active', 2, '2024-01-15 03:30:00', '2024-01-15 03:30:00'),
(5, 5, 'Sprint 1', 'Portal redesign and user feedback', '2023-12-31 18:30:00', '2024-01-13 18:30:00', 18, 'Completed', 4, '2024-01-01 08:30:00', '2024-01-14 11:30:00'),
(6, 5, 'Sprint 2', 'Self-service features implementation', '2024-01-14 18:30:00', '2024-01-27 18:30:00', 22, 'Active', 4, '2024-01-15 03:30:00', '2024-01-15 03:30:00');

-- Drop table if exists `email_otps`
DROP TABLE IF EXISTS `email_otps`;

-- Create table `email_otps`
CREATE TABLE `email_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` int DEFAULT '0',
  `created_at_ts` bigint NOT NULL,
  `expires_at_ts` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_email_otp` (`email`,`otp`),
  KEY `idx_user_email` (`user_id`,`email`),
  CONSTRAINT `email_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `email_otps`
INSERT INTO `email_otps` (`id`, `user_id`, `email`, `otp`, `attempts`, `created_at_ts`, `expires_at_ts`) VALUES
(5, 12, 'agtshaonidutta2k@gmail.com', '825995', 0, 1748771031, 1748771092),
(6, 12, 'agtshaonidutta2k@gmail.com', '586712', 0, 1748771034, 1748771092);

-- Drop table if exists `board_columns`
DROP TABLE IF EXISTS `board_columns`;

-- Create table `board_columns`
CREATE TABLE `board_columns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_mapping` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL,
  `wip_limit` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_board_id` (`board_id`),
  KEY `idx_position` (`position`),
  KEY `idx_status_mapping` (`status_mapping`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `board_columns_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `board_columns`
INSERT INTO `board_columns` (`id`, `board_id`, `name`, `status_mapping`, `position`, `wip_limit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'To Do', 'To Do', 1, NULL, 1, '2024-01-01 07:30:00', '2024-01-01 07:30:00'),
(2, 1, 'In Progress', 'In Progress', 2, 5, 1, '2024-01-01 07:30:00', '2024-01-01 07:30:00'),
(3, 1, 'Done', 'Done', 3, NULL, 1, '2024-01-01 07:30:00', '2024-01-01 07:30:00'),
(4, 1, 'Blocked', 'Blocked', 4, NULL, 1, '2024-01-01 07:30:00', '2024-01-01 07:30:00'),
(5, 2, 'To Do', 'To Do', 1, NULL, 1, '2024-01-01 07:31:00', '2024-01-01 07:31:00'),
(6, 2, 'In Progress', 'In Progress', 2, 5, 1, '2024-01-01 07:31:00', '2024-01-01 07:31:00'),
(7, 2, 'Done', 'Done', 3, NULL, 1, '2024-01-01 07:31:00', '2024-01-01 07:31:00'),
(8, 2, 'Blocked', 'Blocked', 4, NULL, 1, '2024-01-01 07:31:00', '2024-01-01 07:31:00'),
(9, 3, 'To Do', 'To Do', 1, NULL, 1, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(10, 3, 'In Progress', 'In Progress', 2, 5, 1, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(11, 3, 'Done', 'Done', 3, NULL, 1, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(12, 3, 'Blocked', 'Blocked', 4, NULL, 1, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(13, 4, 'To Do', 'To Do', 1, NULL, 1, '2024-01-01 08:01:00', '2024-01-01 08:01:00'),
(14, 4, 'In Progress', 'In Progress', 2, 5, 1, '2024-01-01 08:01:00', '2024-01-01 08:01:00'),
(15, 4, 'Done', 'Done', 3, NULL, 1, '2024-01-01 08:01:00', '2024-01-01 08:01:00'),
(16, 4, 'Blocked', 'Blocked', 4, NULL, 1, '2024-01-01 08:01:00', '2024-01-01 08:01:00'),
(17, 5, 'To Do', 'To Do', 1, NULL, 1, '2024-01-01 08:30:00', '2024-01-01 08:30:00'),
(18, 5, 'In Progress', 'In Progress', 2, 5, 1, '2024-01-01 08:30:00', '2024-01-01 08:30:00'),
(19, 5, 'Done', 'Done', 3, NULL, 1, '2024-01-01 08:30:00', '2024-01-01 08:30:00'),
(20, 5, 'Blocked', 'Blocked', 4, NULL, 1, '2024-01-01 08:30:00', '2024-01-01 08:30:00');

-- Drop table if exists `boards`
DROP TABLE IF EXISTS `boards`;

-- Create table `boards`
CREATE TABLE `boards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_default` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_is_default` (`is_default`),
  CONSTRAINT `boards_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `boards_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `boards`
INSERT INTO `boards` (`id`, `project_id`, `name`, `description`, `is_default`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Main Board', 'Default board for E-commerce Platform', 1, 1, '2024-01-01 07:30:00', '2024-01-01 07:30:00'),
(2, 1, 'Frontend Development', 'Frontend team board', 0, 1, '2024-01-01 07:31:00', '2024-01-01 07:31:00'),
(3, 2, 'Main Board', 'Default board for Mobile Banking App', 1, 2, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(4, 2, 'Security Features', 'Security implementation board', 0, 2, '2024-01-01 08:01:00', '2024-01-01 08:01:00'),
(5, 3, 'Main Board', 'Default board for Customer Portal', 1, 4, '2024-01-01 08:30:00', '2024-01-01 08:30:00'),
(6, 4, 'Main Board', 'Default board for project', 1, 12, '2025-06-01 09:58:21', '2025-06-01 09:58:21');

-- Drop table if exists `ai_requests`
DROP TABLE IF EXISTS `ai_requests`;

-- Create table `ai_requests`
CREATE TABLE `ai_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `feature` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_data` json DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_feature` (`feature`),
  CONSTRAINT `ai_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ai_requests_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `ai_requests`
INSERT INTO `ai_requests` (`id`, `user_id`, `project_id`, `feature`, `request_data`, `response_data`, `created_at`) VALUES
(1, 1, 1, 'sprint-plan', '[object Object]', '[object Object]', '2024-01-15 03:30:00'),
(2, 2, 2, 'risk-assessment', '[object Object]', '[object Object]', '2024-01-15 04:30:00'),
(3, 4, 3, 'scope-creep', '[object Object]', '[object Object]', '2024-01-15 05:30:00');

-- Drop table if exists `projects`
DROP TABLE IF EXISTS `projects`;

-- Create table `projects`
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `project_key` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` int NOT NULL,
  `ai_requests_count` int DEFAULT '0',
  `ai_requests_reset_date` date DEFAULT (curdate()),
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_key` (`project_key`),
  KEY `idx_project_key` (`project_key`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `projects`
INSERT INTO `projects` (`id`, `name`, `description`, `project_key`, `owner_id`, `ai_requests_count`, `ai_requests_reset_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'E-commerce Platform', 'Online shopping platform development project', 'ECOM01', 1, 0, '2025-05-31 18:30:00', 1, '2024-01-01 07:30:00', '2024-01-01 07:30:00'),
(2, 'Mobile Banking App', 'Secure mobile banking application', 'BANK01', 2, 2, '2025-05-31 18:30:00', 1, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(3, 'Customer Portal', 'Self-service customer portal redesign', 'CUST01', 4, 5, '2025-05-31 18:30:00', 1, '2024-01-01 08:30:00', '2024-01-01 08:30:00'),
(4, 'project 1', 'project test', 'PROJEC', 12, 0, '2025-05-31 18:30:00', 1, '2025-06-01 09:58:21', '2025-06-01 09:58:21');

-- Drop table if exists `users`
DROP TABLE IF EXISTS `users`;

-- Create table `users`
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_email_verified` (`email_verified`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `users`
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `email_verified`, `password_reset_token`, `password_reset_expires`, `avatar_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'john.doe@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'John', 'Doe', 1, NULL, NULL, NULL, 1, '2024-01-01 04:30:00', '2024-01-01 04:30:00'),
(2, 'jane.smith@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Jane', 'Smith', 1, NULL, NULL, NULL, 1, '2024-01-01 05:00:00', '2024-01-01 05:00:00'),
(3, 'bob.wilson@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Bob', 'Wilson', 0, NULL, NULL, NULL, 1, '2024-01-01 05:30:00', '2024-01-01 05:30:00'),
(4, 'alice.johnson@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Alice', 'Johnson', 1, NULL, NULL, NULL, 1, '2024-01-01 06:00:00', '2024-01-01 06:00:00'),
(5, 'charlie.brown@example.com', '$2a$12$K8Y6YGzqW2Kx0yQ5.Tnb8eUwJ3uGxRs9k5ZLBFzjZ9TkHnxJbvRDy', 'Charlie', 'Brown', 0, NULL, NULL, NULL, 1, '2024-01-01 06:30:00', '2024-01-01 06:30:00'),
(12, 'agtshaonidutta2k@gmail.com', '$2a$12$TkFutfm53J9IHRyBZqCvW.gmEqwxomnLdhCTx.ZXWSfHAEqG5zH0W', 'Shaoni', 'Dutta', 1, NULL, NULL, NULL, 1, '2025-06-01 09:43:51', '2025-06-01 09:44:52');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;
