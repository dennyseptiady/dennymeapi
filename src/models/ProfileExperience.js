const { pool } = require('../config/database');

class ProfileExperience {
  constructor(data) {
    this.id = data.id;
    this.profile_id = data.profile_id;
    this.job_title = data.job_title;
    this.company_name = data.company_name;
    this.location = data.location;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.description = data.description;
    this.is_delete = data.is_delete;
    this.is_current = data.is_current;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Additional fields from joins
    this.profile_name = data.profile_name;
    this.profile_email = data.profile_email;
  }

  // Helper function to safely parse integers for SQL queries
  static _safeInt(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = parseInt(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Helper function to validate date
  static _isValidDate(dateString) {
    if (!dateString) return true; // Optional
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // Helper function to validate string fields
  static _isValidString(str, minLength = 1, maxLength = 255) {
    return str && typeof str === 'string' && 
           str.trim().length >= minLength && 
           str.trim().length <= maxLength;
  }

  // Helper function to format date for MySQL
  static _formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Create new profile experience
  static async create(profileExperienceData) {
    try {
      const { 
        profile_id, 
        job_title, 
        company_name, 
        location, 
        start_date, 
        end_date, 
        description, 
        is_current = 0 
      } = profileExperienceData;

      // Validate required fields
      const safeProfileId = this._safeInt(profile_id, 0, 1);
      if (safeProfileId === 0) {
        throw new Error('Valid profile ID is required');
      }

      if (!this._isValidString(job_title, 2, 100)) {
        throw new Error('Job title must be between 2-100 characters');
      }

      if (!this._isValidString(company_name, 2, 255)) {
        throw new Error('Company name must be between 2-255 characters');
      }

      // Validate optional fields
      if (location && !this._isValidString(location, 2, 255)) {
        throw new Error('Location must be between 2-255 characters');
      }

      if (start_date && !this._isValidDate(start_date)) {
        throw new Error('Invalid start date format');
      }

      if (end_date && !this._isValidDate(end_date)) {
        throw new Error('Invalid end date format');
      }

      // Validate date logic
      if (start_date && end_date && !is_current) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (startDate >= endDate) {
          throw new Error('Start date must be before end date');
        }
      }

      if (is_current && end_date) {
        throw new Error('Current position cannot have an end date');
      }

      if (description && typeof description === 'string' && description.length > 2000) {
        throw new Error('Description must be less than 2000 characters');
      }

      // Verify profile exists
      const [profileExists] = await pool.execute(
        'SELECT 1 FROM cms_profile WHERE id = ?',
        [safeProfileId]
      );

      if (profileExists.length === 0) {
        throw new Error('Profile not found');
      }

      // If this is current position, set other current positions to false
      if (is_current) {
        await pool.execute(
          'UPDATE cms_profile_experiences SET is_current = 0 WHERE profile_id = ? AND is_delete = 0',
          [safeProfileId]
        );
      }

      // Check for duplicate experience
      const existing = await this.findByProfileJobAndCompany(
        safeProfileId, 
        job_title.trim(), 
        company_name.trim()
      );

      if (existing) {
        throw new Error('Experience record already exists for this job title and company');
      }

      const [result] = await pool.execute(
        'INSERT INTO cms_profile_experiences (profile_id, job_title, company_name, location, start_date, end_date, description, is_delete, is_current, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW())',
        [
          safeProfileId,
          job_title.trim(),
          company_name.trim(),
          location ? location.trim() : null,
          this._formatDate(start_date),
          is_current ? null : this._formatDate(end_date),
          description ? description.trim() : null,
          is_current ? 1 : 0
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error in ProfileExperience.create:', error);
      throw error;
    }
  }

  // Find profile experience by ID
  static async findById(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, profile_id, job_title, company_name, location, start_date, end_date, description, is_delete, is_current, created_at, updated_at FROM cms_profile_experiences WHERE id = ? AND is_delete = 0',
        [safeId]
      );

      return rows.length > 0 ? new ProfileExperience(rows[0]) : null;
    } catch (error) {
      console.error('Error in ProfileExperience.findById:', error);
      throw error;
    }
  }

  // Find profile experiences by profile ID
  static async findByProfileId(profileId, limit = 10, offset = 0) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      if (safeProfileId === 0) {
        return [];
      }

      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      const query = `
        SELECT 
          pe.id, pe.profile_id, pe.job_title, pe.company_name, pe.location, 
          pe.start_date, pe.end_date, pe.description, pe.is_delete, pe.is_current, 
          pe.created_at, pe.updated_at
        FROM cms_profile_experiences pe
        WHERE pe.profile_id = ? AND pe.is_delete = 0 
        ORDER BY pe.is_current DESC, pe.start_date DESC
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, [safeProfileId]);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new ProfileExperience(row));
    } catch (error) {
      console.error('Error in ProfileExperience.findByProfileId:', error);
      throw error;
    }
  }

  // Find all profile experiences with enhanced filtering
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      // Build WHERE clause
      let whereClause = 'WHERE pe.is_delete = 0';
      const queryParams = [];

      // Filter by profile ID
      if (filters.profile_id) {
        const safeProfileId = this._safeInt(filters.profile_id, 0, 1);
        if (safeProfileId > 0) {
          whereClause += ' AND pe.profile_id = ?';
          queryParams.push(safeProfileId);
        }
      }

      // Filter by current status
      if (filters.is_current !== undefined) {
        whereClause += ' AND pe.is_current = ?';
        queryParams.push(filters.is_current ? 1 : 0);
      }

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (p.full_name LIKE ? OR pe.job_title LIKE ? OR pe.company_name LIKE ? OR pe.location LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Filter by job title
      if (filters.job_title && typeof filters.job_title === 'string') {
        whereClause += ' AND pe.job_title LIKE ?';
        queryParams.push(`%${filters.job_title.trim()}%`);
      }

      // Filter by company
      if (filters.company_name && typeof filters.company_name === 'string') {
        whereClause += ' AND pe.company_name LIKE ?';
        queryParams.push(`%${filters.company_name.trim()}%`);
      }

      // Filter by location
      if (filters.location && typeof filters.location === 'string') {
        whereClause += ' AND pe.location LIKE ?';
        queryParams.push(`%${filters.location.trim()}%`);
      }

      const query = `
        SELECT 
          pe.id, pe.profile_id, pe.job_title, pe.company_name, pe.location, 
          pe.start_date, pe.end_date, pe.description, pe.is_delete, pe.is_current, 
          pe.created_at, pe.updated_at,
          p.full_name as profile_name,
          p.email as profile_email
        FROM cms_profile_experiences pe
        LEFT JOIN cms_profile p ON pe.profile_id = p.id
        ${whereClause}
        ORDER BY pe.is_current DESC, pe.start_date DESC
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, queryParams);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new ProfileExperience(row));
    } catch (error) {
      console.error('Error in ProfileExperience.findAll:', error);
      throw error;
    }
  }

  // Search profile experiences
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return [];
      }

      return await this.findAll(limit, offset, { search: searchTerm });
    } catch (error) {
      console.error('Error in ProfileExperience.search:', error);
      throw error;
    }
  }

  // Find current experiences by profile ID
  static async findCurrentByProfileId(profileId, limit = 10, offset = 0) {
    try {
      return await this.findAll(limit, offset, { profile_id: profileId, is_current: true });
    } catch (error) {
      console.error('Error in ProfileExperience.findCurrentByProfileId:', error);
      throw error;
    }
  }

  // Check if profile experience already exists for the same job and company
  static async findByProfileJobAndCompany(profileId, jobTitle, companyName) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      if (safeProfileId === 0 || !jobTitle || !companyName) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, profile_id, job_title, company_name, location, start_date, end_date, description, is_delete, is_current, created_at, updated_at FROM cms_profile_experiences WHERE profile_id = ? AND job_title = ? AND company_name = ? AND is_delete = 0',
        [safeProfileId, jobTitle.trim(), companyName.trim()]
      );

      return rows.length > 0 ? new ProfileExperience(rows[0]) : null;
    } catch (error) {
      console.error('Error in ProfileExperience.findByProfileJobAndCompany:', error);
      throw error;
    }
  }

  // Update profile experience
  static async update(id, updateData) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid experience ID');
      }

      // Validate and sanitize update data
      const allowedFields = [
        'profile_id', 'job_title', 'company_name', 'location',
        'start_date', 'end_date', 'description', 'is_current'
      ];
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          let value = updateData[key];

          // Validate and sanitize each field
          switch (key) {
            case 'profile_id':
              const safeProfileId = this._safeInt(value, 0, 1);
              if (safeProfileId > 0) {
                fields.push(`${key} = ?`);
                values.push(safeProfileId);
              }
              break;
            case 'job_title':
              if (this._isValidString(value, 2, 100)) {
                fields.push(`${key} = ?`);
                values.push(value.trim());
              }
              break;
            case 'company_name':
              if (this._isValidString(value, 2, 255)) {
                fields.push(`${key} = ?`);
                values.push(value.trim());
              }
              break;
            case 'location':
              if (value === null || this._isValidString(value, 2, 255)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'start_date':
            case 'end_date':
              if (value === null || this._isValidDate(value)) {
                fields.push(`${key} = ?`);
                values.push(value ? this._formatDate(value) : null);
              }
              break;
            case 'description':
              if (value === null || (typeof value === 'string' && value.length <= 2000)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'is_current':
              fields.push(`${key} = ?`);
              values.push(value ? 1 : 0);
              break;
          }
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Validate date logic if both dates are being updated
      if (updateData.start_date && updateData.end_date && !updateData.is_current) {
        const startDate = new Date(updateData.start_date);
        const endDate = new Date(updateData.end_date);
        if (startDate >= endDate) {
          throw new Error('Start date must be before end date');
        }
      }

      // If setting as current, remove current status from other experiences
      if (updateData.is_current) {
        const experience = await this.findById(safeId);
        if (experience) {
          await pool.execute(
            'UPDATE cms_profile_experiences SET is_current = 0 WHERE profile_id = ? AND id != ? AND is_delete = 0',
            [experience.profile_id, safeId]
          );
        }
        // Clear end date if setting as current
        if (!updateData.end_date) {
          fields.push('end_date = ?');
          values.push(null);
        }
      }

      fields.push('updated_at = NOW()');
      values.push(safeId);

      const [result] = await pool.execute(
        `UPDATE cms_profile_experiences SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileExperience.update:', error);
      throw error;
    }
  }

  // Delete profile experience (soft delete)
  static async delete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid experience ID');
      }

      const [result] = await pool.execute(
        'UPDATE cms_profile_experiences SET is_delete = 1, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileExperience.delete:', error);
      throw error;
    }
  }

  // Restore profile experience (undo soft delete)
  static async restore(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid experience ID');
      }

      const [result] = await pool.execute(
        'UPDATE cms_profile_experiences SET is_delete = 0, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileExperience.restore:', error);
      throw error;
    }
  }

  // Toggle current status
  static async toggleCurrentStatus(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid experience ID');
      }

      const experience = await this.findById(safeId);
      if (!experience) {
        throw new Error('Experience not found');
      }

      const newStatus = experience.is_current === 1 ? 0 : 1;

      // If setting as current, remove current status from other experiences
      if (newStatus === 1) {
        await pool.execute(
          'UPDATE cms_profile_experiences SET is_current = 0 WHERE profile_id = ? AND id != ? AND is_delete = 0',
          [experience.profile_id, safeId]
        );
      }

      const [result] = await pool.execute(
        'UPDATE cms_profile_experiences SET is_current = ?, end_date = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, newStatus === 1 ? null : experience.end_date, safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileExperience.toggleCurrentStatus:', error);
      throw error;
    }
  }

  // Get profile experience count
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE pe.is_delete = 0';
      const queryParams = [];

      // Filter by profile ID
      if (filters.profile_id) {
        const safeProfileId = this._safeInt(filters.profile_id, 0, 1);
        if (safeProfileId > 0) {
          whereClause += ' AND pe.profile_id = ?';
          queryParams.push(safeProfileId);
        }
      }

      // Filter by current status
      if (filters.is_current !== undefined) {
        whereClause += ' AND pe.is_current = ?';
        queryParams.push(filters.is_current ? 1 : 0);
      }

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (p.full_name LIKE ? OR pe.job_title LIKE ? OR pe.company_name LIKE ? OR pe.location LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM cms_profile_experiences pe
         LEFT JOIN cms_profile p ON pe.profile_id = p.id
         ${whereClause}`,
        queryParams
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in ProfileExperience.getCount:', error);
      throw error;
    }
  }

  // Get profile experience count by profile ID
  static async getCountByProfileId(profileId) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      if (safeProfileId === 0) {
        return 0;
      }

      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_experiences WHERE profile_id = ? AND is_delete = 0',
        [safeProfileId]
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in ProfileExperience.getCountByProfileId:', error);
      return 0;
    }
  }

  // Get experience statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_experiences,
          COUNT(DISTINCT profile_id) as profiles_with_experience,
          COUNT(CASE WHEN is_current = 1 THEN 1 END) as current_positions,
          COUNT(DISTINCT company_name) as unique_companies,
          COUNT(DISTINCT job_title) as unique_job_titles,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as created_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as created_this_week
        FROM cms_profile_experiences
        WHERE is_delete = 0
      `);

      return stats[0];
    } catch (error) {
      console.error('Error in ProfileExperience.getStatistics:', error);
      throw error;
    }
  }

  // Get top companies by experience count
  static async getTopCompanies(limit = 10) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 100);

      const query = `
        SELECT 
          company_name,
          location,
          COUNT(*) as experience_count,
          COUNT(DISTINCT profile_id) as unique_profiles,
          COUNT(CASE WHEN is_current = 1 THEN 1 END) as current_employees
        FROM cms_profile_experiences
        WHERE is_delete = 0 AND company_name IS NOT NULL
        GROUP BY company_name, location
        ORDER BY experience_count DESC, current_employees DESC
        LIMIT ${safeLimit}
      `;

      const [rows] = await pool.execute(query);

      return rows;
    } catch (error) {
      console.error('Error in ProfileExperience.getTopCompanies:', error);
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      profile_id: this.profile_id,
      job_title: this.job_title,
      company_name: this.company_name,
      location: this.location,
      start_date: this.start_date,
      end_date: this.end_date,
      description: this.description,
      is_delete: this.is_delete,
      is_current: this.is_current,
      created_at: this.created_at,
      updated_at: this.updated_at,
      profile_name: this.profile_name || undefined,
      profile_email: this.profile_email || undefined
    };
  }

  // Convert to public JSON (limited fields)
  toPublicJSON() {
    return {
      id: this.id,
      job_title: this.job_title,
      company_name: this.company_name,
      location: this.location,
      start_date: this.start_date,
      end_date: this.end_date,
      is_current: this.is_current
    };
  }
}

module.exports = ProfileExperience; 