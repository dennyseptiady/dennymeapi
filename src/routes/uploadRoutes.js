const express = require('express');
const router = express.Router();
const {
  uploadProfileImage,
  deleteProfileImage,
  getImageInfo
} = require('../controllers/uploadController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadProfileImage: uploadMiddleware, handleUploadError } = require('../middleware/upload');

// Upload profile image (Admin only)
router.post('/profile-image', 
  authenticateToken, 
  authorizeRoles('admin'), 
  uploadMiddleware, 
  handleUploadError, 
  uploadProfileImage
);

// Get image info (Public)
router.get('/profile-image/:filename', getImageInfo);

// Delete profile image (Admin only)
router.delete('/profile-image/:filename', 
  authenticateToken, 
  authorizeRoles('admin'), 
  deleteProfileImage
);

module.exports = router; 