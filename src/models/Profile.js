const { pool } = require('../config/database');

class Profile {
  constructor(data) {
    this.id = data.id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.linkedin_profile = data.linkedin_profile;
    this.github_profile = data.github_profile;
    this.instagram_profile = data.instagram_profile;
    this.tiktok_profile = data.tiktok_profile;
    this.x_profile = data.x_profile;
    this.profile_picture_url = data.profile_picture_url;
    this.bio = data.bio;
    this.years_of_experience = data.years_of_experience;
    this.current_job_title = data.current_job_title;
    this.preferred_tech_stack = data.preferred_tech_stack;
    this.certifications = data.certifications;
    this.resume_url = data.resume_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Helper function to safely parse integers for SQL queries
  static _safeInt(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = parseInt(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Helper function to validate email format
  static _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper function to validate phone number
  static _isValidPhoneNumber(phone) {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Helper function to validate URL
  static _isValidUrl(url) {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Helper function to validate name
  static _isValidName(name) {
    return name && typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 255;
  }

  // Create new profile
  static async create(profileData) {
    try {
      const {
        full_name,
        email,
        phone_number,
        linkedin_profile,
        github_profile,
        instagram_profile,
        tiktok_profile,
        x_profile,
        filename_image,
        bio,
        years_of_experience,
        current_job_title,
        preferred_tech_stack,
        certifications,
        resume_url
      } = profileData;

      // Validate required fields
      if (!this._isValidName(full_name)) {
        throw new Error('Full name must be between 2-255 characters');
      }

      if (!email || !this._isValidEmail(email)) {
        throw new Error('Valid email is required');
      }

      // Validate optional fields
      if (phone_number && !this._isValidPhoneNumber(phone_number)) {
        throw new Error('Invalid phone number format');
      }

      if (linkedin_profile && !this._isValidUrl(linkedin_profile)) {
        throw new Error('Invalid LinkedIn profile URL');
      }

      if (github_profile && !this._isValidUrl(github_profile)) {
        throw new Error('Invalid GitHub profile URL');
      }

      if (instagram_profile && !this._isValidUrl(instagram_profile)) {
        throw new Error('Invalid Instagram profile URL');
      }

      if (tiktok_profile && !this._isValidUrl(tiktok_profile)) {
        throw new Error('Invalid TikTok profile URL');
      }

      if (x_profile && !this._isValidUrl(x_profile)) {
        throw new Error('Invalid X profile URL');
      }

      if (resume_url && !this._isValidUrl(resume_url)) {
        throw new Error('Invalid resume URL');
      }

      if (bio && typeof bio === 'string' && bio.length > 1000) {
        throw new Error('Bio must be less than 1000 characters');
      }

      if (years_of_experience !== null && years_of_experience !== undefined) {
        const safeYears = this._safeInt(years_of_experience, 0, 0, 50);
        if (safeYears < 0 || safeYears > 50) {
          throw new Error('Years of experience must be between 0-50');
        }
      }

      // Check if email already exists
      const existingProfile = await this.findByEmail(email);
      if (existingProfile) {
        throw new Error('Profile with this email already exists');
      }

      const [result] = await pool.execute(
        `INSERT INTO cms_profile (
          full_name, email, phone_number, linkedin_profile, github_profile, 
          instagram_profile, tiktok_profile, x_profile, profile_picture_url, 
          bio, years_of_experience, current_job_title, preferred_tech_stack, 
          certifications, resume_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          full_name.trim(),
          email.toLowerCase().trim(),
          phone_number ? phone_number.trim() : null,
          linkedin_profile ? linkedin_profile.trim() : null,
          github_profile ? github_profile.trim() : null,
          instagram_profile ? instagram_profile.trim() : null,
          tiktok_profile ? tiktok_profile.trim() : null,
          x_profile ? x_profile.trim() : null,
          filename_image ? filename_image.trim() : null,
          bio ? bio.trim() : null,
          years_of_experience ? this._safeInt(years_of_experience, 0, 0, 50) : null,
          current_job_title ? current_job_title.trim() : null,
          preferred_tech_stack ? preferred_tech_stack.trim() : null,
          certifications ? certifications.trim() : null,
          resume_url ? resume_url.trim() : null
        ]
      );

      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Profile with this email already exists');
      }
      console.error('Error in Profile.create:', error);
      throw error;
    }
  }

  // Find profile by ID
  static async findById(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        `SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
         instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
         years_of_experience, current_job_title, preferred_tech_stack, certifications, 
         resume_url, created_at, updated_at 
         FROM cms_profile WHERE id = ?`,
        [safeId]
      );

      return rows.length > 0 ? new Profile(rows[0]) : null;
    } catch (error) {
      console.error('Error in Profile.findById:', error);
      throw error;
    }
  }

  // Find all profiles
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      // Safe parameter handling for MySQL 9.x compatibility
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR phone_number LIKE ? OR current_job_title LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Filter by job title
      if (filters.job_title && typeof filters.job_title === 'string') {
        whereClause += ' AND current_job_title LIKE ?';
        queryParams.push(`%${filters.job_title.trim()}%`);
      }

      // Filter by experience range
      if (filters.min_experience !== undefined) {
        const minExp = this._safeInt(filters.min_experience, 0, 0, 50);
        whereClause += ' AND years_of_experience >= ?';
        queryParams.push(minExp);
      }

      if (filters.max_experience !== undefined) {
        const maxExp = this._safeInt(filters.max_experience, 50, 0, 50);
        whereClause += ' AND years_of_experience <= ?';
        queryParams.push(maxExp);
      }

      // Use string interpolation for LIMIT to avoid MySQL 9.x parameter binding issues
      const query = `
        SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
               instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
               years_of_experience, current_job_title, preferred_tech_stack, certifications, 
               resume_url, created_at, updated_at 
        FROM cms_profile 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, queryParams);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new Profile(row));
    } catch (error) {
      console.error('Error in Profile.findAll:', error);
      throw error;
    }
  }

  // Update profile
  static async update(id, updateData) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid profile ID');
      }

      // Validate and sanitize update data
      const allowedFields = [
        'full_name', 'email', 'phone_number', 'linkedin_profile', 'github_profile',
        'instagram_profile', 'tiktok_profile', 'x_profile', 'profile_picture_url',
        'bio', 'years_of_experience', 'current_job_title', 'preferred_tech_stack',
        'certifications', 'resume_url'
      ];
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          let value = updateData[key];

          // Validate and sanitize each field
          switch (key) {
            case 'full_name':
              if (this._isValidName(value)) {
                fields.push(`${key} = ?`);
                values.push(value.trim());
              }
              break;
            case 'email':
              if (this._isValidEmail(value)) {
                fields.push(`${key} = ?`);
                values.push(value.toLowerCase().trim());
              }
              break;
            case 'phone_number':
              if (value === null || this._isValidPhoneNumber(value)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'linkedin_profile':
            case 'github_profile':
            case 'instagram_profile':
            case 'tiktok_profile':
            case 'x_profile':
            case 'resume_url':
              if (value === null || this._isValidUrl(value)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'profile_picture_url':
              if (value === null || (typeof value === 'string' && value.length <= 500)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'bio':
              if (value === null || (typeof value === 'string' && value.length <= 1000)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'years_of_experience':
              if (value === null || value === undefined) {
                fields.push(`${key} = ?`);
                values.push(null);
              } else {
                const safeYears = this._safeInt(value, 0, 0, 50);
                fields.push(`${key} = ?`);
                values.push(safeYears);
              }
              break;
            case 'current_job_title':
            case 'preferred_tech_stack':
            case 'certifications':
              if (value === null || (typeof value === 'string' && value.length <= 500)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
          }
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // If email is being updated, check for duplicates
      if (updateData.email) {
        const existingProfile = await this.findByEmail(updateData.email);
        if (existingProfile && existingProfile.id !== safeId) {
          throw new Error('Email already exists');
        }
      }

      fields.push('updated_at = NOW()');
      values.push(safeId);

      const [result] = await pool.execute(
        `UPDATE cms_profile SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      console.error('Error in Profile.update:', error);
      throw error;
    }
  }

  // Delete profile
  static async delete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid profile ID');
      }

      // Check if profile has associated data (educations, experiences, etc.)
      const [educationCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_educations WHERE profile_id = ?',
        [safeId]
      );

      const [experienceCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_experiences WHERE profile_id = ?',
        [safeId]
      );

      const [skillCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_skills WHERE profile_id = ?',
        [safeId]
      );

      const [projectCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_projects WHERE profile_id = ?',
        [safeId]
      );

      if (educationCount[0].count > 0 || experienceCount[0].count > 0 || 
          skillCount[0].count > 0 || projectCount[0].count > 0) {
        throw new Error('Cannot delete profile that has associated data. Delete related data first.');
      }

      const [result] = await pool.execute(
        'DELETE FROM cms_profile WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Profile.delete:', error);
      throw error;
    }
  }

  // Get profile count
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR phone_number LIKE ? OR current_job_title LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Filter by job title
      if (filters.job_title && typeof filters.job_title === 'string') {
        whereClause += ' AND current_job_title LIKE ?';
        queryParams.push(`%${filters.job_title.trim()}%`);
      }

      // Filter by experience range
      if (filters.min_experience !== undefined) {
        const minExp = this._safeInt(filters.min_experience, 0, 0, 50);
        whereClause += ' AND years_of_experience >= ?';
        queryParams.push(minExp);
      }

      if (filters.max_experience !== undefined) {
        const maxExp = this._safeInt(filters.max_experience, 50, 0, 50);
        whereClause += ' AND years_of_experience <= ?';
        queryParams.push(maxExp);
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM cms_profile ${whereClause}`,
        queryParams
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in Profile.getCount:', error);
      throw error;
    }
  }

  // Get count of search results (backward compatibility)
  static async getSearchCount(searchTerm) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return 0;
      }

      return await this.getCount({ search: searchTerm });
    } catch (error) {
      console.error('Error in Profile.getSearchCount:', error);
      return 0;
    }
  }

  // Get profiles by job title
  static async findByJobTitle(jobTitle, limit = 10, offset = 0) {
    try {
      if (!jobTitle || typeof jobTitle !== 'string') {
        return [];
      }

      return await this.findAll(limit, offset, { job_title: jobTitle });
    } catch (error) {
      console.error('Error in Profile.findByJobTitle:', error);
      throw error;
    }
  }

  // Get profiles by experience range
  static async findByExperienceRange(minExp, maxExp, limit = 10, offset = 0) {
    try {
      const filters = {};
      
      if (minExp !== undefined && minExp !== null) {
        filters.min_experience = minExp;
      }
      
      if (maxExp !== undefined && maxExp !== null) {
        filters.max_experience = maxExp;
      }

      return await this.findAll(limit, offset, filters);
    } catch (error) {
      console.error('Error in Profile.findByExperienceRange:', error);
      throw error;
    }
  }

  // Check if email exists
  static async existsByEmail(email) {
    try {
      if (!email || !this._isValidEmail(email)) {
        return false;
      }

      const [rows] = await pool.execute(
        'SELECT 1 FROM cms_profile WHERE email = ? LIMIT 1',
        [email.toLowerCase().trim()]
      );

      return rows.length > 0;
    } catch (error) {
      console.error('Error in Profile.existsByEmail:', error);
      return false;
    }
  }

  // Get profile statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_profiles,
          AVG(years_of_experience) as avg_experience,
          MAX(years_of_experience) as max_experience,
          MIN(years_of_experience) as min_experience,
          COUNT(CASE WHEN linkedin_profile IS NOT NULL THEN 1 END) as with_linkedin,
          COUNT(CASE WHEN github_profile IS NOT NULL THEN 1 END) as with_github,
          COUNT(CASE WHEN resume_url IS NOT NULL THEN 1 END) as with_resume,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as created_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as created_this_week
        FROM cms_profile
      `);

      return stats[0];
    } catch (error) {
      console.error('Error in Profile.getStatistics:', error);
      throw error;
    }
  }

  // Get most experienced profiles
  static async getMostExperienced(limit = 5) {
    try {
      const safeLimit = this._safeInt(limit, 5, 1, 100);

      const query = `
        SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
               instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
               years_of_experience, current_job_title, preferred_tech_stack, certifications, 
               resume_url, created_at, updated_at 
        FROM cms_profile 
        WHERE years_of_experience IS NOT NULL 
        ORDER BY years_of_experience DESC, created_at DESC 
        LIMIT ${safeLimit}
      `;

      const [rows] = await pool.execute(query);

      return rows.map(row => new Profile(row));
    } catch (error) {
      console.error('Error in Profile.getMostExperienced:', error);
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      full_name: this.full_name,
      email: this.email,
      phone_number: this.phone_number,
      linkedin_profile: this.linkedin_profile,
      github_profile: this.github_profile,
      instagram_profile: this.instagram_profile,
      tiktok_profile: this.tiktok_profile,
      x_profile: this.x_profile,
      profile_picture_url: this.profile_picture_url,
      bio: this.bio,
      years_of_experience: this.years_of_experience,
      current_job_title: this.current_job_title,
      preferred_tech_stack: this.preferred_tech_stack,
      certifications: this.certifications,
      resume_url: this.resume_url,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Convert to public JSON (limited fields for public API)
  toPublicJSON() {
    return {
      id: this.id,
      full_name: this.full_name,
      linkedin_profile: this.linkedin_profile,
      github_profile: this.github_profile,
      profile_picture_url: this.profile_picture_url,
      bio: this.bio,
      years_of_experience: this.years_of_experience,
      current_job_title: this.current_job_title,
      preferred_tech_stack: this.preferred_tech_stack
    };
  }

  // Convert to contact JSON (for contact purposes)
  toContactJSON() {
    return {
      id: this.id,
      full_name: this.full_name,
      email: this.email,
      phone_number: this.phone_number,
      linkedin_profile: this.linkedin_profile,
      current_job_title: this.current_job_title
    };
  }

  // Find profile by email
  static async findByEmail(email) {
    try {
      if (!email || !this._isValidEmail(email)) {
        return null;
      }

      const [rows] = await pool.execute(
        `SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
         instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
         years_of_experience, current_job_title, preferred_tech_stack, certifications, 
         resume_url, created_at, updated_at 
         FROM cms_profile WHERE email = ?`,
        [email.toLowerCase().trim()]
      );

      return rows.length > 0 ? new Profile(rows[0]) : null;
    } catch (error) {
      console.error('Error in Profile.findByEmail:', error);
      throw error;
    }
  }

  // Search profiles by multiple criteria
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return [];
      }

      return await this.findAll(limit, offset, { search: searchTerm });
    } catch (error) {
      console.error('Error in Profile.search:', error);
      throw error;
    }
  }
}

module.exports = Profile;
