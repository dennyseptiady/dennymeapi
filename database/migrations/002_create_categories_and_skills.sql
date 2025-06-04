-- Migration: 002_create_categories_and_skills.sql
-- Description: Create categories and skills master tables

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cms_m_category
-- ----------------------------
DROP TABLE IF EXISTS `cms_m_category`;
CREATE TABLE `cms_m_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL,
  `description` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT 0,
  `updated_by` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for cms_m_skills
-- ----------------------------
DROP TABLE IF EXISTS `cms_m_skills`;
CREATE TABLE `cms_m_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `description` varchar(150) DEFAULT NULL,
  `icon` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT 0,
  `updated_by` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_skills_category` FOREIGN KEY (`category_id`) REFERENCES `cms_m_category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Insert default categories
-- ----------------------------
INSERT INTO `cms_m_category` (`name`, `description`, `is_active`, `is_deleted`, `created_by`, `updated_by`) VALUES 
('Frontend Development', 'Technologies and frameworks for frontend development', 1, 0, 1, 1),
('Backend Development', 'Technologies and backend Development', 1, 0, 1, 1),
('Mobile Development', 'Technologies for mobile app development', 1, 0, 1, 1),
('DevOps & Cloud', 'DevOps tools and cloud technologies', 1, 0, 1, 1);

-- ----------------------------
-- Insert default skills
-- ----------------------------
INSERT INTO `cms_m_skills` (`category_id`, `name`, `description`, `icon`, `is_active`, `is_deleted`, `created_by`, `updated_by`) VALUES 
(1, 'React.js', 'A JavaScript library for building user interfaces', 'react-icon.svg', 1, 0, 1, 1),
(1, 'Vue.js', 'The Progressive JavaScript Framework', 'vue-icon.svg', 1, 0, 1, 1),
(1, 'Tailwind CSS', 'A utility-first CSS framework', 'tailwind-icon.svg', 1, 0, 1, 1),
(1, 'Javascript', 'The programming language of the web', 'javascript-icon.svg', 1, 0, 1, 1),
(1, 'Bootstrap', 'The most popular CSS framework', 'bootstrap-icon.svg', 1, 0, 1, 1),
(2, 'Laravel', 'The PHP Framework for Web Artisans', 'laravel-icon.svg', 1, 0, 1, 1),
(2, 'Codeigniter', 'A PHP framework with small footprint', 'codeigniter-icon.svg', 1, 0, 1, 1),
(2, 'Node.js', 'JavaScript runtime built on Chrome V8 engine', 'nodejs-icon.svg', 1, 0, 1, 1),
(2, 'Express.js', 'Fast, unopinionated web framework for Node.js', 'express-icon.svg', 1, 0, 1, 1),
(2, 'MySQL', 'The world most popular open source database', 'mysql-icon.svg', 1, 0, 1, 1),
(2, 'MongoDB', 'The document database for modern applications', 'mongodb-icon.svg', 1, 0, 1, 1);

SET FOREIGN_KEY_CHECKS = 1; 