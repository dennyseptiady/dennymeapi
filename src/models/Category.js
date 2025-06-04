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

  // Helper function to safely parse integers for SQL queries
  static _safeInt(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = parseInt(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Helper function to validate category name
  static _isValidName(name) {
    return name && typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
  }

  // Create new category
  static async create(categoryData) {
    try {
      const { name, description, is_active = 1, created_by, updated_by } = categoryData;

      // Validate input
      if (!this._isValidName(name)) {
        throw new Error('Category name must be between 2-100 characters');
      }

      if (description && typeof description !== 'string') {
        throw new Error('Description must be a string');
      }

      const safeCreatedBy = this._safeInt(created_by, 0, 1);
      const safeUpdatedBy = this._safeInt(updated_by, 0, 1);

      if (safeCreatedBy === 0 || safeUpdatedBy === 0) {
        throw new Error('Valid created_by and updated_by user IDs are required');
      }

      const [result] = await pool.execute(
        'INSERT INTO cms_m_category (name, description, is_active, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [name.trim(), description ? description.trim() : null, is_active ? 1 : 0, safeCreatedBy, safeUpdatedBy]
      );

      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Category name already exists');
      }
      console.error('Error in Category.create:', error);
      throw error;
    }
  }

  // Find category by ID
  static async findById(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, name, description, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_category WHERE id = ? AND is_deleted = 0',
        [safeId]
      );

      return rows.length > 0 ? new Category(rows[0]) : null;
    } catch (error) {
      console.error('Error in Category.findById:', error);
      throw error;
    }
  }

  // Find category by name
  static async findByName(name) {
    try {
      if (!this._isValidName(name)) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, name, description, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_category WHERE name = ? AND is_deleted = 0',
        [name.trim()]
      );

      return rows.length > 0 ? new Category(rows[0]) : null;
    } catch (error) {
      console.error('Error in Category.findByName:', error);
      throw error;
    }
  }

  // Find all categories
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      // Safe parameter handling for MySQL 9.x compatibility
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      // Build WHERE clause
      let whereClause = 'WHERE is_deleted = 0';
      const queryParams = [];

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND is_active = 1';
      }

      // Filter by creator
      if (filters.created_by) {
        const safeCreatedBy = this._safeInt(filters.created_by, 0, 1);
        if (safeCreatedBy > 0) {
          whereClause += ' AND created_by = ?';
          queryParams.push(safeCreatedBy);
        }
      }

      // Use string interpolation for LIMIT to avoid MySQL 9.x parameter binding issues
      const query = `SELECT id, name, description, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_category ${whereClause} ORDER BY created_at DESC LIMIT ${actualLimit}`;

      const [rows] = await pool.execute(query, queryParams);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new Category(row));
    } catch (error) {
      console.error('Error in Category.findAll:', error);
      throw error;
    }
  }

  // Search categories by name or description
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return [];
      }

      return await this.findAll(limit, offset, { search: searchTerm });
    } catch (error) {
      console.error('Error in Category.search:', error);
      throw error;
    }
  }

  // Get active categories only
  static async findActive(limit = 10, offset = 0) {
    try {
      return await this.findAll(limit, offset, { includeInactive: false });
    } catch (error) {
      console.error('Error in Category.findActive:', error);
      throw error;
    }
  }

  // Update category
  static async update(id, updateData) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid category ID');
      }

      // Validate and sanitize update data
      const allowedFields = ['name', 'description', 'is_active', 'updated_by'];
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          let value = updateData[key];

          // Validate and sanitize each field
          switch (key) {
            case 'name':
              if (this._isValidName(value)) {
                fields.push(`${key} = ?`);
                values.push(value.trim());
              }
              break;
            case 'description':
              if (value === null || (typeof value === 'string' && value.length <= 500)) {
                fields.push(`${key} = ?`);
                values.push(value ? value.trim() : null);
              }
              break;
            case 'is_active':
              fields.push(`${key} = ?`);
              values.push(value ? 1 : 0);
              break;
            case 'updated_by':
              const safeUpdatedBy = this._safeInt(value, 0, 1);
              if (safeUpdatedBy > 0) {
                fields.push(`${key} = ?`);
                values.push(safeUpdatedBy);
              }
              break;
          }
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      fields.push('updated_at = NOW()');
      values.push(safeId);

      const [result] = await pool.execute(
        `UPDATE cms_m_category SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Category name already exists');
      }
      console.error('Error in Category.update:', error);
      throw error;
    }
  }

  // Delete category (soft delete)
  static async delete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid category ID');
      }

      // Check if category has associated skills
      const [skillCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_m_skills WHERE category_id = ? AND is_deleted = 0',
        [safeId]
      );

      if (skillCount[0].count > 0) {
        throw new Error('Cannot delete category that has associated skills');
      }

      const [result] = await pool.execute(
        'UPDATE cms_m_category SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Category.delete:', error);
      throw error;
    }
  }

  // Restore category (undo soft delete)
  static async restore(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid category ID');
      }

      const [result] = await pool.execute(
        'UPDATE cms_m_category SET is_deleted = 0, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Category.restore:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleStatus(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid category ID');
      }

      const category = await this.findById(safeId);
      if (!category) {
        throw new Error('Category not found');
      }

      const newStatus = category.is_active === 1 ? 0 : 1;

      const [result] = await pool.execute(
        'UPDATE cms_m_category SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Category.toggleStatus:', error);
      throw error;
    }
  }

  // Get category count
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE is_deleted = 0';
      const queryParams = [];

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND is_active = 1';
      }

      // Filter by creator
      if (filters.created_by) {
        const safeCreatedBy = this._safeInt(filters.created_by, 0, 1);
        if (safeCreatedBy > 0) {
          whereClause += ' AND created_by = ?';
          queryParams.push(safeCreatedBy);
        }
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM cms_m_category ${whereClause}`,
        queryParams
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in Category.getCount:', error);
      throw error;
    }
  }

  // Get categories with their skill counts
  static async findAllWithSkillCounts(limit = 10, offset = 0) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      const query = `
        SELECT 
          c.id, 
          c.name, 
          c.description, 
          c.is_active, 
          c.created_by, 
          c.updated_by, 
          c.created_at, 
          c.updated_at,
          COUNT(s.id) as skill_count
        FROM cms_m_category c 
        LEFT JOIN cms_m_skills s ON c.id = s.category_id AND s.is_deleted = 0
        WHERE c.is_deleted = 0
        GROUP BY c.id, c.name, c.description, c.is_active, c.created_by, c.updated_by, c.created_at, c.updated_at
        ORDER BY c.created_at DESC 
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => ({
        ...new Category(row),
        skill_count: row.skill_count
      }));
    } catch (error) {
      console.error('Error in Category.findAllWithSkillCounts:', error);
      throw error;
    }
  }

  // Get categories with skills (with optional categoryId filter)
  static async findCategoriesWithSkills(categoryId = null, limit = 10, offset = 0) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

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
        const safeCategoryId = this._safeInt(categoryId, 0, 1);
        if (safeCategoryId > 0) {
          query += ' AND c.id = ?';
          params.push(safeCategoryId);
        }
      }
      
      query += ` ORDER BY c.created_at DESC, s.created_at ASC LIMIT ${actualLimit}`;

      const [rows] = await pool.execute(query, params);

      // Slice and group results by category
      const pagedRows = rows.slice(safeOffset, safeOffset + safeLimit);
      const categoriesMap = new Map();
      
      pagedRows.forEach(row => {
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
    } catch (error) {
      console.error('Error in Category.findCategoriesWithSkills:', error);
      throw error;
    }
  }

  // Check if category name exists
  static async existsByName(name) {
    try {
      if (!this._isValidName(name)) {
        return false;
      }

      const [rows] = await pool.execute(
        'SELECT 1 FROM cms_m_category WHERE name = ? AND is_deleted = 0 LIMIT 1',
        [name.trim()]
      );

      return rows.length > 0;
    } catch (error) {
      console.error('Error in Category.existsByName:', error);
      return false;
    }
  }

  // Get category statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_categories,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_categories,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_categories,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as created_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as created_this_week
        FROM cms_m_category 
        WHERE is_deleted = 0
      `);

      return stats[0];
    } catch (error) {
      console.error('Error in Category.getStatistics:', error);
      throw error;
    }
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

  // Convert to public JSON (limited fields)
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      is_active: this.is_active
    };
  }
}

module.exports = Category;