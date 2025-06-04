const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Register new user
const register = async (req, res, next) => {
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
    
    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: newUser.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email with password for authentication
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      status: "success",
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updated = await User.update(userId, updateData);
    
    if (!updated) {
      return res.status(400).json({
        status: "error",
        message: 'Failed to update profile'
      });
    }

    // Get updated user
    const updatedUser = await User.findById(userId);

    res.status(200).json({
      status: "success",
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: "error",
        message: 'Current password is incorrect'
      });
    }

    // Change password
    const passwordChanged = await user.changePassword(newPassword);
    
    if (!passwordChanged) {
      return res.status(400).json({
        status: "error",
        message: 'Failed to change password'
      });
    }

    res.status(200).json({
      status: "success",
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: 'Logout successful. Please remove the token from client storage.'
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
}; 