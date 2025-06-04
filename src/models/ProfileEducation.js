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
  }

  // Create new profile education
  static async create(profileEducationData) {
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

    const [result] = await pool.execute(
      'INSERT INTO cms_profile_educations (profile_id, degree, major, institution_name, location, graduation_year, start_year, gpa, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [profile_id, degree, major, institution_name, location, graduation_year, start_year, gpa, description]
    );

    return result.insertId;
  }

  // Find profile education by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, profile_id, degree, major, institution_name, location, graduation_year, start_year, gpa, description, created_at, updated_at FROM cms_profile_educations WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? new ProfileEducation(rows[0]) : null;
  }

  // Find all profile educations
  static async findAll(limit = 10, offset = 0, search = '') {
    let query = `
      SELECT 
        pe.id, pe.profile_id, pe.degree, pe.major, pe.institution_name, pe.location, 
        pe.graduation_year, pe.start_year, pe.gpa, pe.description, 
        pe.created_at, pe.updated_at,
        p.full_name as profile_name
      FROM cms_profile_educations pe
      LEFT JOIN cms_profile p ON pe.profile_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.full_name LIKE ? OR pe.degree LIKE ? OR pe.major LIKE ? OR pe.institution_name LIKE ? OR pe.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY pe.graduation_year DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => {
      const profileEducation = new ProfileEducation(row);
      profileEducation.profile_name = row.profile_name;
      return profileEducation;
    }) : [];
  }

  // Find profile educations by profile ID
  static async findByProfileId(profileId, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT 
        pe.id, pe.profile_id, pe.degree, pe.major, pe.institution_name, pe.location, 
        pe.graduation_year, pe.start_year, pe.gpa, pe.description, 
        pe.created_at, pe.updated_at
      FROM cms_profile_educations pe
      WHERE pe.profile_id = ? 
      ORDER BY pe.graduation_year DESC LIMIT ? OFFSET ?`,
      [profileId, limit, offset]
    );

    return rows.length > 0 ? rows.map(row => new ProfileEducation(row)) : [];
  }

  // Check if profile education already exists for the same degree and institution
  static async findByProfileDegreeAndInstitution(profileId, degree, institutionName) {
    const [rows] = await pool.execute(
      'SELECT id, profile_id, degree, major, institution_name, location, graduation_year, start_year, gpa, description, created_at, updated_at FROM cms_profile_educations WHERE profile_id = ? AND degree = ? AND institution_name = ?',
      [profileId, degree, institutionName]
    );

    return rows.length > 0 ? new ProfileEducation(rows[0]) : null;
  }

  // Update profile education
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE cms_profile_educations SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete profile education (hard delete since no soft delete required)
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM cms_profile_educations WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get profile education count
  static async getCount(search = '') {
    let query = `
      SELECT COUNT(*) as count 
      FROM cms_profile_educations pe
      LEFT JOIN cms_profile p ON pe.profile_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.full_name LIKE ? OR pe.degree LIKE ? OR pe.major LIKE ? OR pe.institution_name LIKE ? OR pe.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].count;
  }

  // Get profile education count by profile ID
  static async getCountByProfileId(profileId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cms_profile_educations WHERE profile_id = ?',
      [profileId]
    );
    return rows[0].count;
  }

  // Find all profile educations with detailed information and filters
  static async findAllWithDetails(limit = 10, offset = 0, filters = {}) {
    let query = `
      SELECT 
        pe.id, pe.profile_id, pe.degree, pe.major, pe.institution_name, pe.location, 
        pe.graduation_year, pe.start_year, pe.gpa, pe.description, 
        pe.created_at, pe.updated_at,
        p.full_name as profile_name,
        p.email as profile_email
      FROM cms_profile_educations pe
      LEFT JOIN cms_profile p ON pe.profile_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (filters.profile_id) {
      query += ' AND pe.profile_id = ?';
      params.push(filters.profile_id);
    }

    if (filters.degree) {
      query += ' AND pe.degree LIKE ?';
      params.push(`%${filters.degree}%`);
    }

    if (filters.major) {
      query += ' AND pe.major LIKE ?';
      params.push(`%${filters.major}%`);
    }

    if (filters.institution_name) {
      query += ' AND pe.institution_name LIKE ?';
      params.push(`%${filters.institution_name}%`);
    }

    if (filters.location) {
      query += ' AND pe.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.graduation_year) {
      query += ' AND pe.graduation_year = ?';
      params.push(filters.graduation_year);
    }

    if (filters.start_year) {
      query += ' AND pe.start_year = ?';
      params.push(filters.start_year);
    }

    if (filters.min_gpa) {
      query += ' AND pe.gpa >= ?';
      params.push(filters.min_gpa);
    }

    if (filters.max_gpa) {
      query += ' AND pe.gpa <= ?';
      params.push(filters.max_gpa);
    }

    if (filters.search) {
      query += ' AND (p.full_name LIKE ? OR pe.degree LIKE ? OR pe.major LIKE ? OR pe.institution_name LIKE ? OR pe.location LIKE ?)';
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY pe.graduation_year DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => {
      const profileEducation = new ProfileEducation(row);
      profileEducation.profile_name = row.profile_name;
      profileEducation.profile_email = row.profile_email;
      return profileEducation;
    }) : [];
  }

  // Convert to JSON (remove sensitive data if needed)
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
      profile_name: this.profile_name,
      profile_email: this.profile_email
    };
  }
}

module.exports = ProfileEducation; 