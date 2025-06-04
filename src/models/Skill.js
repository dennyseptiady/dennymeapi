const { pool } = require('../config/database');

class Skill {
  constructor(data) {
    this.id = data.id;
    this.category_id = data.category_id;
    this.name = data.name;
    this.description = data.description;
    this.icon = data.icon;
    this.is_active = data.is_active;
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new skill
  static async create(skillData) {
    const { category_id, name, description, icon, is_active = 1, created_by, updated_by } = skillData;

    const [result] = await pool.execute(
      'INSERT INTO cms_m_skills (category_id, name, description, icon, is_active, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [category_id, name, description, icon, is_active, created_by, updated_by]
    );

    return result.insertId;
  }

  // Find skill by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, category_id, name, description, icon, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_skills WHERE id = ? AND is_deleted = 0',
      [id]
    );

    return rows.length > 0 ? new Skill(rows[0]) : null;
  }

  // Find all skills
  static async findAll(limit = 10, offset = 0, search = '') {
    let query = 'SELECT id, category_id, name, description, icon, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_skills WHERE is_deleted = 0';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => new Skill(row)) : [];
  }

  // Find skills by category
  static async findByCategory(categoryId, limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      'SELECT id, category_id, name, description, icon, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_skills WHERE category_id = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [categoryId, limit, offset]
    );

    return rows.length > 0 ? rows.map(row => new Skill(row)) : [];
  }

  // Get count by category
  static async getCountByCategory(categoryId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM cms_m_skills WHERE category_id = ? AND is_deleted = 0',
      [categoryId]
    );

    return rows[0].count;
  }

  // Update skill
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
      `UPDATE cms_m_skills SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete skill
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE cms_m_skills SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get skill count
  static async getCount(search = '') {
    let query = 'SELECT COUNT(*) as count FROM cms_m_skills WHERE is_active = 1';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    const [rows] = await pool.execute(query, params);

    return rows[0].count;
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { is_deleted, ...skillWithoutIsDeleted } = this;
    return skillWithoutIsDeleted;
  }
}

module.exports = Skill;