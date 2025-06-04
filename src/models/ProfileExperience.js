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
  }

  // Create new profile experience
  static async create(profileExperienceData) {
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

    const [result] = await pool.execute(
      'INSERT INTO cms_profile_experiences (profile_id, job_title, company_name, location, start_date, end_date, description, is_delete, is_current, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW())',
      [profile_id, job_title, company_name, location, start_date, end_date, description, is_current]
    );

    return result.insertId;
  }

  // Find profile experience by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, profile_id, job_title, company_name, location, start_date, end_date, description, is_delete, is_current, created_at, updated_at FROM cms_profile_experiences WHERE id = ? AND is_delete = 0',
      [id]
    );

    return rows.length > 0 ? new ProfileExperience(rows[0]) : null;
  }

  // Find all profile experiences
  static async findAll(limit = 10, offset = 0, search = '') {
    let query = `
      SELECT 
        pe.id, pe.profile_id, pe.job_title, pe.company_name, pe.location, 
        pe.start_date, pe.end_date, pe.description, pe.is_delete, pe.is_current, 
        pe.created_at, pe.updated_at,
        p.full_name as profile_name
      FROM cms_profile_experiences pe
      LEFT JOIN cms_profile p ON pe.profile_id = p.id
      WHERE pe.is_delete = 0
    `;
    const params = [];

    if (search) {
      query += ' AND (p.full_name LIKE ? OR pe.job_title LIKE ? OR pe.company_name LIKE ? OR pe.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY pe.start_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => {
      const profileExperience = new ProfileExperience(row);
      profileExperience.profile_name = row.profile_name;
      return profileExperience;
    }) : [];
  }

  // Find profile experiences by profile ID
  static async findByProfileId(profileId, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT 
        pe.id, pe.profile_id, pe.job_title, pe.company_name, pe.location, 
        pe.start_date, pe.end_date, pe.description, pe.is_delete, pe.is_current, 
        pe.created_at, pe.updated_at
      FROM cms_profile_experiences pe
      WHERE pe.profile_id = ? AND pe.is_delete = 0 
      ORDER BY pe.start_date DESC LIMIT ? OFFSET ?`,
      [profileId, limit, offset]
    );

    return rows.length > 0 ? rows.map(row => new ProfileExperience(row)) : [];
  }

  // Check if profile experience already exists for the same job and company
  static async findByProfileJobAndCompany(profileId, jobTitle, companyName) {
    const [rows] = await pool.execute(
      'SELECT id, profile_id, job_title, company_name, location, start_date, end_date, description, is_delete, is_current, created_at, updated_at FROM cms_profile_experiences WHERE profile_id = ? AND job_title = ? AND company_name = ? AND is_delete = 0',
      [profileId, jobTitle, companyName]
    );

    return rows.length > 0 ? new ProfileExperience(rows[0]) : null;
  }

  // Update profile experience
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
      `UPDATE cms_profile_experiences SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete profile experience (soft delete)
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE cms_profile_experiences SET is_delete = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get profile experience count
  static async getCount(search = '') {
    let query = `
      SELECT COUNT(*) as count 
      FROM cms_profile_experiences pe
      LEFT JOIN cms_profile p ON pe.profile_id = p.id
      WHERE pe.is_delete = 0
    `;
    const params = [];

    if (search) {
      query += ' AND (p.full_name LIKE ? OR pe.job_title LIKE ? OR pe.company_name LIKE ? OR pe.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].count;
  }

  // Get profile experience count by profile ID
  static async getCountByProfileId(profileId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cms_profile_experiences WHERE profile_id = ? AND is_delete = 0',
      [profileId]
    );
    return rows[0].count;
  }

  // Find all profile experiences with detailed information and filters
  static async findAllWithDetails(limit = 10, offset = 0, filters = {}) {
    let query = `
      SELECT 
        pe.id, pe.profile_id, pe.job_title, pe.company_name, pe.location, 
        pe.start_date, pe.end_date, pe.description, pe.is_delete, pe.is_current, 
        pe.created_at, pe.updated_at,
        p.full_name as profile_name,
        p.email as profile_email
      FROM cms_profile_experiences pe
      LEFT JOIN cms_profile p ON pe.profile_id = p.id
      WHERE pe.is_delete = 0
    `;
    const params = [];

    // Apply filters
    if (filters.profile_id) {
      query += ' AND pe.profile_id = ?';
      params.push(filters.profile_id);
    }

    if (filters.is_current !== undefined) {
      query += ' AND pe.is_current = ?';
      params.push(filters.is_current);
    }

    if (filters.company_name) {
      query += ' AND pe.company_name LIKE ?';
      params.push(`%${filters.company_name}%`);
    }

    if (filters.location) {
      query += ' AND pe.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    query += ' ORDER BY pe.start_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => {
      const profileExperience = new ProfileExperience(row);
      profileExperience.profile_name = row.profile_name;
      profileExperience.profile_email = row.profile_email;
      return profileExperience;
    }) : [];
  }

  // Convert to JSON for API response
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
      is_current: this.is_current,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Include related data if available
      ...(this.profile_name && { profile_name: this.profile_name }),
      ...(this.profile_email && { profile_email: this.profile_email })
    };
  }

  // Find current job experiences by profile ID
  static async findCurrentByProfileId(profileId, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT 
        pe.id, pe.profile_id, pe.job_title, pe.company_name, pe.location, 
        pe.start_date, pe.end_date, pe.description, pe.is_delete, pe.is_current, 
        pe.created_at, pe.updated_at
      FROM cms_profile_experiences pe
      WHERE pe.profile_id = ? AND pe.is_current = 1 AND pe.is_delete = 0 
      ORDER BY pe.start_date DESC LIMIT ? OFFSET ?`,
      [profileId, limit, offset]
    );

    return rows.length > 0 ? rows.map(row => new ProfileExperience(row)) : [];
  }

  // Update is_current status
  static async toggleCurrentStatus(id) {
    const profileExperience = await this.findById(id);
    if (!profileExperience) {
      return false;
    }

    const newStatus = profileExperience.is_current === 1 ? 0 : 1;
    const [result] = await pool.execute(
      'UPDATE cms_profile_experiences SET is_current = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    return result.affectedRows > 0;
  }
}

module.exports = ProfileExperience; 