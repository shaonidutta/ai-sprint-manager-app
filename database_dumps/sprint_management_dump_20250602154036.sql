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
  `role` enum('Admin','Project Manager','Developer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_active_user_project` (`user_id`,`project_id`,`deleted_at`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_role` (`role`),
  CONSTRAINT `user_projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_projects_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `user_projects`
INSERT INTO `user_projects` (`id`, `user_id`, `project_id`, `role`, `created_at`, `deleted_at`) VALUES
(1, 1, 1, 'Admin', '2025-06-01 20:34:52', NULL),
(2, 2, 1, 'Project Manager', '2025-06-01 20:34:52', NULL),
(3, 3, 1, 'Developer', '2025-06-01 20:34:52', NULL),
(4, 4, 1, 'Developer', '2025-06-01 20:34:52', NULL),
(5, 2, 2, 'Admin', '2025-06-01 20:34:52', NULL),
(6, 3, 2, 'Developer', '2025-06-01 20:34:52', NULL),
(7, 3, 3, 'Admin', '2025-06-01 20:34:52', NULL),
(8, 4, 3, 'Developer', '2025-06-01 20:34:52', NULL),
(9, 6, 4, 'Admin', '2025-06-01 20:40:42', NULL),
(10, 7, 5, 'Admin', '2025-06-01 22:23:31', NULL),
(11, 7, 6, 'Admin', '2025-06-01 22:23:40', NULL),
(12, 7, 1, 'Admin', '2025-06-01 22:59:41', NULL),
(13, 9, 7, 'Admin', '2025-06-01 23:33:35', NULL),
(14, 9, 1, 'Developer', '2025-06-01 23:35:18', NULL),
(15, 6, 1, 'Developer', '2025-06-02 00:24:16', NULL);

-- Drop table if exists `user_activities`
DROP TABLE IF EXISTS `user_activities`;

-- Create table `user_activities`
CREATE TABLE `user_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `user_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `user_activities`
INSERT INTO `user_activities` (`id`, `user_id`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(6, 13, 'register', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 11:48:04'),
(7, 14, 'register', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 11:49:37'),
(8, 15, 'register', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 12:12:42'),
(9, 16, 'register', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 12:15:33'),
(49, 6, 'register', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 20:38:07'),
(50, 6, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 20:38:38'),
(51, 6, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-01 21:00:27'),
(52, 7, 'register', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.4061', '2025-06-01 22:19:50'),
(53, 7, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.4061', '2025-06-01 22:21:55'),
(54, 7, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.4061', '2025-06-01 22:22:02'),
(55, 7, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.4061', '2025-06-01 22:26:36'),
(56, 7, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.4061', '2025-06-01 22:26:43'),
(57, 8, 'register', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-01 23:31:31'),
(58, 9, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-01 23:34:17'),
(59, 9, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-01 23:35:27'),
(60, 9, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.4061', '2025-06-01 23:42:11'),
(61, 6, 'login', NULL, NULL, '[object Object]', '::1', 'curl/8.11.0', '2025-06-01 23:47:56'),
(62, 6, 'login', NULL, NULL, '[object Object]', '::1', 'curl/8.11.0', '2025-06-01 23:59:33'),
(63, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:15:25'),
(64, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:15:30'),
(65, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:15:32'),
(66, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:16:15'),
(67, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:16:17'),
(68, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:16:19'),
(69, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:16:21'),
(70, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:16:23'),
(71, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:16:47'),
(72, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:17:14'),
(73, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:17:17'),
(74, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:17:21'),
(75, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 04:17:24'),
(76, 6, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 06:28:56'),
(77, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 06:32:05'),
(78, 6, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 06:57:47'),
(79, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 07:16:44'),
(80, 6, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 10:19:30'),
(81, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 10:40:08'),
(82, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 10:42:03'),
(83, 6, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 10:50:18'),
(84, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 10:52:28'),
(85, 6, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:03:13'),
(86, 6, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:03:44'),
(87, 6, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:04:10'),
(88, 6, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:04:31'),
(89, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:04:36'),
(90, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:05:43'),
(91, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:11:40'),
(92, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:12:56'),
(93, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:14:00'),
(94, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:17:29'),
(95, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:19:57'),
(96, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:20:07'),
(97, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:21:14'),
(98, 6, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:29:06'),
(99, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:29:37'),
(100, 6, 'login', NULL, NULL, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:31:44'),
(101, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'axios/1.9.0', '2025-06-02 11:31:59'),
(102, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:33:36'),
(103, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:35:05'),
(104, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:36:34'),
(105, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 11:40:07'),
(106, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:13:38'),
(107, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:16:06'),
(108, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:24:11'),
(109, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:25:54'),
(110, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:32:31'),
(111, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:40:52'),
(112, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:45:00'),
(113, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:45:18'),
(114, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:52:51'),
(115, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:55:20'),
(116, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:56:50'),
(117, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 12:59:48'),
(118, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:01:34'),
(119, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:01:43'),
(120, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:05:08'),
(121, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:07:40'),
(122, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:08:50'),
(123, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:09:40'),
(124, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:17:19'),
(125, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:46:16'),
(126, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 13:48:10'),
(127, 6, 'ai_request_made', 'ai_request', 1, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 14:10:09'),
(128, 6, 'login', NULL, NULL, '[object Object]', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '2025-06-02 14:36:24');

-- Drop table if exists `time_logs`
DROP TABLE IF EXISTS `time_logs`;

-- Create table `time_logs`
CREATE TABLE `time_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_id` int NOT NULL,
  `user_id` int NOT NULL,
  `hours_logged` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `logged_date` date NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_logged_date` (`logged_date`),
  CONSTRAINT `time_logs_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `time_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop table if exists `team_member_skills`
DROP TABLE IF EXISTS `team_member_skills`;

-- Create table `team_member_skills`
CREATE TABLE `team_member_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `skill_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proficiency_level` enum('Beginner','Intermediate','Advanced','Expert') COLLATE utf8mb4_unicode_ci NOT NULL,
  `years_experience` decimal(3,1) DEFAULT '0.0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_project_skill` (`user_id`,`project_id`,`skill_name`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_skill_name` (`skill_name`),
  CONSTRAINT `team_member_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_member_skills_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop table if exists `team_member_capacity`
DROP TABLE IF EXISTS `team_member_capacity`;

-- Create table `team_member_capacity`
CREATE TABLE `team_member_capacity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sprint_id` int NOT NULL,
  `available_hours` decimal(5,2) DEFAULT '40.00',
  `capacity_percentage` decimal(5,2) DEFAULT '100.00',
  `story_points_capacity` int DEFAULT '10',
  `skill_tags` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_sprint` (`user_id`,`sprint_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_sprint_id` (`sprint_id`),
  CONSTRAINT `team_member_capacity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_member_capacity_ibfk_2` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop table if exists `risk_heatmap_data`
DROP TABLE IF EXISTS `risk_heatmap_data`;

-- Create table `risk_heatmap_data`
CREATE TABLE `risk_heatmap_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `sprint_id` int DEFAULT NULL,
  `risk_type` enum('workload','dependency','skill_mismatch','timeline','capacity') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` enum('team_member','issue','sprint') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int NOT NULL,
  `risk_level` enum('Low','Medium','High','Critical') COLLATE utf8mb4_unicode_ci NOT NULL,
  `risk_score` decimal(5,2) NOT NULL,
  `risk_factors` json DEFAULT NULL,
  `mitigation_suggestions` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_sprint_id` (`sprint_id`),
  KEY `idx_risk_type` (`risk_type`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_risk_level` (`risk_level`),
  CONSTRAINT `risk_heatmap_data_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `risk_heatmap_data_ibfk_2` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop table if exists `refresh_tokens`
DROP TABLE IF EXISTS `refresh_tokens`;

-- Create table `refresh_tokens`
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `refresh_tokens`
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`) VALUES
(1, 6, '$2a$10$mIjDpAFg/lJgdq4hvHZ5uOEygFOtV.QLUVvdN8wpXRiNLSCsrIicS', '2025-06-08 15:08:38', '2025-06-01 15:08:38'),
(2, 6, '$2a$10$0vqV0d5Qw/GKn25iJk.wY.Zf8k7ejuodKLG50.88JxSGo3DL2s9nK', '2025-06-08 15:30:27', '2025-06-01 15:30:27'),
(3, 7, '$2a$10$tZPPzVQ9prpXrG43aIVL4.ASfy4.LysUcuLij4QsX0HkIfvzenb3a', '2025-06-08 16:51:55', '2025-06-01 16:51:55'),
(4, 7, '$2a$10$7kRMlBbA/UreHMwKOWzPP.8coWn5d9k.NObD6CVQELWRB6kF0mlIm', '2025-06-08 16:52:02', '2025-06-01 16:52:02'),
(5, 7, '$2a$10$mzPtiUsOKbLfnFDY3uLZFOWEVjUURvVUBKMRqOfGcWKBD5sCm8.U.', '2025-06-08 16:56:36', '2025-06-01 16:56:36'),
(6, 7, '$2a$10$9ARqtH058ivxyrStBqw2IerEmvCmJV.eU2NuhyDEIjauRhvRBJzFu', '2025-06-08 16:56:43', '2025-06-01 16:56:43'),
(7, 9, '$2a$10$QlMdV..qGqXM481enPSFk.Ee7cRsL07UTmLkdLzmPaKmz57qmMGm.', '2025-06-08 18:04:17', '2025-06-01 18:04:17'),
(8, 9, '$2a$10$j/m18vTCZK8qvXO0Y4lxPup4Mcl7mps14mobeFnfOoNkXnqVpinc6', '2025-06-08 18:05:27', '2025-06-01 18:05:27'),
(9, 9, '$2a$10$4EGHRAvCZhNdmShMcoyo7OQ/OjFb5.ZT6igJjIx5Q1b7TBvI71DQi', '2025-06-08 18:12:11', '2025-06-01 18:12:11'),
(10, 6, '$2a$10$96gZPdtgD4fS2Qi57SX2weo91LQk8Es7pEGh0VZR2phMhHrU53iTC', '2025-06-08 18:17:56', '2025-06-01 18:17:56'),
(11, 6, '$2a$10$MaLD8jOL6JlPQakh3/hlz.0Rba4TYe76XvcjB.mjZMrNTf48wtT1m', '2025-06-08 18:29:33', '2025-06-01 18:29:33'),
(12, 6, '$2a$10$wXCrmlyrH3Jnm8JOa1qtJ.ADw/xWH1EP43p9vYx2Y43rcFZgcPJQ6', '2025-06-09 00:58:56', '2025-06-02 00:58:56'),
(13, 6, '$2a$10$y4AKEbvrG.X4ORjCbpBgK.sA.39CPnFNFpyv8f3itWzXeqAMEo2B6', '2025-06-09 01:27:47', '2025-06-02 01:27:47'),
(14, 6, '$2a$10$sJF5LdC7mqEkP0WUt7fgKe7ZferT4mMOOKSEpGWmMFR1b.1egvi3C', '2025-06-09 04:49:30', '2025-06-02 04:49:30'),
(15, 6, '$2a$10$i1UthuB0uT9gzBQoz2z4k.JlKaC4ayFXl2jS9EC2dGuIiWAtw1FXu', '2025-06-09 05:20:17', '2025-06-02 05:20:17'),
(16, 6, '$2a$10$tKUL25QcqDMMH5tQMqcMMelR8LRmRutrMHNAnp3I0Y6usM54MhaXG', '2025-06-09 05:33:13', '2025-06-02 05:33:13'),
(17, 6, '$2a$10$bbiFGt7lBofvJbZuJc7cYuh/HguPk6cGx0h6Yyl0k7NboAPBYPd6u', '2025-06-09 05:33:44', '2025-06-02 05:33:44'),
(18, 6, '$2a$10$RrH2EPiEPY.l6EzpZVJwc.LuQpKFuedBkAoI31mYZji6o7Uac5vv6', '2025-06-09 05:34:10', '2025-06-02 05:34:10'),
(19, 6, '$2a$10$3DHAkA40Eot5jgqji3yX3uNre4HPAPmUcI3UXPpDFD1rw3dIWrY16', '2025-06-09 05:34:31', '2025-06-02 05:34:31'),
(20, 6, '$2a$10$bAcSE0DiHzstRXn3Mw0kOuhiWHoTAphqj82qiNzU/SyW0wjyV0BEu', '2025-06-09 05:59:06', '2025-06-02 05:59:06'),
(21, 6, '$2a$10$EeM3HAkZMKe3F9B4Z63x5OxNPoW08dhr8jzHrPcOjoL4QItWH0T4m', '2025-06-09 06:01:44', '2025-06-02 06:01:44'),
(22, 6, '$2a$10$RQjnAKfaH.ljHtF1iAZ4J.f/yfRPOM08/mzZo3cGPaXJ3PUn21UD.', '2025-06-09 09:06:24', '2025-06-02 09:06:24');

-- Drop table if exists `issue_comments`
DROP TABLE IF EXISTS `issue_comments`;

-- Create table `issue_comments`
CREATE TABLE `issue_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issue_id` (`issue_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `issue_comments_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `issue_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop table if exists `issues`
DROP TABLE IF EXISTS `issues`;

-- Create table `issues`
CREATE TABLE `issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `sprint_id` int DEFAULT NULL,
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `issue_type` enum('Story','Bug','Task','Epic') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Story',
  `status` enum('To Do','In Progress','Done','Blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'To Do',
  `priority` enum('P1','P2','P3','P4') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'P3',
  `story_points` int DEFAULT NULL,
  `original_estimate` int DEFAULT NULL,
  `time_spent` int DEFAULT '0',
  `time_remaining` int DEFAULT NULL,
  `assignee_id` int DEFAULT NULL,
  `reporter_id` int NOT NULL,
  `blocked_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `issue_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_board_id` (`board_id`),
  KEY `idx_sprint_id` (`sprint_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assignee_id` (`assignee_id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_issue_type` (`issue_type`),
  KEY `idx_issue_order` (`issue_order`),
  CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `issues_ibfk_2` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`) ON DELETE SET NULL,
  CONSTRAINT `issues_ibfk_3` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `issues_ibfk_4` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `issues`
INSERT INTO `issues` (`id`, `board_id`, `sprint_id`, `title`, `description`, `issue_type`, `status`, `priority`, `story_points`, `original_estimate`, `time_spent`, `time_remaining`, `assignee_id`, `reporter_id`, `blocked_reason`, `created_at`, `updated_at`, `issue_order`) VALUES
(1, 1, 1, 'Set up project structure and dependencies', 'Initialize Node.js backend and React frontend with all required dependencies', 'Task', 'Done', 'P1', 5, 8, 6, 0, 2, 1, NULL, '2025-06-01 20:34:52', '2025-06-01 20:34:52', 0),
(2, 1, 1, 'Implement user authentication system', 'Create JWT-based authentication with registration, login, and email verification', 'Story', 'In Progress', 'P1', 8, 12, 4, 8, 3, 1, NULL, '2025-06-01 20:34:53', '2025-06-01 20:34:53', 0),
(3, 1, 1, 'Design database schema', 'Create comprehensive database schema for all entities', 'Task', 'Done', 'P2', 3, 4, 4, 0, 4, 1, NULL, '2025-06-01 20:34:53', '2025-06-01 20:34:53', 0),
(4, 1, 1, 'Set up CI/CD pipeline', 'Configure automated testing and deployment pipeline', 'Task', 'To Do', 'P3', 5, 6, 0, 6, 2, 1, NULL, '2025-06-01 20:34:53', '2025-06-01 20:34:53', 0),
(5, 4, NULL, 'Complete authentication', 'Complete auth with oAuth', 'Story', 'To Do', 'P3', NULL, NULL, 0, NULL, NULL, 6, NULL, '2025-06-02 07:49:17', '2025-06-02 07:49:17', 1),
(6, 1, 4, 'Implement user authentication system', 'Critical task to set up user authentication for the system', 'Story', 'To Do', 'P2', 8, 40, 0, NULL, 1, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0),
(7, 1, 4, 'Create dashboard UI components', 'High priority task to design and implement UI components for the dashboard', 'Story', 'To Do', 'P2', 8, 40, 0, NULL, 2, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0),
(8, 1, 4, 'Setup database migrations', 'Medium task to configure database migrations for the system', 'Story', 'To Do', 'P2', 6, 30, 0, NULL, 3, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0),
(9, 1, 4, 'Write unit tests for authentication', 'Low priority task to create unit tests for the authentication system', 'Story', 'To Do', 'P2', 4, 20, 0, NULL, 4, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0),
(10, 1, 4, 'Implement API rate limiting', 'Task to set up API rate limiting for the system', 'Story', 'To Do', 'P2', 5, 25, 0, NULL, 7, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0),
(11, 1, 4, 'Create user profile management', 'High priority task to develop user profile management functionality', 'Story', 'To Do', 'P2', 8, 40, 0, NULL, 9, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0),
(12, 1, 4, 'Setup CI/CD pipeline', 'Medium task to configure continuous integration and deployment pipeline', 'Story', 'To Do', 'P2', 6, 30, 0, NULL, 6, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0),
(13, 1, 4, 'Add email notification system', 'Low priority task to integrate email notification system', 'Story', 'To Do', 'P2', 5, 25, 0, NULL, 6, 6, NULL, '2025-06-02 11:17:29', '2025-06-02 11:17:29', 0);

-- Drop table if exists `sprints`
DROP TABLE IF EXISTS `sprints`;

-- Create table `sprints`
CREATE TABLE `sprints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `goal` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `capacity_story_points` int DEFAULT NULL,
  `status` enum('Planning','Active','Completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Planning',
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `sprints`
INSERT INTO `sprints` (`id`, `board_id`, `name`, `goal`, `start_date`, `end_date`, `capacity_story_points`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Sprint 1 - Foundation', 'Set up project foundation and basic authentication', '2023-12-31 18:30:00', '2024-01-13 18:30:00', 40, 'Active', 1, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(2, 1, 'Sprint 2 - Core Features', 'Implement core project and board management features', '2024-01-14 18:30:00', '2024-01-27 18:30:00', 45, 'Planning', 1, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(3, 4, 'Sprint-1', 'Complete Backend', '2025-06-01 18:30:00', '2025-06-08 18:30:00', 40, 'Planning', 6, '2025-06-02 07:44:20', '2025-06-02 07:44:20'),
(4, 1, 'Authentication System Sprint', 'Implement user authentication, create dashboard UI, and setup database migrations', '2025-06-01 18:30:00', '2025-06-08 18:30:00', 40, 'Active', 6, '2025-06-02 11:17:29', '2025-06-02 11:17:29');

-- Drop table if exists `email_verifications`
DROP TABLE IF EXISTS `email_verifications`;

-- Create table `email_verifications`
CREATE TABLE `email_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drop table if exists `email_otps`
DROP TABLE IF EXISTS `email_otps`;

-- Create table `email_otps`
CREATE TABLE `email_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` int DEFAULT '0',
  `created_at_ts` bigint NOT NULL,
  `expires_at_ts` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_email_otp` (`email`,`otp`),
  KEY `idx_user_email` (`user_id`,`email`),
  CONSTRAINT `email_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `email_otps`
INSERT INTO `email_otps` (`id`, `user_id`, `email`, `otp`, `attempts`, `created_at_ts`, `expires_at_ts`) VALUES
(20, 6, '9shubhampawar9@gmail.com', '430879', 0, 1748810284, 1748810314),
(21, 6, '9shubhampawar9@gmail.com', '737932', 0, 1748810287, 1748810314),
(22, 7, 'test@example.com', '949655', 0, 1748816387, 1748816505),
(23, 7, 'test@example.com', '299224', 0, 1748816397, 1748816505),
(24, 8, 'aitest@example.com', '813519', 0, 1748820688, 1748824288),
(25, 8, 'aitest@example.com', '258038', 0, 1748820691, 1748824291);

-- Drop table if exists `board_columns`
DROP TABLE IF EXISTS `board_columns`;

-- Create table `board_columns`
CREATE TABLE `board_columns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_mapping` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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

-- Drop table if exists `boards`
DROP TABLE IF EXISTS `boards`;

-- Create table `boards`
CREATE TABLE `boards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `boards`
INSERT INTO `boards` (`id`, `project_id`, `name`, `description`, `is_default`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'ASMA Development Board', 'Main development board for AI Sprint Management App', 1, 1, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(2, 2, 'E-commerce Main Board', 'Primary board for e-commerce platform development', 1, 2, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(3, 3, 'Banking App Board', 'Development board for mobile banking application', 1, 3, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(4, 4, 'Main Board', 'Default board for project', 1, 6, '2025-06-01 20:40:42', '2025-06-01 20:40:42'),
(5, 4, 'Board 1', 'This is the board 1', 0, 6, '2025-06-01 20:41:23', '2025-06-01 20:41:23'),
(6, 4, 'devrelopment', NULL, 0, 6, '2025-06-01 21:13:33', '2025-06-01 21:13:33'),
(7, 5, 'Main Board', 'Default board for project', 1, 7, '2025-06-01 22:23:31', '2025-06-01 22:23:31'),
(8, 6, 'Main Board', 'Default board for project', 1, 7, '2025-06-01 22:23:40', '2025-06-01 22:23:40');

-- Drop table if exists `ai_requests`
DROP TABLE IF EXISTS `ai_requests`;

-- Create table `ai_requests`
CREATE TABLE `ai_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `feature` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_data` json DEFAULT NULL,
  `response_data` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_feature` (`feature`),
  CONSTRAINT `ai_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ai_requests_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `ai_requests`
INSERT INTO `ai_requests` (`id`, `user_id`, `project_id`, `feature`, `request_data`, `response_data`, `created_at`) VALUES
(1, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 04:15:25'),
(2, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 04:15:30'),
(3, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 04:15:32'),
(4, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 04:16:15'),
(5, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 04:16:17'),
(6, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 04:16:19'),
(7, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 04:16:21'),
(8, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 04:16:23'),
(9, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 04:16:47'),
(10, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 04:17:14'),
(11, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 04:17:17'),
(12, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 04:17:21'),
(13, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 04:17:24'),
(14, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 06:32:05'),
(15, 6, 1, 'sprint_planning', '[object Object]', '[object Object]', '2025-06-02 07:16:44'),
(16, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 10:40:08'),
(17, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 10:42:03'),
(18, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 10:52:28'),
(19, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:04:36'),
(20, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:05:43'),
(21, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:11:40'),
(22, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:12:56'),
(23, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:14:00'),
(24, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:19:57'),
(25, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:20:07'),
(26, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:21:14'),
(27, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:29:37'),
(28, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:31:59'),
(29, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:33:36'),
(30, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:35:05'),
(31, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:36:34'),
(32, 6, 1, 'sprint_creation_plan', '[object Object]', '[object Object]', '2025-06-02 11:40:07'),
(33, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:13:38'),
(34, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:16:06'),
(35, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:24:11'),
(36, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:25:54'),
(37, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:32:31'),
(38, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:40:52'),
(39, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:45:00'),
(40, 6, 1, 'scope_creep_detection', '[object Object]', '[object Object]', '2025-06-02 12:45:18'),
(41, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 12:52:51'),
(42, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 12:55:20'),
(43, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 12:56:50'),
(44, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 12:59:48'),
(45, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 13:01:34'),
(46, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 13:01:43'),
(47, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 13:05:08'),
(48, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 13:07:40'),
(49, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 13:08:50'),
(50, 6, 1, 'retrospective_insights', '[object Object]', '[object Object]', '2025-06-02 13:09:40'),
(51, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 13:17:19'),
(52, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 13:46:14'),
(53, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 13:48:09'),
(54, 6, 1, 'risk_assessment', '[object Object]', '[object Object]', '2025-06-02 14:10:08');

-- Drop table if exists `projects`
DROP TABLE IF EXISTS `projects`;

-- Create table `projects`
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `project_key` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `projects`
INSERT INTO `projects` (`id`, `name`, `description`, `project_key`, `owner_id`, `ai_requests_count`, `ai_requests_reset_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'AI Sprint Management App', 'Main project for developing the AI-powered sprint management tool', 'ASMA', 6, 54, '2025-06-01 18:30:00', 1, '2025-06-01 20:34:52', '2025-06-02 14:10:08'),
(2, 'E-commerce Platform', 'Building a modern e-commerce platform with React and Node.js', 'ECOM', 2, 0, '2025-06-01 18:30:00', 1, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(3, 'Mobile Banking App', 'Secure mobile banking application development', 'MBA', 3, 0, '2025-06-01 18:30:00', 1, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(4, 'E-commerce Platform', 'This is ecommerce platform for Services', 'ECOMME', 6, 0, '2025-06-01 18:30:00', 1, '2025-06-01 20:40:42', '2025-06-01 20:40:42'),
(5, 'Test Project', 'Test project for AI features', 'TESTPR', 7, 0, '2025-06-01 18:30:00', 1, '2025-06-01 22:23:31', '2025-06-01 22:23:31'),
(6, 'Test Project', 'Test project for AI features', 'TESTPR1', 7, 0, '2025-06-01 18:30:00', 1, '2025-06-01 22:23:40', '2025-06-01 22:23:40'),
(7, 'AI Test Project', 'Project for testing AI features', 'AITEST', 9, 0, '2025-06-01 18:30:00', 1, '2025-06-01 23:33:35', '2025-06-01 23:33:35');

-- Drop table if exists `users`
DROP TABLE IF EXISTS `users`;

-- Create table `users`
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_email_verified` (`email_verified`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting data into `users`
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `email_verified`, `password_reset_token`, `password_reset_expires`, `avatar_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@sprintmanager.com', '$2a$12$118/0CZTcbTrbZEX63KNlub7NWIXAl/xeJNP9b1krau9NjJTbpVLa', 'Admin', 'User', 1, NULL, NULL, NULL, 1, '2025-06-01 20:34:50', '2025-06-01 20:34:50'),
(2, 'john.doe@example.com', '$2a$12$0yIjQA2IrPH6zSCTAq4rCuvIcvohA4vfF7CTX6uKutnrZuK.igTaS', 'John', 'Doe', 1, NULL, NULL, NULL, 1, '2025-06-01 20:34:51', '2025-06-01 20:34:51'),
(3, 'jane.smith@example.com', '$2a$12$WmRZx/an6RTJy8lmGTbwJuvatXZW.nzvo6V8mIAsPsMZbXFO66mTa', 'Jane', 'Smith', 1, NULL, NULL, NULL, 1, '2025-06-01 20:34:51', '2025-06-01 20:34:51'),
(4, 'mike.wilson@example.com', '$2a$12$1gv/IU6JXlhOcD1dkQQunOkRItbmwogmDTj/.wmXz/mBznfcuAvFK', 'Mike', 'Wilson', 1, NULL, NULL, NULL, 1, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(5, 'sarah.johnson@example.com', '$2a$12$Mh3a4ZEQgMQNLSUqA11LkOT8k8vWiH84s9smuqjCu9knt.LdN0ndy', 'Sarah', 'Johnson', 0, NULL, NULL, NULL, 1, '2025-06-01 20:34:52', '2025-06-01 20:34:52'),
(6, '9shubhampawar9@gmail.com', '$2a$12$kVmRYiDhaf4PfZRO8zhuf.lnuorw1BGu188WfPVLkq8b7Ob/tb.1.', 'Shubham', 'Pawar', 1, NULL, NULL, NULL, 1, '2025-06-01 20:38:04', '2025-06-01 20:38:34'),
(7, 'test@example.com', '$2a$12$H4s3RMUt6x359NbO7aDQKOl/Bfz47OeNfykoL0e3cA8epoCbqDO/G', 'Test', 'User', 1, NULL, NULL, NULL, 1, '2025-06-01 22:19:47', '2025-06-01 22:21:45'),
(8, 'aitest@example.com', '$2a$12$fHx4Y3d/UrOKNnI4eXlRAOgSJjh9tSLTh/lDvDhXQw3u2n5j96wmS', 'AI', 'Tester', 0, NULL, NULL, NULL, 1, '2025-06-01 23:31:28', '2025-06-01 23:31:28'),
(9, 'testuser@example.com', '$2b$12$yh/rNSR5WXHiHbygz9Nkxuz4eSVl3wBMHe5/QgcaQFWRpOu5L60qi', 'Test', 'User', 1, NULL, NULL, NULL, 1, '2025-06-01 23:33:35', '2025-06-01 23:33:35');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;
