const { pool } = require('../config/database');

class ProfileSkill {
  constructor(data) {
    this.id = data.id;
    this.profile_id = data.profile_id;
    this.category_id = data.category_id;
    this.skill_id = data.skill_id;
    this.percent = data.percent;
    this.is_active = data.is_active;
    this.is_delete = data.is_delete;
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new profile skill
  static async create(profileSkillData) {
    const { 
      profile_id, 
      category_id, 
      skill_id, 
      percent, 
      is_active = 1, 
      created_by, 
      updated_by 
    } = profileSkillData;

    const [result] = await pool.execute(
      'INSERT INTO cms_profile_skills (profile_id, category_id, skill_id, percent, is_active, is_delete, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())',
      [profile_id, category_id, skill_id, percent, is_active, created_by, updated_by]
    );

    return result.insertId;
  }

  // Find profile skill by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, profile_id, category_id, skill_id, percent, is_active, is_delete, created_by, updated_by, created_at, updated_at FROM cms_profile_skills WHERE id = ? AND is_delete = 0',
      [id]
    );

    return rows.length > 0 ? new ProfileSkill(rows[0]) : null;
  }

  // Find all profile skills
  static async findAll(limit = 10, offset = 0, search = '') {
    let query = `
      SELECT 
        ps.id, ps.profile_id, ps.category_id, ps.skill_id, ps.percent, 
        ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
        ps.created_at, ps.updated_at,
        p.full_name as profile_name,
        c.name as category_name,
        s.name as skill_name
      FROM cms_profile_skills ps
      LEFT JOIN cms_profile p ON ps.profile_id = p.id
      LEFT JOIN cms_m_category c ON ps.category_id = c.id
      LEFT JOIN cms_m_skills s ON ps.skill_id = s.id
      WHERE ps.is_delete = 0
    `;
    const params = [];

    if (search) {
      query += ' AND (p.full_name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY ps.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => {
      const profileSkill = new ProfileSkill(row);
      profileSkill.profile_name = row.profile_name;
      profileSkill.category_name = row.category_name;
      profileSkill.skill_name = row.skill_name;
      return profileSkill;
    }) : [];
  }

  // Find profile skills by profile ID
  static async findByProfileId(profileId, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT 
        ps.id, ps.profile_id, ps.category_id, ps.skill_id, ps.percent, 
        ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
        ps.created_at, ps.updated_at,
        c.name as category_name,
        s.name as skill_name,
        s.icon as skill_icon
      FROM cms_profile_skills ps
      LEFT JOIN cms_m_category c ON ps.category_id = c.id
      LEFT JOIN cms_m_skills s ON ps.skill_id = s.id
      WHERE ps.profile_id = ? AND ps.is_delete = 0 
      ORDER BY ps.created_at DESC LIMIT ? OFFSET ?`,
      [profileId, limit, offset]
    );

    return rows.length > 0 ? rows.map(row => {
      const profileSkill = new ProfileSkill(row);
      profileSkill.category_name = row.category_name;
      profileSkill.skill_name = row.skill_name;
      profileSkill.skill_icon = row.skill_icon;
      return profileSkill;
    }) : [];
  }

  // Find profile skills by category ID
  static async findByCategoryId(categoryId, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT 
        ps.id, ps.profile_id, ps.category_id, ps.skill_id, ps.percent, 
        ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
        ps.created_at, ps.updated_at,
        p.full_name as profile_name,
        s.name as skill_name,
        s.icon as skill_icon
      FROM cms_profile_skills ps
      LEFT JOIN cms_profile p ON ps.profile_id = p.id
      LEFT JOIN cms_m_skills s ON ps.skill_id = s.id
      WHERE ps.category_id = ? AND ps.is_delete = 0 
      ORDER BY ps.created_at DESC LIMIT ? OFFSET ?`,
      [categoryId, limit, offset]
    );

    return rows.length > 0 ? rows.map(row => {
      const profileSkill = new ProfileSkill(row);
      profileSkill.profile_name = row.profile_name;
      profileSkill.skill_name = row.skill_name;
      profileSkill.skill_icon = row.skill_icon;
      return profileSkill;
    }) : [];
  }

  // Check if profile skill already exists
  static async findByProfileAndSkill(profileId, skillId) {
    const [rows] = await pool.execute(
      'SELECT id, profile_id, category_id, skill_id, percent, is_active, is_delete, created_by, updated_by, created_at, updated_at FROM cms_profile_skills WHERE profile_id = ? AND skill_id = ? AND is_delete = 0',
      [profileId, skillId]
    );

    return rows.length > 0 ? new ProfileSkill(rows[0]) : null;
  }

  // Update profile skill
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
      `UPDATE cms_profile_skills SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete profile skill (soft delete)
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE cms_profile_skills SET is_delete = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get profile skill count
  static async getCount(search = '') {
    let query = `
      SELECT COUNT(*) as count 
      FROM cms_profile_skills ps
      LEFT JOIN cms_profile p ON ps.profile_id = p.id
      LEFT JOIN cms_m_category c ON ps.category_id = c.id
      LEFT JOIN cms_m_skills s ON ps.skill_id = s.id
      WHERE ps.is_delete = 0
    `;
    const params = [];

    if (search) {
      query += ' AND (p.full_name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(query, params);

    return rows[0].count;
  }

  // Get count by profile ID
  static async getCountByProfileId(profileId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cms_profile_skills WHERE profile_id = ? AND is_delete = 0',
      [profileId]
    );

    return rows[0].count;
  }

  // Get count by category ID
  static async getCountByCategoryId(categoryId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cms_profile_skills WHERE category_id = ? AND is_delete = 0',
      [categoryId]
    );

    return rows[0].count;
  }

  // Get profile skills with detailed information
  static async findAllWithDetails(limit = 10, offset = 0, filters = {}) {
    let query = `
      SELECT 
        ps.id, ps.profile_id, ps.category_id, ps.skill_id, ps.percent, 
        ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
        ps.created_at, ps.updated_at,
        p.full_name as profile_name,
        p.email as profile_email,
        c.name as category_name,
        s.name as skill_name,
        s.icon as skill_icon,
        s.description as skill_description
      FROM cms_profile_skills ps
      LEFT JOIN cms_profile p ON ps.profile_id = p.id
      LEFT JOIN cms_m_category c ON ps.category_id = c.id AND c.is_deleted = 0
      LEFT JOIN cms_m_skills s ON ps.skill_id = s.id AND s.is_deleted = 0
      WHERE ps.is_delete = 0
    `;
    const params = [];

    // Apply filters
    if (filters.profile_id) {
      query += ' AND ps.profile_id = ?';
      params.push(filters.profile_id);
    }

    if (filters.category_id) {
      query += ' AND ps.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.skill_id) {
      query += ' AND ps.skill_id = ?';
      params.push(filters.skill_id);
    }

    if (filters.is_active !== undefined) {
      query += ' AND ps.is_active = ?';
      params.push(filters.is_active);
    }

    query += ' ORDER BY ps.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => {
      const profileSkill = new ProfileSkill(row);
      profileSkill.profile_name = row.profile_name;
      profileSkill.profile_email = row.profile_email;
      profileSkill.category_name = row.category_name;
      profileSkill.skill_name = row.skill_name;
      profileSkill.skill_icon = row.skill_icon;
      profileSkill.skill_description = row.skill_description;
      return profileSkill;
    }) : [];
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      profile_id: this.profile_id,
      category_id: this.category_id,
      skill_id: this.skill_id,
      percent: this.percent,
      is_active: this.is_active,
      is_delete: this.is_delete,
      created_by: this.created_by,
      updated_by: this.updated_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Include additional fields if they exist
      ...(this.profile_name && { profile_name: this.profile_name }),
      ...(this.profile_email && { profile_email: this.profile_email }),
      ...(this.category_name && { category_name: this.category_name }),
      ...(this.skill_name && { skill_name: this.skill_name }),
      ...(this.skill_icon && { skill_icon: this.skill_icon }),
      ...(this.skill_description && { skill_description: this.skill_description })
    };
  }

  // Find profile skills by profile ID with grouped/nested structure
  static async findByProfileIdGrouped(profileId, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT 
        ps.id, ps.profile_id, ps.percent, 
        ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
        ps.created_at, ps.updated_at,
        p.full_name as name,
        c.id as category_id,
        c.name as category_name,
        c.description as category_description,
        s.id as skill_id,
        s.name as skill_name,
        s.description as skill_description,
        s.icon as skill_icon
      FROM cms_profile_skills ps
      LEFT JOIN cms_profile p ON ps.profile_id = p.id
      LEFT JOIN cms_m_category c ON ps.category_id = c.id
      LEFT JOIN cms_m_skills s ON ps.skill_id = s.id
      WHERE ps.profile_id = ? AND ps.is_delete = 0 
      ORDER BY ps.created_at DESC LIMIT ? OFFSET ?`,
      [profileId, limit, offset]
    );

    if (rows.length === 0) return [];

    // Group by profile
    const profilesMap = new Map();

    rows.forEach(row => {
      const profileKey = `${row.profile_id}`;
      
      if (!profilesMap.has(profileKey)) {
        profilesMap.set(profileKey, {
          id: row.id,
          profile_id: row.profile_id,
          name: row.name,
          is_active: row.is_active,
          is_delete: row.is_delete,
          created_by: row.created_by,
          updated_by: row.updated_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          category_name: []
        });
      }

      const profile = profilesMap.get(profileKey);
      
      // Check if category already exists in this profile
      let category = profile.category_name.find(cat => cat.id === row.category_id);
      
      if (!category) {
        category = {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
          skills: []
        };
        profile.category_name.push(category);
      }

      // Add skill to category with percent after icon
      category.skills.push({
        id: row.skill_id,
        name: row.skill_name,
        description: row.skill_description,
        icon: row.skill_icon,
        percent: row.percent
      });
    });

    return Array.from(profilesMap.values());
  }
}

module.exports = ProfileSkill; 