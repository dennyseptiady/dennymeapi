-- Create profile table
CREATE TABLE IF NOT EXISTS cms_profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  linkedin_profile VARCHAR(255),
  github_profile VARCHAR(255),
  instagram_profile VARCHAR(255),
  tiktok_profile VARCHAR(255),
  x_profile VARCHAR(255),
  profile_picture_url VARCHAR(255),
  bio TEXT,
  years_of_experience INT DEFAULT 0,
  current_job_title VARCHAR(100),
  preferred_tech_stack TEXT,
  certifications TEXT,
  resume_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_profile_email ON cms_profile(email);

-- Create index on full_name for search functionality
CREATE INDEX idx_profile_full_name ON cms_profile(full_name); 