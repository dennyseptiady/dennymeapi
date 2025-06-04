-- ========================================
-- RAILWAY DATABASE MIGRATIONS
-- API CMS DennyMe - Complete Database Setup
-- ========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- MIGRATION 001: CREATE USERS TABLE
-- ========================================

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default admin user
INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_active`) VALUES 
('Administrator', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'admin', 1);

-- ========================================
-- MIGRATION 002: CREATE CATEGORIES AND SKILLS
-- ========================================

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

-- Insert default categories
INSERT INTO `cms_m_category` (`name`, `description`, `is_active`, `is_deleted`, `created_by`, `updated_by`) VALUES 
('Frontend Development', 'Technologies and frameworks for frontend development', 1, 0, 1, 1),
('Backend Development', 'Technologies and backend Development', 1, 0, 1, 1),
('Mobile Development', 'Technologies for mobile app development', 1, 0, 1, 1),
('DevOps & Cloud', 'DevOps tools and cloud technologies', 1, 0, 1, 1);

-- Insert default skills
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

-- ========================================
-- MIGRATION 003: CREATE PROFILE TABLES
-- ========================================

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

-- ========================================
-- MIGRATION 004: INSERT SAMPLE DATA
-- ========================================

-- Insert sample profile data
INSERT INTO `cms_profile` (`full_name`, `email`, `phone_number`, `linkedin_profile`, `github_profile`, `instagram_profile`, `tiktok_profile`, `x_profile`, `profile_picture_url`, `bio`, `years_of_experience`, `current_job_title`, `preferred_tech_stack`, `certifications`, `resume_url`) VALUES 
('Denny Septiady', 'dennyseptiady2012@gmail.com', '089601813650', 'https://linkedin.com/in/dennyseptiady', 'https://github.com/dennyseptiady', 'https://instagram.com/dennyseptiady', NULL, NULL, NULL, 'Full-stack developer with 5+ years of experience in web development, specialized in React.js, Node.js, and modern web technologies.', 5, 'Senior Full Stack Developer', 'React.js, Node.js, Express.js, MySQL, MongoDB, Tailwind CSS', 'AWS Certified Developer, Google Cloud Professional', NULL),
('John Doe', 'john.doe@example.com', '081234567890', 'https://linkedin.com/in/johndoe', 'https://github.com/johndoe', NULL, NULL, NULL, NULL, 'Frontend developer specializing in React.js and modern JavaScript frameworks', 3, 'Frontend Developer', 'React.js, Vue.js, JavaScript, CSS3, HTML5', 'React Developer Certification', NULL);

-- Insert sample education data
INSERT INTO `cms_profile_educations` (`profile_id`, `degree`, `major`, `institution_name`, `location`, `graduation_year`, `start_year`, `gpa`, `description`) VALUES 
(1, 'Bachelor of Computer Science', 'Software Engineering', 'University of Technology Jakarta', 'Jakarta, Indonesia', 2019, 2015, 3.75, 'Focused on software engineering, data structures, and web development technologies.'),
(1, 'Master of Science', 'Information Systems', 'Institute of Technology Bandung', 'Bandung, Indonesia', 2021, 2019, 3.85, 'Specialized in advanced web technologies and system architecture.'),
(2, 'Bachelor of Information Technology', 'Computer Science', 'State University of Surabaya', 'Surabaya, Indonesia', 2020, 2016, 3.60, 'Focused on web development and mobile application development.');

-- Insert sample experience data
INSERT INTO `cms_profile_experiences` (`profile_id`, `job_title`, `company_name`, `location`, `start_date`, `end_date`, `description`, `is_current`, `is_delete`) VALUES 
(1, 'Senior Full Stack Developer', 'Tech Innovation Ltd', 'Jakarta, Indonesia', '2022-01-01', NULL, 'Leading development team, implementing modern web technologies, and architecting scalable solutions using React.js, Node.js, and cloud technologies.', 1, 0),
(1, 'Full Stack Developer', 'Digital Solutions Inc', 'Jakarta, Indonesia', '2020-06-01', '2021-12-31', 'Developed responsive web applications using React.js, Express.js, and MySQL. Collaborated with cross-functional teams to deliver high-quality software solutions.', 0, 0),
(1, 'Frontend Developer', 'Startup Creative', 'Jakarta, Indonesia', '2019-03-01', '2020-05-31', 'Created user interfaces using React.js and modern CSS frameworks. Improved application performance and user experience.', 0, 0),
(2, 'Frontend Developer', 'Web Agency Pro', 'Surabaya, Indonesia', '2021-01-01', NULL, 'Developing modern web interfaces using React.js and Vue.js. Working closely with design team to implement pixel-perfect designs.', 1, 0);

-- Insert sample profile skills data
INSERT INTO `cms_profile_skills` (`profile_id`, `category_id`, `skill_id`, `percent`, `is_active`, `is_delete`, `created_by`, `updated_by`) VALUES 
-- Denny's Frontend Skills
(1, 1, 1, 95, 1, 0, 1, 1), -- React.js
(1, 1, 2, 85, 1, 0, 1, 1), -- Vue.js
(1, 1, 3, 90, 1, 0, 1, 1), -- Tailwind CSS
(1, 1, 4, 92, 1, 0, 1, 1), -- Javascript
(1, 1, 5, 88, 1, 0, 1, 1), -- Bootstrap

-- Denny's Backend Skills
(1, 2, 8, 93, 1, 0, 1, 1), -- Node.js
(1, 2, 9, 90, 1, 0, 1, 1), -- Express.js
(1, 2, 10, 85, 1, 0, 1, 1), -- MySQL
(1, 2, 11, 80, 1, 0, 1, 1), -- MongoDB
(1, 2, 6, 75, 1, 0, 1, 1), -- Laravel

-- John's Frontend Skills
(2, 1, 1, 88, 1, 0, 1, 1), -- React.js
(2, 1, 2, 82, 1, 0, 1, 1), -- Vue.js
(2, 1, 4, 90, 1, 0, 1, 1), -- Javascript
(2, 1, 5, 85, 1, 0, 1, 1); -- Bootstrap

-- ========================================
-- COMPLETE DATABASE SETUP
-- ========================================

SET FOREIGN_KEY_CHECKS = 1;

-- Show all created tables
SHOW TABLES; 