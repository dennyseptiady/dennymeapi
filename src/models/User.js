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

  // Create new user
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, email, hashedPassword, role]
    );
    
    return result.insertId;
  }

  // Find user by email (without password - for general use)
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE email = ? AND is_active = 1',
      [email]
    );
    
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Find user by email with password (for authentication)
  static async findByEmailWithPassword(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );
    
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Find user by ID (without password - for general use)
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ? AND is_active = 1',
      [id]
    );
    
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Find user by ID with password (for authentication)
  static async findByIdWithPassword(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [id]
    );
    
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // Get all users (without password - for general use)
  static async findAll(limit = 10, offset = 0) {
    // For MySQL 9.x compatibility, use simple LIMIT and handle pagination differently
    // Get more records than needed and slice in application
    const actualLimit = limit + offset;
    
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ?',
      [actualLimit]
    );
    
    // Slice the results to get the correct page
    const pagedResults = rows.slice(offset, offset + limit);
    return pagedResults.map(row => new User(row));
  }

  // Get all users with password (for admin operations that might need password)
  static async findAllWithPassword(limit = 10, offset = 0) {
    // For MySQL 9.x compatibility, use simple LIMIT and handle pagination differently
    // Get more records than needed and slice in application
    const actualLimit = limit + offset;
    
    const [rows] = await pool.execute(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT ?',
      [actualLimit]
    );
    
    // Slice the results to get the correct page
    const pagedResults = rows.slice(offset, offset + limit);
    return pagedResults.map(row => new User(row));
  }

  // Update user
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Delete user (soft delete)
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Change password
  async changePassword(newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const [result] = await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, this.id]
    );
    
    return result.affectedRows > 0;
  }

  // Get user count
  static async getCount() {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE is_active = 1'
    );
    
    return rows[0].count;
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User; 