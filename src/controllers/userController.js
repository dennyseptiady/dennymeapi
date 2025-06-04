const User = require('../models/User');

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await User.findAll(limit, offset);
    const totalData = await User.getCount();
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(user => user.toJSON()),
        pagination: {
          currentPage: page,
          totalPages,
          totalData,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new user (Admin only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const userId = await User.create({ name, email, password, role });
    
    // Get created user (without password)
    const newUser = await User.findById(userId);

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: newUser.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user (Admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await User.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const updated = await User.update(id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update user'
      });
    }

    // Get updated user
    const updatedUser = await User.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only) - Soft delete
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account'
      });
    }

    // Delete user (soft delete)
    const deleted = await User.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete user'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user status (Admin only)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot deactivate your own account'
      });
    }

    // Toggle status
    const newStatus = existingUser.is_active === 1 ? 0 : 1;
    const updated = await User.update(id, { is_active: newStatus });
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update user status'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `User ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
}; 