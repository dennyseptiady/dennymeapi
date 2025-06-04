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

  // Helper function to safely parse integers for SQL queries
  static _safeInt(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = parseInt(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Helper function to validate skill name
  static _isValidName(name) {
    return name && typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100;
  }

  // Helper function to validate icon
  static _isValidIcon(icon) {
    return !icon || (typeof icon === 'string' && icon.trim().length <= 255);
  }

  // Create new skill
  static async create(skillData) {
    try {
      const { category_id, name, description, icon, is_active = 1, created_by, updated_by } = skillData;

      // Validate input
      const safeCategoryId = this._safeInt(category_id, 0, 1);
      if (safeCategoryId === 0) {
        throw new Error('Valid category ID is required');
      }

      if (!this._isValidName(name)) {
        throw new Error('Skill name must be between 2-100 characters');
      }

      if (description && typeof description !== 'string') {
        throw new Error('Description must be a string');
      }

      if (!this._isValidIcon(icon)) {
        throw new Error('Icon must be a string with maximum 255 characters');
      }

      const safeCreatedBy = this._safeInt(created_by, 0, 1);
      const safeUpdatedBy = this._safeInt(updated_by, 0, 1);

      if (safeCreatedBy === 0 || safeUpdatedBy === 0) {
        throw new Error('Valid created_by and updated_by user IDs are required');
      }

      // Verify category exists
      const [categoryExists] = await pool.execute(
        'SELECT 1 FROM cms_m_category WHERE id = ? AND is_deleted = 0',
        [safeCategoryId]
      );

      if (categoryExists.length === 0) {
        throw new Error('Category not found');
      }

      const [result] = await pool.execute(
        'INSERT INTO cms_m_skills (category_id, name, description, icon, is_active, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          safeCategoryId,
          name.trim(),
          description ? description.trim() : null,
          icon ? icon.trim() : null,
          is_active ? 1 : 0,
          safeCreatedBy,
          safeUpdatedBy
        ]
      );

      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Skill name already exists in this category');
      }
      console.error('Error in Skill.create:', error);
      throw error;
    }
  }

  // Find skill by ID
  static async findById(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, category_id, name, description, icon, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_skills WHERE id = ? AND is_deleted = 0',
        [safeId]
      );

      return rows.length > 0 ? new Skill(rows[0]) : null;
    } catch (error) {
      console.error('Error in Skill.findById:', error);
      throw error;
    }
  }

  // Find skill by name and category
  static async findByNameAndCategory(name, categoryId) {
    try {
      if (!this._isValidName(name)) {
        return null;
      }

      const safeCategoryId = this._safeInt(categoryId, 0, 1);
      if (safeCategoryId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, category_id, name, description, icon, is_active, created_by, updated_by, created_at, updated_at FROM cms_m_skills WHERE name = ? AND category_id = ? AND is_deleted = 0',
        [name.trim(), safeCategoryId]
      );

      return rows.length > 0 ? new Skill(rows[0]) : null;
    } catch (error) {
      console.error('Error in Skill.findByNameAndCategory:', error);
      throw error;
    }
  }

  // Find all skills
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      // Safe parameter handling for MySQL 9.x compatibility
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      // Build WHERE clause
      let whereClause = 'WHERE s.is_deleted = 0';
      const queryParams = [];

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (s.name LIKE ? OR s.description LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      // Filter by category
      if (filters.category_id) {
        const safeCategoryId = this._safeInt(filters.category_id, 0, 1);
        if (safeCategoryId > 0) {
          whereClause += ' AND s.category_id = ?';
          queryParams.push(safeCategoryId);
        }
      }

      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND s.is_active = 1';
      }

      // Include category information
      const query = `
        SELECT 
          s.id, s.category_id, s.name, s.description, s.icon, s.is_active, 
          s.created_by, s.updated_by, s.created_at, s.updated_at,
          c.name as category_name
        FROM cms_m_skills s
        LEFT JOIN cms_m_category c ON s.category_id = c.id AND c.is_deleted = 0
        ${whereClause}
        ORDER BY s.created_at DESC 
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, queryParams);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => {
        const skill = new Skill(row);
        skill.category_name = row.category_name;
        return skill;
      });
    } catch (error) {
      console.error('Error in Skill.findAll:', error);
      throw error;
    }
  }

  // Search skills by name or description
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return [];
      }

      return await this.findAll(limit, offset, { search: searchTerm });
    } catch (error) {
      console.error('Error in Skill.search:', error);
      throw error;
    }
  }

  // Find skills by category
  static async findByCategory(categoryId, limit = 10, offset = 0) {
    try {
      const safeCategoryId = this._safeInt(categoryId, 0, 1);
      if (safeCategoryId === 0) {
        return [];
      }

      return await this.findAll(limit, offset, { category_id: safeCategoryId });
    } catch (error) {
      console.error('Error in Skill.findByCategory:', error);
      throw error;
    }
  }

  // Get active skills only
  static async findActive(limit = 10, offset = 0) {
    try {
      return await this.findAll(limit, offset, { includeInactive: false });
    } catch (error) {
      console.error('Error in Skill.findActive:', error);
      throw error;
    }
  }

  // Get count by category
  static async getCountByCategory(categoryId) {
    try {
      const safeCategoryId = this._safeInt(categoryId, 0, 1);
      if (safeCategoryId === 0) {
        return 0;
      }

      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_m_skills WHERE category_id = ? AND is_deleted = 0 AND is_active = 1',
        [safeCategoryId]
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in Skill.getCountByCategory:', error);
      return 0;
    }
  }

  // Update skill
  static async update(id, updateData) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid skill ID');
      }

      // Validate and sanitize update data
      const allowedFields = ['category_id', 'name', 'description', 'icon', 'is_active', 'updated_by'];
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          let value = updateData[key];

          // Validate and sanitize each field
          switch (key) {
            case 'category_id':
              const safeCategoryId = this._safeInt(value, 0, 1);
              if (safeCategoryId > 0) {
                fields.push(`${key} = ?`);
                values.push(safeCategoryId);
              }
              break;
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
            case 'icon':
              if (this._isValidIcon(value)) {
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

      // If category_id is being updated, verify it exists
      if (updateData.category_id) {
        const safeCategoryId = this._safeInt(updateData.category_id, 0, 1);
        if (safeCategoryId > 0) {
          const [categoryExists] = await pool.execute(
            'SELECT 1 FROM cms_m_category WHERE id = ? AND is_deleted = 0',
            [safeCategoryId]
          );

          if (categoryExists.length === 0) {
            throw new Error('Category not found');
          }
        }
      }

      fields.push('updated_at = NOW()');
      values.push(safeId);

      const [result] = await pool.execute(
        `UPDATE cms_m_skills SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Skill name already exists in this category');
      }
      console.error('Error in Skill.update:', error);
      throw error;
    }
  }

  // Delete skill (soft delete)
  static async delete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid skill ID');
      }

      // Check if skill is used in profile skills
      const [usageCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_skills WHERE skill_id = ?',
        [safeId]
      );

      if (usageCount[0].count > 0) {
        throw new Error('Cannot delete skill that is used in profiles');
      }

      const [result] = await pool.execute(
        'UPDATE cms_m_skills SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Skill.delete:', error);
      throw error;
    }
  }

  // Restore skill (undo soft delete)
  static async restore(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid skill ID');
      }

      const [result] = await pool.execute(
        'UPDATE cms_m_skills SET is_deleted = 0, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Skill.restore:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleStatus(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid skill ID');
      }

      const skill = await this.findById(safeId);
      if (!skill) {
        throw new Error('Skill not found');
      }

      const newStatus = skill.is_active === 1 ? 0 : 1;

      const [result] = await pool.execute(
        'UPDATE cms_m_skills SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Skill.toggleStatus:', error);
      throw error;
    }
  }

  // Get skill count
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

      // Filter by category
      if (filters.category_id) {
        const safeCategoryId = this._safeInt(filters.category_id, 0, 1);
        if (safeCategoryId > 0) {
          whereClause += ' AND category_id = ?';
          queryParams.push(safeCategoryId);
        }
      }

      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND is_active = 1';
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM cms_m_skills ${whereClause}`,
        queryParams
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in Skill.getCount:', error);
      throw error;
    }
  }

  // Check if skill name exists in category
  static async existsByNameAndCategory(name, categoryId) {
    try {
      if (!this._isValidName(name)) {
        return false;
      }

      const safeCategoryId = this._safeInt(categoryId, 0, 1);
      if (safeCategoryId === 0) {
        return false;
      }

      const [rows] = await pool.execute(
        'SELECT 1 FROM cms_m_skills WHERE name = ? AND category_id = ? AND is_deleted = 0 LIMIT 1',
        [name.trim(), safeCategoryId]
      );

      return rows.length > 0;
    } catch (error) {
      console.error('Error in Skill.existsByNameAndCategory:', error);
      return false;
    }
  }

  // Get skill statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_skills,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_skills,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_skills,
          COUNT(DISTINCT category_id) as categories_with_skills,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as created_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as created_this_week
        FROM cms_m_skills 
        WHERE is_deleted = 0
      `);

      return stats[0];
    } catch (error) {
      console.error('Error in Skill.getStatistics:', error);
      throw error;
    }
  }

  // Get most used skills (by profile_skills count)
  static async getMostUsed(limit = 5) {
    try {
      const safeLimit = this._safeInt(limit, 5, 1, 100);

      const query = `
        SELECT 
          s.id, s.category_id, s.name, s.description, s.icon, s.is_active,
          s.created_by, s.updated_by, s.created_at, s.updated_at,
          c.name as category_name,
          COUNT(ps.id) as usage_count
        FROM cms_m_skills s
        LEFT JOIN cms_m_category c ON s.category_id = c.id AND c.is_deleted = 0
        LEFT JOIN cms_profile_skills ps ON s.id = ps.skill_id
        WHERE s.is_deleted = 0 AND s.is_active = 1
        GROUP BY s.id, s.category_id, s.name, s.description, s.icon, s.is_active,
                 s.created_by, s.updated_by, s.created_at, s.updated_at, c.name
        ORDER BY usage_count DESC, s.name ASC
        LIMIT ${safeLimit}
      `;

      const [rows] = await pool.execute(query);

      return rows.map(row => {
        const skill = new Skill(row);
        skill.category_name = row.category_name;
        skill.usage_count = row.usage_count;
        return skill;
      });
    } catch (error) {
      console.error('Error in Skill.getMostUsed:', error);
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      category_id: this.category_id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      is_active: this.is_active,
      created_by: this.created_by,
      updated_by: this.updated_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
      category_name: this.category_name || undefined,
      usage_count: this.usage_count || undefined
    };
  }

  // Convert to public JSON (limited fields)
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      is_active: this.is_active,
      category_name: this.category_name || undefined
    };
  }
}

module.exports = Skill;