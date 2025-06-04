-- Migration: 004_insert_sample_data.sql
-- Description: Insert sample data for testing and demonstration

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Insert sample profile data
-- ----------------------------
INSERT INTO `cms_profile` (`full_name`, `email`, `phone_number`, `linkedin_profile`, `github_profile`, `instagram_profile`, `tiktok_profile`, `x_profile`, `profile_picture_url`, `bio`, `years_of_experience`, `current_job_title`, `preferred_tech_stack`, `certifications`, `resume_url`) VALUES 
('Denny Septiady', 'dennyseptiady2012@gmail.com', '089601813650', 'https://linkedin.com/in/dennyseptiady', 'https://github.com/dennyseptiady', 'https://instagram.com/dennyseptiady', NULL, NULL, NULL, 'Full-stack developer with 5+ years of experience in web development, specialized in React.js, Node.js, and modern web technologies.', 5, 'Senior Full Stack Developer', 'React.js, Node.js, Express.js, MySQL, MongoDB, Tailwind CSS', 'AWS Certified Developer, Google Cloud Professional', NULL),
('John Doe', 'john.doe@example.com', '081234567890', 'https://linkedin.com/in/johndoe', 'https://github.com/johndoe', NULL, NULL, NULL, NULL, 'Frontend developer specializing in React.js and modern JavaScript frameworks', 3, 'Frontend Developer', 'React.js, Vue.js, JavaScript, CSS3, HTML5', 'React Developer Certification', NULL);

-- ----------------------------
-- Insert sample education data
-- ----------------------------
INSERT INTO `cms_profile_educations` (`profile_id`, `degree`, `major`, `institution_name`, `location`, `graduation_year`, `start_year`, `gpa`, `description`) VALUES 
(1, 'Bachelor of Computer Science', 'Software Engineering', 'University of Technology Jakarta', 'Jakarta, Indonesia', 2019, 2015, 3.75, 'Focused on software engineering, data structures, and web development technologies.'),
(1, 'Master of Science', 'Information Systems', 'Institute of Technology Bandung', 'Bandung, Indonesia', 2021, 2019, 3.85, 'Specialized in advanced web technologies and system architecture.'),
(2, 'Bachelor of Information Technology', 'Computer Science', 'State University of Surabaya', 'Surabaya, Indonesia', 2020, 2016, 3.60, 'Focused on web development and mobile application development.');

-- ----------------------------
-- Insert sample experience data
-- ----------------------------
INSERT INTO `cms_profile_experiences` (`profile_id`, `job_title`, `company_name`, `location`, `start_date`, `end_date`, `description`, `is_current`, `is_delete`) VALUES 
(1, 'Senior Full Stack Developer', 'Tech Innovation Ltd', 'Jakarta, Indonesia', '2022-01-01', NULL, 'Leading development team, implementing modern web technologies, and architecting scalable solutions using React.js, Node.js, and cloud technologies.', 1, 0),
(1, 'Full Stack Developer', 'Digital Solutions Inc', 'Jakarta, Indonesia', '2020-06-01', '2021-12-31', 'Developed responsive web applications using React.js, Express.js, and MySQL. Collaborated with cross-functional teams to deliver high-quality software solutions.', 0, 0),
(1, 'Frontend Developer', 'Startup Creative', 'Jakarta, Indonesia', '2019-03-01', '2020-05-31', 'Created user interfaces using React.js and modern CSS frameworks. Improved application performance and user experience.', 0, 0),
(2, 'Frontend Developer', 'Web Agency Pro', 'Surabaya, Indonesia', '2021-01-01', NULL, 'Developing modern web interfaces using React.js and Vue.js. Working closely with design team to implement pixel-perfect designs.', 1, 0);

-- ----------------------------
-- Insert sample profile skills data
-- ----------------------------
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

SET FOREIGN_KEY_CHECKS = 1; 