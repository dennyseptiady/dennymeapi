const express = require('express');
const router = express.Router();
const {
  getAllProfileEducations,
  getProfileEducationById,
  getProfileEducationsByProfileId,
  getProfileEducationsWithDetails,
  createProfileEducation,
  updateProfileEducation,
  deleteProfileEducation
} = require('../controllers/profileEducationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateProfileEducation, validateProfileEducationUpdate } = require('../middleware/validation');

// Public routes
router.get('/', getAllProfileEducations);
router.get('/details', getProfileEducationsWithDetails);
router.get('/profile/:profileId', getProfileEducationsByProfileId);
router.get('/:id', getProfileEducationById);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), validateProfileEducation, createProfileEducation);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateProfileEducationUpdate, updateProfileEducation);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteProfileEducation);

module.exports = router; 