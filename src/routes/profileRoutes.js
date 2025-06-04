const express = require('express');
const router = express.Router();
const {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileByEmail,
  searchProfiles,
  createProfileWithImage,
  updateProfileWithImage
} = require('../controllers/profileController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateProfile, validateProfileUpdate } = require('../middleware/validation');
const { uploadProfileImage, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getAllProfiles);
router.get('/search', searchProfiles);
router.get('/:id', getProfileById);
router.get('/email/:email', getProfileByEmail);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), validateProfile, createProfile);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateProfileUpdate, updateProfile);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteProfile);

// Protected routes with image upload (Admin only)
router.post('/with-image', 
  authenticateToken, 
  authorizeRoles('admin'), 
  uploadProfileImage, 
  handleUploadError, 
  validateProfile, 
  createProfileWithImage
);

router.put('/:id/with-image', 
  authenticateToken, 
  authorizeRoles('admin'), 
  uploadProfileImage, 
  handleUploadError, 
  validateProfileUpdate, 
  updateProfileWithImage
);

module.exports = router;
