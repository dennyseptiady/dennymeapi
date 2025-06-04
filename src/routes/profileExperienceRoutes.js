const express = require('express');
const router = express.Router();
const {
  getAllProfileExperiences,
  getProfileExperienceById,
  getProfileExperiencesByProfileId,
  getCurrentProfileExperiencesByProfileId,
  getProfileExperiencesWithDetails,
  createProfileExperience,
  updateProfileExperience,
  deleteProfileExperience,
  toggleProfileExperienceCurrentStatus
} = require('../controllers/profileExperienceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateProfileExperience, validateProfileExperienceUpdate } = require('../middleware/validation');

// Public routes
router.get('/', getAllProfileExperiences);
router.get('/details', getProfileExperiencesWithDetails);
router.get('/profile/:profileId', getProfileExperiencesByProfileId);
router.get('/profile/:profileId/current', getCurrentProfileExperiencesByProfileId);
router.get('/:id', getProfileExperienceById);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), validateProfileExperience, createProfileExperience);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateProfileExperienceUpdate, updateProfileExperience);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteProfileExperience);
router.patch('/:id/toggle-current', authenticateToken, authorizeRoles('admin'), toggleProfileExperienceCurrentStatus);

module.exports = router; 