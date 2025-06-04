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
    // Additional fields from joins
    this.profile_name = data.profile_name;
    this.category_name = data.category_name;
    this.skill_name = data.skill_name;
    this.skill_icon = data.skill_icon;
  }

  // Helper function to safely parse integers for SQL queries
  static _safeInt(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = parseInt(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Helper function to safely parse percentage
  static _safePercent(value, defaultValue = 0, min = 0, max = 100) {
    const parsed = parseInt(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Create new profile skill
  static async create(profileSkillData) {
    try {
      const { 
        profile_id, 
        category_id, 
        skill_id, 
        percent, 
        is_active = 1, 
        created_by, 
        updated_by 
      } = profileSkillData;

      // Validate required fields
      const safeProfileId = this._safeInt(profile_id, 0, 1);
      if (safeProfileId === 0) {
        throw new Error('Valid profile ID is required');
      }

      const safeCategoryId = this._safeInt(category_id, 0, 1);
      if (safeCategoryId === 0) {
        throw new Error('Valid category ID is required');
      }

      const safeSkillId = this._safeInt(skill_id, 0, 1);
      if (safeSkillId === 0) {
        throw new Error('Valid skill ID is required');
      }

      const safePercent = this._safePercent(percent, 0, 0, 100);
      if (safePercent < 1 || safePercent > 100) {
        throw new Error('Skill percentage must be between 1-100');
      }

      const safeCreatedBy = this._safeInt(created_by, 0, 1);
      const safeUpdatedBy = this._safeInt(updated_by, 0, 1);

      if (safeCreatedBy === 0 || safeUpdatedBy === 0) {
        throw new Error('Valid created_by and updated_by user IDs are required');
      }

      // Verify profile exists
      const [profileExists] = await pool.execute(
        'SELECT 1 FROM cms_profile WHERE id = ?',
        [safeProfileId]
      );

      if (profileExists.length === 0) {
        throw new Error('Profile not found');
      }

      // Verify category exists
      const [categoryExists] = await pool.execute(
        'SELECT 1 FROM cms_m_category WHERE id = ? AND is_deleted = 0',
        [safeCategoryId]
      );

      if (categoryExists.length === 0) {
        throw new Error('Category not found');
      }

      // Verify skill exists and belongs to the category
      const [skillExists] = await pool.execute(
        'SELECT 1 FROM cms_m_skills WHERE id = ? AND category_id = ? AND is_deleted = 0',
        [safeSkillId, safeCategoryId]
      );

      if (skillExists.length === 0) {
        throw new Error('Skill not found or does not belong to the specified category');
      }

      // Check if profile skill already exists
      const existing = await this.findByProfileAndSkill(safeProfileId, safeSkillId);
      if (existing) {
        throw new Error('Profile skill already exists for this skill');
      }

      const [result] = await pool.execute(
        'INSERT INTO cms_profile_skills (profile_id, category_id, skill_id, percent, is_active, is_delete, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())',
        [
          safeProfileId,
          safeCategoryId,
          safeSkillId,
          safePercent,
          is_active ? 1 : 0,
          safeCreatedBy,
          safeUpdatedBy
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error in ProfileSkill.create:', error);
      throw error;
    }
  }

  // Find profile skill by ID
  static async findById(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, profile_id, category_id, skill_id, percent, is_active, is_delete, created_by, updated_by, created_at, updated_at FROM cms_profile_skills WHERE id = ? AND is_delete = 0',
        [safeId]
      );

      return rows.length > 0 ? new ProfileSkill(rows[0]) : null;
    } catch (error) {
      console.error('Error in ProfileSkill.findById:', error);
      throw error;
    }
  }

  // Find profile skills by profile ID
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
          ps.id, ps.profile_id, ps.category_id, ps.skill_id, ps.percent, 
          ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
          ps.created_at, ps.updated_at,
          c.name as category_name,
          s.name as skill_name,
          s.icon as skill_icon
        FROM cms_profile_skills ps
        LEFT JOIN cms_m_category c ON ps.category_id = c.id AND c.is_deleted = 0
        LEFT JOIN cms_m_skills s ON ps.skill_id = s.id AND s.is_deleted = 0
        WHERE ps.profile_id = ? AND ps.is_delete = 0 
        ORDER BY ps.percent DESC, ps.created_at DESC
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, [safeProfileId]);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new ProfileSkill(row));
    } catch (error) {
      console.error('Error in ProfileSkill.findByProfileId:', error);
      throw error;
    }
  }

  // Find profile skills grouped by category
  static async findByProfileIdGrouped(profileId, limit = 50, offset = 0) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      if (safeProfileId === 0) {
        return [];
      }

      const safeLimit = this._safeInt(limit, 50, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      const query = `
        SELECT 
          ps.id, ps.profile_id, ps.category_id, ps.skill_id, ps.percent, 
          ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
          ps.created_at, ps.updated_at,
          c.name as category_name,
          s.name as skill_name,
          s.icon as skill_icon
        FROM cms_profile_skills ps
        LEFT JOIN cms_m_category c ON ps.category_id = c.id AND c.is_deleted = 0
        LEFT JOIN cms_m_skills s ON ps.skill_id = s.id AND s.is_deleted = 0
        WHERE ps.profile_id = ? AND ps.is_delete = 0 AND ps.is_active = 1
        ORDER BY c.name ASC, ps.percent DESC
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, [safeProfileId]);

      // Slice and group by category
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      const groupedSkills = {};

      pagedResults.forEach(row => {
        const categoryName = row.category_name || 'Uncategorized';
        
        if (!groupedSkills[categoryName]) {
          groupedSkills[categoryName] = {
            category_id: row.category_id,
            category_name: categoryName,
            skills: []
          };
        }
        
        groupedSkills[categoryName].skills.push(new ProfileSkill(row));
      });

      return Object.values(groupedSkills);
    } catch (error) {
      console.error('Error in ProfileSkill.findByProfileIdGrouped:', error);
      throw error;
    }
  }

  // Find all profile skills with enhanced filtering
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;

      // Build WHERE clause
      let whereClause = 'WHERE ps.is_delete = 0';
      const queryParams = [];

      // Filter by profile ID
      if (filters.profile_id) {
        const safeProfileId = this._safeInt(filters.profile_id, 0, 1);
        if (safeProfileId > 0) {
          whereClause += ' AND ps.profile_id = ?';
          queryParams.push(safeProfileId);
        }
      }

      // Filter by category ID
      if (filters.category_id) {
        const safeCategoryId = this._safeInt(filters.category_id, 0, 1);
        if (safeCategoryId > 0) {
          whereClause += ' AND ps.category_id = ?';
          queryParams.push(safeCategoryId);
        }
      }

      // Filter by skill ID
      if (filters.skill_id) {
        const safeSkillId = this._safeInt(filters.skill_id, 0, 1);
        if (safeSkillId > 0) {
          whereClause += ' AND ps.skill_id = ?';
          queryParams.push(safeSkillId);
        }
      }

      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND ps.is_active = 1';
      }

      // Filter by minimum percentage
      if (filters.min_percent !== undefined) {
        const minPercent = this._safePercent(filters.min_percent, 0, 0, 100);
        whereClause += ' AND ps.percent >= ?';
        queryParams.push(minPercent);
      }

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (p.full_name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      const query = `
        SELECT 
          ps.id, ps.profile_id, ps.category_id, ps.skill_id, ps.percent, 
          ps.is_active, ps.is_delete, ps.created_by, ps.updated_by, 
          ps.created_at, ps.updated_at,
          p.full_name as profile_name,
          c.name as category_name,
          s.name as skill_name,
          s.icon as skill_icon
        FROM cms_profile_skills ps
        LEFT JOIN cms_profile p ON ps.profile_id = p.id
        LEFT JOIN cms_m_category c ON ps.category_id = c.id AND c.is_deleted = 0
        LEFT JOIN cms_m_skills s ON ps.skill_id = s.id AND s.is_deleted = 0
        ${whereClause}
        ORDER BY ps.percent DESC, ps.created_at DESC
        LIMIT ${actualLimit}
      `;

      const [rows] = await pool.execute(query, queryParams);

      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new ProfileSkill(row));
    } catch (error) {
      console.error('Error in ProfileSkill.findAll:', error);
      throw error;
    }
  }

  // Search profile skills
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return [];
      }

      return await this.findAll(limit, offset, { search: searchTerm });
    } catch (error) {
      console.error('Error in ProfileSkill.search:', error);
      throw error;
    }
  }

  // Find profile skills by category ID
  static async findByCategoryId(categoryId, limit = 10, offset = 0) {
    try {
      const safeCategoryId = this._safeInt(categoryId, 0, 1);
      if (safeCategoryId === 0) {
        return [];
      }

      return await this.findAll(limit, offset, { category_id: safeCategoryId });
    } catch (error) {
      console.error('Error in ProfileSkill.findByCategoryId:', error);
      throw error;
    }
  }

  // Check if profile skill already exists
  static async findByProfileAndSkill(profileId, skillId) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      const safeSkillId = this._safeInt(skillId, 0, 1);

      if (safeProfileId === 0 || safeSkillId === 0) {
        return null;
      }

      const [rows] = await pool.execute(
        'SELECT id, profile_id, category_id, skill_id, percent, is_active, is_delete, created_by, updated_by, created_at, updated_at FROM cms_profile_skills WHERE profile_id = ? AND skill_id = ? AND is_delete = 0',
        [safeProfileId, safeSkillId]
      );

      return rows.length > 0 ? new ProfileSkill(rows[0]) : null;
    } catch (error) {
      console.error('Error in ProfileSkill.findByProfileAndSkill:', error);
      throw error;
    }
  }

  // Update profile skill
  static async update(id, updateData) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid profile skill ID');
      }

      // Validate and sanitize update data
      const allowedFields = [
        'profile_id', 'category_id', 'skill_id', 'percent', 'is_active', 'updated_by'
      ];
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          let value = updateData[key];

          // Validate and sanitize each field
          switch (key) {
            case 'profile_id':
            case 'category_id':
            case 'skill_id':
            case 'updated_by':
              const safeInt = this._safeInt(value, 0, 1);
              if (safeInt > 0) {
                fields.push(`${key} = ?`);
                values.push(safeInt);
              }
              break;
            case 'percent':
              const safePercent = this._safePercent(value, 0, 1, 100);
              if (safePercent >= 1 && safePercent <= 100) {
                fields.push(`${key} = ?`);
                values.push(safePercent);
              }
              break;
            case 'is_active':
              fields.push(`${key} = ?`);
              values.push(value ? 1 : 0);
              break;
          }
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Verify relationships if being updated
      if (updateData.profile_id) {
        const safeProfileId = this._safeInt(updateData.profile_id, 0, 1);
        if (safeProfileId > 0) {
          const [profileExists] = await pool.execute(
            'SELECT 1 FROM cms_profile WHERE id = ?',
            [safeProfileId]
          );

          if (profileExists.length === 0) {
            throw new Error('Profile not found');
          }
        }
      }

      if (updateData.category_id && updateData.skill_id) {
        const safeCategoryId = this._safeInt(updateData.category_id, 0, 1);
        const safeSkillId = this._safeInt(updateData.skill_id, 0, 1);

        if (safeCategoryId > 0 && safeSkillId > 0) {
          const [skillInCategory] = await pool.execute(
            'SELECT 1 FROM cms_m_skills WHERE id = ? AND category_id = ? AND is_deleted = 0',
            [safeSkillId, safeCategoryId]
          );

          if (skillInCategory.length === 0) {
            throw new Error('Skill does not belong to the specified category');
          }
        }
      }

      fields.push('updated_at = NOW()');
      values.push(safeId);

      const [result] = await pool.execute(
        `UPDATE cms_profile_skills SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileSkill.update:', error);
      throw error;
    }
  }

  // Delete profile skill (soft delete)
  static async delete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid profile skill ID');
      }

      const [result] = await pool.execute(
        'UPDATE cms_profile_skills SET is_delete = 1, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileSkill.delete:', error);
      throw error;
    }
  }

  // Restore profile skill (undo soft delete)
  static async restore(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid profile skill ID');
      }

      const [result] = await pool.execute(
        'UPDATE cms_profile_skills SET is_delete = 0, updated_at = NOW() WHERE id = ?',
        [safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileSkill.restore:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleStatus(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid profile skill ID');
      }

      const profileSkill = await this.findById(safeId);
      if (!profileSkill) {
        throw new Error('Profile skill not found');
      }

      const newStatus = profileSkill.is_active === 1 ? 0 : 1;

      const [result] = await pool.execute(
        'UPDATE cms_profile_skills SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, safeId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in ProfileSkill.toggleStatus:', error);
      throw error;
    }
  }

  // Get profile skill count
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE ps.is_delete = 0';
      const queryParams = [];

      // Filter by profile ID
      if (filters.profile_id) {
        const safeProfileId = this._safeInt(filters.profile_id, 0, 1);
        if (safeProfileId > 0) {
          whereClause += ' AND ps.profile_id = ?';
          queryParams.push(safeProfileId);
        }
      }

      // Filter by category ID
      if (filters.category_id) {
        const safeCategoryId = this._safeInt(filters.category_id, 0, 1);
        if (safeCategoryId > 0) {
          whereClause += ' AND ps.category_id = ?';
          queryParams.push(safeCategoryId);
        }
      }

      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND ps.is_active = 1';
      }

      // Filter by search term
      if (filters.search && typeof filters.search === 'string' && filters.search.trim().length > 0) {
        whereClause += ' AND (p.full_name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM cms_profile_skills ps
         LEFT JOIN cms_profile p ON ps.profile_id = p.id
         LEFT JOIN cms_m_category c ON ps.category_id = c.id AND c.is_deleted = 0
         LEFT JOIN cms_m_skills s ON ps.skill_id = s.id AND s.is_deleted = 0
         ${whereClause}`,
        queryParams
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in ProfileSkill.getCount:', error);
      throw error;
    }
  }

  // Get profile skill count by profile ID
  static async getCountByProfileId(profileId) {
    try {
      const safeProfileId = this._safeInt(profileId, 0, 1);
      if (safeProfileId === 0) {
        return 0;
      }

      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_skills WHERE profile_id = ? AND is_delete = 0',
        [safeProfileId]
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in ProfileSkill.getCountByProfileId:', error);
      return 0;
    }
  }

  // Get profile skill count by category ID
  static async getCountByCategoryId(categoryId) {
    try {
      const safeCategoryId = this._safeInt(categoryId, 0, 1);
      if (safeCategoryId === 0) {
        return 0;
      }

      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM cms_profile_skills WHERE category_id = ? AND is_delete = 0',
        [safeCategoryId]
      );

      return rows[0].count;
    } catch (error) {
      console.error('Error in ProfileSkill.getCountByCategoryId:', error);
      return 0;
    }
  }

  // Get profile skill statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_profile_skills,
          COUNT(DISTINCT profile_id) as profiles_with_skills,
          COUNT(DISTINCT skill_id) as unique_skills_used,
          COUNT(DISTINCT category_id) as categories_used,
          AVG(percent) as avg_skill_percentage,
          MAX(percent) as max_skill_percentage,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_skills,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as created_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as created_this_week
        FROM cms_profile_skills
        WHERE is_delete = 0
      `);

      return stats[0];
    } catch (error) {
      console.error('Error in ProfileSkill.getStatistics:', error);
      throw error;
    }
  }

  // Get most popular skills
  static async getMostPopularSkills(limit = 10) {
    try {
      const safeLimit = this._safeInt(limit, 10, 1, 100);

      const query = `
        SELECT 
          s.id,
          s.name as skill_name,
          s.icon as skill_icon,
          c.name as category_name,
          COUNT(ps.id) as usage_count,
          AVG(ps.percent) as avg_percentage
        FROM cms_m_skills s
        LEFT JOIN cms_m_category c ON s.category_id = c.id AND c.is_deleted = 0
        LEFT JOIN cms_profile_skills ps ON s.id = ps.skill_id AND ps.is_delete = 0 AND ps.is_active = 1
        WHERE s.is_deleted = 0
        GROUP BY s.id, s.name, s.icon, c.name
        HAVING usage_count > 0
        ORDER BY usage_count DESC, avg_percentage DESC
        LIMIT ${safeLimit}
      `;

      const [rows] = await pool.execute(query);

      return rows;
    } catch (error) {
      console.error('Error in ProfileSkill.getMostPopularSkills:', error);
      throw error;
    }
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
      profile_name: this.profile_name || undefined,
      category_name: this.category_name || undefined,
      skill_name: this.skill_name || undefined,
      skill_icon: this.skill_icon || undefined
    };
  }

  // Convert to public JSON (limited fields)
  toPublicJSON() {
    return {
      id: this.id,
      skill_name: this.skill_name,
      skill_icon: this.skill_icon,
      category_name: this.category_name,
      percent: this.percent,
      is_active: this.is_active
    };
  }
}

module.exports = ProfileSkill; 