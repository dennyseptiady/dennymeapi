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

  // Create new profile
  static async create(profileData) {
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

    const [result] = await pool.execute(
      `INSERT INTO cms_profile (
        full_name, email, phone_number, linkedin_profile, github_profile, 
        instagram_profile, tiktok_profile, x_profile, profile_picture_url, 
        bio, years_of_experience, current_job_title, preferred_tech_stack, 
        certifications, resume_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        full_name,
        email,
        phone_number || null,
        linkedin_profile || null,
        github_profile || null,
        instagram_profile || null,
        tiktok_profile || null,
        x_profile || null,
        filename_image || null,
        bio || null,
        years_of_experience || null,
        current_job_title || null,
        preferred_tech_stack || null,
        certifications || null,
        resume_url || null
      ]
    );

    return result.insertId;
  }

  // Find profile by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
       instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
       years_of_experience, current_job_title, preferred_tech_stack, certifications, 
       resume_url, created_at, updated_at 
       FROM cms_profile WHERE id = ?`,
      [id]
    );

    return rows.length > 0 ? new Profile(rows[0]) : null;
  }

  // Find all profiles
  static async findAll(limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
       instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
       years_of_experience, current_job_title, preferred_tech_stack, certifications, 
       resume_url, created_at, updated_at 
       FROM cms_profile ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.length > 0 ? rows.map(row => new Profile(row)) : [];
  }

  // Update profile
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        // Convert undefined to null for MySQL
        values.push(updateData[key] === undefined ? null : updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE cms_profile SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete profile
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM cms_profile WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get profile count
  static async getCount() {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cms_profile'
    );

    return rows[0].count;
  }

  // Find profile by email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
       instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
       years_of_experience, current_job_title, preferred_tech_stack, certifications, 
       resume_url, created_at, updated_at 
       FROM cms_profile WHERE email = ?`,
      [email]
    );

    return rows.length > 0 ? new Profile(rows[0]) : null;
  }

  // Search profiles by email, full_name, or phone_number
  static async search(searchTerm, limit = 10, offset = 0) {
    const searchPattern = `%${searchTerm}%`;
    
    const [rows] = await pool.execute(
      `SELECT id, full_name, email, phone_number, linkedin_profile, github_profile, 
       instagram_profile, tiktok_profile, x_profile, profile_picture_url, bio, 
       years_of_experience, current_job_title, preferred_tech_stack, certifications, 
       resume_url, created_at, updated_at 
       FROM cms_profile 
       WHERE full_name LIKE ? OR email LIKE ? OR phone_number LIKE ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [searchPattern, searchPattern, searchPattern, limit, offset]
    );

    return rows.length > 0 ? rows.map(row => new Profile(row)) : [];
  }

  // Get count of search results
  static async getSearchCount(searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM cms_profile 
       WHERE full_name LIKE ? OR email LIKE ? OR phone_number LIKE ?`,
      [searchPattern, searchPattern, searchPattern]
    );

    return rows[0].count;
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
}

module.exports = Profile;
