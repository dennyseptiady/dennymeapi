const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.is_active = data.is_active !== undefined ? data.is_active : 1;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Helper function to safely parse integers for SQL queries
  static _safeInt(value, defaultValue = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const parsed = parseInt(value) || defaultValue;
    return Math.max(min, Math.min(max, parsed));
  }

  // Helper function to validate email format
  static _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Create new user
  static async create(userData) {
    try {
      const { name, email, password, role = 'user' } = userData;
      
      // Validate input
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (!email || !this._isValidEmail(email)) {
        throw new Error('Valid email is required');
      }
      
      if (!password || typeof password !== 'string' || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (!['admin', 'user'].includes(role)) {
        throw new Error('Role must be either admin or user');
      }
      
      // Hash password
      const saltRounds = this._safeInt(process.env.BCRYPT_ROUNDS, 12, 10, 15);
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [name.trim(), email.toLowerCase().trim(), hashedPassword, role]
      );
      
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email (without password - for general use)
  static async findByEmail(email) {
    try {
      if (!email || !this._isValidEmail(email)) {
        return null;
      }
      
      const [rows] = await pool.execute(
        'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE email = ? AND is_active = 1',
        [email.toLowerCase().trim()]
      );
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  // Find user by email with password (for authentication)
  static async findByEmailWithPassword(email) {
    try {
      if (!email || !this._isValidEmail(email)) {
        return null;
      }
      
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = 1',
        [email.toLowerCase().trim()]
      );
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error in findByEmailWithPassword:', error);
      throw error;
    }
  }

  // Find user by ID (without password - for general use)
  static async findById(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }
      
      const [rows] = await pool.execute(
        'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ? AND is_active = 1',
        [safeId]
      );
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Find user by ID with password (for authentication)
  static async findByIdWithPassword(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }
      
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND is_active = 1',
        [safeId]
      );
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error in findByIdWithPassword:', error);
      throw error;
    }
  }

  // Find user by ID including inactive users (for admin operations)
  static async findByIdIncludingInactive(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        return null;
      }
      
      const [rows] = await pool.execute(
        'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
        [safeId]
      );
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error in findByIdIncludingInactive:', error);
      throw error;
    }
  }

  // Get all users (without password - for general use)
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      // Safe parameter handling for MySQL 9.x compatibility
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;
      
      // Build WHERE clause for filters
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      
      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND is_active = 1';
      }
      
      // Filter by role
      if (filters.role && ['admin', 'user'].includes(filters.role)) {
        whereClause += ' AND role = ?';
        queryParams.push(filters.role);
      }
      
      // Filter by search term (name or email)
      if (filters.search && typeof filters.search === 'string') {
        whereClause += ' AND (name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm);
      }
      
      // Use string interpolation for LIMIT to avoid MySQL 9.x parameter binding issues
      const query = `SELECT id, name, email, role, is_active, created_at, updated_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT ${actualLimit}`;
      
      const [rows] = await pool.execute(query, queryParams);
      
      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new User(row));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Get all users with password (for admin operations that might need password)
  static async findAllWithPassword(limit = 10, offset = 0, filters = {}) {
    try {
      // Safe parameter handling for MySQL 9.x compatibility
      const safeLimit = this._safeInt(limit, 10, 1, 1000);
      const safeOffset = this._safeInt(offset, 0, 0);
      const actualLimit = safeLimit + safeOffset;
      
      // Build WHERE clause for filters
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      
      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND is_active = 1';
      }
      
      // Filter by role
      if (filters.role && ['admin', 'user'].includes(filters.role)) {
        whereClause += ' AND role = ?';
        queryParams.push(filters.role);
      }
      
      // Filter by search term (name or email)
      if (filters.search && typeof filters.search === 'string') {
        whereClause += ' AND (name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm);
      }
      
      // Use string interpolation for LIMIT to avoid MySQL 9.x parameter binding issues
      const query = `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT ${actualLimit}`;
      
      const [rows] = await pool.execute(query, queryParams);
      
      // Slice the results to get the correct page
      const pagedResults = rows.slice(safeOffset, safeOffset + safeLimit);
      return pagedResults.map(row => new User(row));
    } catch (error) {
      console.error('Error in findAllWithPassword:', error);
      throw error;
    }
  }

  // Get users by role
  static async findByRole(role, limit = 10, offset = 0) {
    try {
      if (!['admin', 'user'].includes(role)) {
        throw new Error('Invalid role specified');
      }
      
      return await this.findAll(limit, offset, { role });
    } catch (error) {
      console.error('Error in findByRole:', error);
      throw error;
    }
  }

  // Search users by name or email
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return [];
      }
      
      return await this.findAll(limit, offset, { search: searchTerm });
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, updateData) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid user ID');
      }
      
      // Validate and sanitize update data
      const allowedFields = ['name', 'email', 'role', 'is_active'];
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          let value = updateData[key];
          
          // Validate and sanitize each field
          switch (key) {
            case 'name':
              if (typeof value === 'string' && value.trim().length >= 2) {
                fields.push(`${key} = ?`);
                values.push(value.trim());
              }
              break;
            case 'email':
              if (typeof value === 'string' && this._isValidEmail(value)) {
                fields.push(`${key} = ?`);
                values.push(value.toLowerCase().trim());
              }
              break;
            case 'role':
              if (['admin', 'user'].includes(value)) {
                fields.push(`${key} = ?`);
                values.push(value);
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
      
      fields.push('updated_at = NOW()');
      values.push(safeId);
      
      const [result] = await pool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Delete user (soft delete)
  static async delete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid user ID');
      }
      
      const [result] = await pool.execute(
        'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?',
        [safeId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  // Restore user (undo soft delete)
  static async restore(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid user ID');
      }
      
      const [result] = await pool.execute(
        'UPDATE users SET is_active = 1, updated_at = NOW() WHERE id = ?',
        [safeId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in restore:', error);
      throw error;
    }
  }

  // Hard delete user (permanent deletion - use with caution)
  static async hardDelete(id) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid user ID');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [safeId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in hardDelete:', error);
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      if (!password || typeof password !== 'string') {
        return false;
      }
      
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error('Error in verifyPassword:', error);
      return false;
    }
  }

  // Change password
  async changePassword(newPassword) {
    try {
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const saltRounds = User._safeInt(process.env.BCRYPT_ROUNDS, 12, 10, 15);
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const [result] = await pool.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, this.id]
      );
      
      if (result.affectedRows > 0) {
        this.password = hashedPassword;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  }

  // Update user password by ID (admin function)
  static async updatePassword(id, newPassword) {
    try {
      const safeId = this._safeInt(id, 0, 1);
      if (safeId === 0) {
        throw new Error('Invalid user ID');
      }
      
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const saltRounds = this._safeInt(process.env.BCRYPT_ROUNDS, 12, 10, 15);
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const [result] = await pool.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, safeId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  }

  // Get user count
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      
      // Filter by active status
      if (filters.includeInactive !== true) {
        whereClause += ' AND is_active = 1';
      }
      
      // Filter by role
      if (filters.role && ['admin', 'user'].includes(filters.role)) {
        whereClause += ' AND role = ?';
        queryParams.push(filters.role);
      }
      
      // Filter by search term
      if (filters.search && typeof filters.search === 'string') {
        whereClause += ' AND (name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search.trim()}%`;
        queryParams.push(searchTerm, searchTerm);
      }
      
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM users ${whereClause}`,
        queryParams
      );
      
      return rows[0].count;
    } catch (error) {
      console.error('Error in getCount:', error);
      throw error;
    }
  }

  // Get count by role
  static async getCountByRole(role) {
    try {
      if (!['admin', 'user'].includes(role)) {
        throw new Error('Invalid role specified');
      }
      
      return await this.getCount({ role });
    } catch (error) {
      console.error('Error in getCountByRole:', error);
      throw error;
    }
  }

  // Check if user exists by email
  static async existsByEmail(email) {
    try {
      if (!email || !this._isValidEmail(email)) {
        return false;
      }
      
      const [rows] = await pool.execute(
        'SELECT 1 FROM users WHERE email = ? LIMIT 1',
        [email.toLowerCase().trim()]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error in existsByEmail:', error);
      return false;
    }
  }

  // Get recently created users
  static async getRecentUsers(limit = 5) {
    try {
      const safeLimit = this._safeInt(limit, 5, 1, 100);
      
      const [rows] = await pool.execute(
        `SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT ${safeLimit}`
      );
      
      return rows.map(row => new User(row));
    } catch (error) {
      console.error('Error in getRecentUsers:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_users,
          SUM(CASE WHEN role = 'admin' AND is_active = 1 THEN 1 ELSE 0 END) as active_admins,
          SUM(CASE WHEN role = 'user' AND is_active = 1 THEN 1 ELSE 0 END) as active_regular_users,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as users_created_today,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as users_created_this_week
        FROM users
      `);
      
      return stats[0];
    } catch (error) {
      console.error('Error in getStatistics:', error);
      throw error;
    }
  }

  // Update last login timestamp
  async updateLastLogin() {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET updated_at = NOW() WHERE id = ?',
        [this.id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in updateLastLogin:', error);
      return false;
    }
  }

  // Convert to JSON (exclude password and sensitive info)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Convert to public JSON (limited fields for public API)
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      created_at: this.created_at
    };
  }

  // Convert to admin JSON (all fields except password)
  toAdminJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User; 