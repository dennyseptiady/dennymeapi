const { pool } = require('../config/database');

class ProfileEducation {
  constructor(data) {
    this.id = data.id;
    this.profile_id = data.profile_id;
    this.degree = data.degree;
    this.major = data.major;
    this.institution_name = data.institution_name;
    this.location = data.location;
    this.graduation_year = data.graduation_year;
    this.start_year = data.start_year;
    this.gpa = data.gpa;
    this.description = data.description;
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

  // Helper function to safely parse float for GPA
  static _safeFloat(value, defaultValue = 0.0, min = 0.0, max = 4.0) {
    const parsed = parseFloat(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Helper function to validate year
  static _isValidYear(year) {
    if (!year) return true; // Optional
    const currentYear = new Date().getFullYear();
    const yearInt = this._safeInt(year, 0, 1900, currentYear + 10);
    return yearInt >= 1900 && yearInt <= currentYear + 10;
  }

  // Helper function to validate string fields
  static _isValidString(str, minLength = 1, maxLength = 255) {
    return str && typeof str === 'string' && 
           str.trim().length >= minLength && 
           str.trim().length <= maxLength;
  }

  // Create new profile education
  static async create(profileEducationData) {
    try {
      const { 
        profile_id, 
        degree, 
        major, 
        institution_name, 
        location, 
        graduation_year, 
        start_year, 
        gpa, 
        description 
      } = profileEducationData;

      // Validate required fields
      const safeProfileId = this._safeInt(profile_id, 0, 1);
      if (safeProfileId === 0) {
        throw new Error('Valid profile ID is required');
      }

      if (!this._isValidString(degree, 2, 100)) {
        throw new Error('Degree must be between 2-100 characters');
      }

      if (!this._isValidString(major, 2, 100)) {
        throw new Error('Major must be between 2-100 characters');
      }

      if (!this._isValidString(institution_name, 2, 255)) {
        throw new Error('Institution name must be between 2-255 characters');
      }

      // Validate optional fields
      if (location && !this._isValidString(location, 2, 255)) {
        throw new Error('Location must be between 2-255 characters');
      }

      if (graduation_year && !this._isValidYear(graduation_year)) {
        throw new Error('Invalid graduation year');
      }

      if (start_year && !this._isValidYear(start_year)) {
        throw new Error('Invalid start year');
      }

      // Validate year logic
      if (start_year && graduation_year) {
        const startYearInt = this._safeInt(start_year);
        const gradYearInt = this._safeInt(graduation_year);
        if (startYearInt >= gradYearInt) {
          throw new Error('Start year must be before graduation year');
        }
      }

      if (gpa !== null && gpa !== undefined) {
        const safeGpa = this._safeFloat(gpa, 0.0, 0.0, 4.0);
        if (safeGpa < 0.0 || safeGpa > 4.0) {
          throw new Error('GPA must be between 0.0 and 4.0');
        }
      }

      if (description && typeof description === 'string' && description.length > 1000) {
        throw new Error('Description must be less than 1000 characters');
      }

      // Verify profile exists
      const [profileExists] = await pool.execute(
        'SELECT 1 FROM cms_profile WHERE id = ?',
        [safeProfileId]
      );

      if (profileExists.length === 0) {
        throw new Error('Profile not found');
      }

      // Check for duplicate education
      const existing = await this.findByProfileDegreeAndInstitution(
        safeProfileId, 
        degree.trim(), 
        institution_name.trim()
      );

      if (existing) {
        throw new Error('Education record already exists for this degree and institution');
      }

      const [result] = await pool.execute(
        'INSERT INTO cms_profile_educations (profile_id, degree, major, institution_name, location, graduation_year, start_year, gpa, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          safeProfileId,
          degree.trim(),
          major.trim(),
          institution_name.trim(),
          location ? location.trim() : null,
          graduation_year ? this._safeInt(graduation_year) : null,
          start_year ? this._safeInt(start_year) : null,
          gpa !== null && gpa !== undefined ? this._safeFloat(gpa, 0.0, 0.0, 4.0) : null,
          description ? description.trim() : null
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error in ProfileEducation.create:', error);
      throw error;
    }
  }

  // Find profile education by ID
  static async findById(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, profile_id, degree, major, institution_name, location, graduation_year, start_year, gpa, description, created_at, updated_at FROM cms_profile_educations WHERE id = ?',
        [safeId]
      );

      return rows.length > 0 ? new ProfileEducation(rows[0]) : null;
    } catch (error) {
      console.error('Error in ProfileEducation.findById:', error);
      throw error;
    }
  }

  // Find profile educations by profile ID
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
          pe.id, pe.profile_id, pe.degree, pe.major, pe.institution_name, pe.location, 
          pe.graduation_year, pe.start_year, pe.gpa, pe.description, 
          pe.created_at, pe.updated_at
        FROM cms_profile_educations pe
        WHERE pe.profile_id = ? 
        ORDER BY pe.graduation_year DESC, pe.start_year DESC
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, [safeProfileId]);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new ProfileEducation(row));
    } catch (error) {
      console.error('Error in ProfileEducation.findByProfileId:', error);
      throw error;
    }
  }

  // Find all profile educations with enhanced filtering
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      // Build WHERE clause
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      // Filter by profile ID
      if (filters.profile_id) {
        const safeProfileId = this._safeInt(filters.profile_id, 0, 1);
        if (safeProfileId > 0) {
          whereClause += ' AND pe.profile_id = ?';
          queryParams.push(safeProfileId);
        }
      }

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (p.full_name LIKE ? OR pe.degree LIKE ? OR pe.major LIKE ? OR pe.institution_name LIKE ? OR pe.location LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Filter by degree
      if (filters.degree && typeof filters.degree === 'string') {
        whereClause += ' AND pe.degree LIKE ?';
        queryParams.push(`%${filters.degree.trim()}%`);
      }

      // Filter by major
      if (filters.major && typeof filters.major === 'string') {
        whereClause += ' AND pe.major LIKE ?';
        queryParams.push(`%${filters.major.trim()}%`);
      }

      // Filter by institution
      if (filters.institution_name && typeof filters.institution_name === 'string') {
        whereClause += ' AND pe.institution_name LIKE ?';
        queryParams.push(`%${filters.institution_name.trim()}%`);
      }

      // Filter by graduation year
      if (filters.graduation_year) {
        const safeYear = this._safeInt(filters.graduation_year);
        if (this._isValidYear(safeYear)) {
          whereClause += ' AND pe.graduation_year = ?';
          queryParams.push(safeYear);
        }
      }

      // Filter by GPA range
      if (filters.min_gpa !== undefined) {
        const minGpa = this._safeFloat(filters.min_gpa, 0.0, 0.0, 4.0);
        whereClause += ' AND pe.gpa >= ?';
        queryParams.push(minGpa);
      }

      if (filters.max_gpa !== undefined) {
        const maxGpa = this._safeFloat(filters.max_gpa, 4.0, 0.0, 4.0);
        whereClause += ' AND pe.gpa <= ?';
        queryParams.push(maxGpa);
      }

      const query = `
        SELECT 
          pe.id, pe.profile_id, pe.degree, pe.major, pe.institution_name, pe.location, 
          pe.graduation_year, pe.start_year, pe.gpa, pe.description, 
          pe.created_at, pe.updated_at,
          p.full_name as profile_name,
          p.email as profile_email
        FROM cms_profile_educations pe
        LEFT JOIN cms_profile p ON pe.profile_id = p.id
        ${whereClause}
        ORDER BY pe.graduation_year DESC, pe.start_year DESC
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, queryParams);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new ProfileEducation(row));
    } catch (error) {
      console.error('Error in ProfileEducation.findAll:', error);
      throw error;
    }
  }

  // Search profile educations
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return [];
      }

      return await this.findAll(limit, offset, { search: searchTerm });
    } catch (error) {
      console.error('Error in ProfileEducation.search:', error);
      throw error;
    }
  }

  // Check if profile education already exists for the same degree and institution
  static async findByProfileDegreeAndInstitution(profileId, degree, institutionName) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      if (safeProfileId === 0 || !degree || !institutionName) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, profile_id, degree, major, institution_name, location, graduation_year, start_year, gpa, description, created_at, updated_at FROM cms_profile_educations WHERE profile_id = ? AND degree = ? AND institution_name = ?',
        [safeProfileId, degree.trim(), institutionName.trim()]
      );

      return rows.length > 0 ? new ProfileEducation(rows[0]) : null;
    } catch (error) {
      console.error('Error in ProfileEducation.findByProfileDegreeAndInstitution:', error);
      throw error;
    }
  }

  // Update profile education
  static async update(id, updateData) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid education ID');
      }

      // Validate and sanitize update data
      const allowedFields = [
        'profile_id', 'degree', 'major', 'institution_name', 'location',
        'graduation_year', 'start_year', 'gpa', 'description'
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
            case 'degree':
            case 'major':
              if (this._isValidString(value, 2, 100)) {
                fields.push(`${key} = ?`);
                values.push(value.trim());
              }
              break;
            case 'institution_name':
            case 'location':
              if (value === null || this._isValidString(value, 2, 255)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'graduation_year':
            case 'start_year':
              if (value === null || this._isValidYear(value)) {
                fields.push(`${key} = ?`);
                values.push(value ? this._safeInt(value) : null);
              }
              break;
            case 'gpa':
              if (value === null || value === undefined) {
                fields.push(`${key} = ?`);
                values.push(null);
              } else {
                const safeGpa = this._safeFloat(value, 0.0, 0.0, 4.0);
                fields.push(`${key} = ?`);
                values.push(safeGpa);
              }
              break;
            case 'description':
              if (value === null || (typeof value === 'string' && value.length <= 1000)) {
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

      // Validate year logic if both years are being updated
      if (updateData.start_year && updateData.graduation_year) {
        const startYearInt = this._safeInt(updateData.start_year);
        const gradYearInt = this._safeInt(updateData.graduation_year);
        if (startYearInt >= gradYearInt) {
          throw new Error('Start year must be before graduation year');
        }
      }

      fields.push('updated_at = NOW()');
      values.push(safeId);

      const [result] = await pool.execute(
        `UPDATE cms_profile_educations SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileEducation.update:', error);
      throw error;
    }
  }

  // Delete profile education
  static async delete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid education ID');
      }

      const [result] = await pool.execute(
        'DELETE FROM cms_profile_educations WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileEducation.delete:', error);
      throw error;
    }
  }

  // Get profile education count
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];

      // Filter by profile ID
      if (filters.profile_id) {
        const safeProfileId = this._safeInt(filters.profile_id, 0, 1);
        if (safeProfileId > 0) {
          whereClause += ' AND pe.profile_id = ?';
          queryParams.push(safeProfileId);
        }
      }

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (p.full_name LIKE ? OR pe.degree LIKE ? OR pe.major LIKE ? OR pe.institution_name LIKE ? OR pe.location LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM cms_profile_educations pe
         LEFT JOIN cms_profile p ON pe.profile_id = p.id
         ${whereClause}`,
        queryParams
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in ProfileEducation.getCount:', error);
      throw error;
    }
  }

  // Get profile education count by profile ID
  static async getCountByProfileId(profileId) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      if (safeProfileId === 0) {
        return 0;
      }

      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_educations WHERE profile_id = ?',
        [safeProfileId]
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in ProfileEducation.getCountByProfileId:', error);
      return 0;
    }
  }

  // Get education statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_educations,
          COUNT(DISTINCT profile_id) as profiles_with_education,
          AVG(gpa) as avg_gpa,
          MAX(gpa) as max_gpa,
          MIN(gpa) as min_gpa,
          COUNT(DISTINCT degree) as unique_degrees,
          COUNT(DISTINCT institution_name) as unique_institutions,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as created_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as created_this_week
        FROM cms_profile_educations
      `);

      return stats[0];
    } catch (error) {
      console.error('Error in ProfileEducation.getStatistics:', error);
      throw error;
    }
  }

  // Get top institutions by education count
  static async getTopInstitutions(limit = 10) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 100);

      const query = `
        SELECT 
          institution_name,
          location,
          COUNT(*) as education_count,
          AVG(gpa) as avg_gpa,
          COUNT(DISTINCT profile_id) as unique_profiles
        FROM cms_profile_educations
        WHERE institution_name IS NOT NULL
        GROUP BY institution_name, location
        ORDER BY education_count DESC, avg_gpa DESC
        LIMIT ${safeLimit}
      `;

      const [rows] = await pool.execute(query);

      return rows;
    } catch (error) {
      console.error('Error in ProfileEducation.getTopInstitutions:', error);
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      profile_id: this.profile_id,
      degree: this.degree,
      major: this.major,
      institution_name: this.institution_name,
      location: this.location,
      graduation_year: this.graduation_year,
      start_year: this.start_year,
      gpa: this.gpa,
      description: this.description,
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
      degree: this.degree,
      major: this.major,
      institution_name: this.institution_name,
      location: this.location,
      graduation_year: this.graduation_year,
      gpa: this.gpa
    };
  }
}

module.exports = ProfileEducation; 