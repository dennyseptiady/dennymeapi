-- Migration: 003_create_profile_tables.sql
-- Description: Create profile and related tables (education, experience, projects, skills)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cms_profile
-- ----------------------------
DROP TABLE IF EXISTS `cms_profile`;
CREATE TABLE `cms_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `linkedin_profile` varchar(255) DEFAULT NULL,
  `github_profile` varchar(255) DEFAULT NULL,
  `instagram_profile` varchar(255) DEFAULT NULL,
  `tiktok_profile` varchar(255) DEFAULT NULL,
  `x_profile` varchar(255) DEFAULT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `years_of_experience` int(11) DEFAULT 0,
  `current_job_title` varchar(100) DEFAULT NULL,
  `preferred_tech_stack` text DEFAULT NULL,
  `certifications` text DEFAULT NULL,
  `resume_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_full_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for cms_profile_educations
-- ----------------------------
DROP TABLE IF EXISTS `cms_profile_educations`;
CREATE TABLE `cms_profile_educations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL,
  `degree` varchar(255) NOT NULL,
  `major` varchar(255) DEFAULT NULL,
  `institution_name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `graduation_year` int(11) DEFAULT NULL,
  `start_year` int(11) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `profile_id` (`profile_id`),
  KEY `idx_graduation_year` (`graduation_year`),
  CONSTRAINT `cms_profile_educations_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `cms_profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for cms_profile_experiences
-- ----------------------------
DROP TABLE IF EXISTS `cms_profile_experiences`;
CREATE TABLE `cms_profile_experiences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL,
  `job_title` varchar(255) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `is_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `profile_id` (`profile_id`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_is_current` (`is_current`),
  CONSTRAINT `cms_profile_experiences_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `cms_profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for cms_profile_projects
-- ----------------------------
DROP TABLE IF EXISTS `cms_profile_projects`;
CREATE TABLE `cms_profile_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `skills_id` varchar(255) NOT NULL COMMENT 'Bisa lebih dari 1 id dengan tambahan koma',
  `picture` varchar(255) DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `link_demo` varchar(255) DEFAULT NULL,
  `link_code` varchar(255) DEFAULT NULL,
  `link_youtube` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `is_delete` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT 0,
  `updated_by` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_profile_id` (`profile_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_projects_profile` FOREIGN KEY (`profile_id`) REFERENCES `cms_profile` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_projects_category` FOREIGN KEY (`category_id`) REFERENCES `cms_m_category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for cms_profile_skills
-- ----------------------------
DROP TABLE IF EXISTS `cms_profile_skills`;
CREATE TABLE `cms_profile_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `skill_id` int(11) DEFAULT NULL,
  `percent` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `is_delete` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT 0,
  `updated_by` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_profile_id` (`profile_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_profile_skills_profile` FOREIGN KEY (`profile_id`) REFERENCES `cms_profile` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_profile_skills_category` FOREIGN KEY (`category_id`) REFERENCES `cms_m_category` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_profile_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `cms_m_skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1; 