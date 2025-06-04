const { pool } = require('../config/database');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.is_active = data.is_active;
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  } 

  // Create new category
  static async create(categoryData) {
    const { name, description, is_active = 1, created_by, updated_by } = categoryData;

    const [result] = await pool.execute(
      'INSERT INTO cms_m_category (name, description, is_active, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [name, description, is_active, created_by, updated_by]
    );

    return result.insertId;
  }

  // Find category by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, description, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_category WHERE id = ? AND is_deleted = 0',
      [id]
    );

    return rows.length > 0 ? new Category(rows[0]) : null;
  }

  // Find all categories
  static async findAll(limit = 10, offset = 0, search = '') {
    let query = 'SELECT id, name, description, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_category WHERE is_deleted = 0';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    return rows.length > 0 ? rows.map(row => new Category(row)) : [];
  }

  // Update category
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
      `UPDATE cms_m_category SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete category
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE cms_m_category SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  // Get category count
  static async getCount(search = '') {
    let query = 'SELECT COUNT(*) as count FROM cms_m_category WHERE is_deleted = 0';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    const [rows] = await pool.execute(query, params);

    return rows[0].count;
  }

  //Get all categories with skills
  static async findAllWithSkills(limit = 10, offset = 0) {
    const [rows] = await pool.execute(
      'SELECT c.id, c.name, c.description, c.is_active, c.created_by, c.updated_by, c.created_at, c.updated_at, s.id as skill_id, s.name as skill_name, s.description as skill_description, s.icon as skill_icon FROM cms_m_category c LEFT JOIN cms_m_skills s ON c.id = s.category_id WHERE c.is_deleted = 0 AND (s.is_deleted = 0 OR s.id IS NULL) ORDER BY c.created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return rows.length > 0 ? rows.map(row => new Category(row)) : [];
  }

  // Get categories with skills (with optional categoryId filter)
  static async findCategoriesWithSkills(categoryId = null, limit = 10, offset = 0) {
    let query = `
      SELECT 
        c.id, 
        c.name, 
        c.description, 
        c.is_active, 
        c.created_by, 
        c.updated_by, 
        c.created_at, 
        c.updated_at,
        s.id as skill_id,
        s.name as skill_name,
        s.description as skill_description,
        s.icon as skill_icon,
        s.is_active as skill_is_active
      FROM cms_m_category c 
      LEFT JOIN cms_m_skills s ON c.id = s.category_id AND s.is_deleted = 0
      WHERE c.is_deleted = 0
    `;
    
    const params = [];
    
    if (categoryId) {
      query += ' AND c.id = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY c.created_at DESC, s.created_at ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    // Group results by category
    const categoriesMap = new Map();
    
    rows.forEach(row => {
      const categoryId = row.id;
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: row.id,
          name: row.name,
          description: row.description,
          is_active: row.is_active,
          created_by: row.created_by,
          updated_by: row.updated_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          skills: []
        });
      }
      
      // Add skill if exists
      if (row.skill_id) {
        categoriesMap.get(categoryId).skills.push({
          id: row.skill_id,
          name: row.skill_name,
          description: row.skill_description,
          icon: row.skill_icon,
          is_active: row.skill_is_active
        });
      }
    });

    return Array.from(categoriesMap.values());
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_by: this.created_by,
      updated_by: this.updated_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Category;