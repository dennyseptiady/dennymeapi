const express = require('express');
const router = express.Router();
const {
  getAllProfileSkills,
  getProfileSkillById,
  getProfileSkillsByProfileId,
  getProfileSkillsByCategoryId,
  getProfileSkillsWithDetails,
  createProfileSkill,
  updateProfileSkill,
  deleteProfileSkill,
  toggleProfileSkillStatus
} = require('../controllers/profileSkillController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateProfileSkill, validateProfileSkillUpdate } = require('../middleware/validation');

// Public routes
router.get('/', getAllProfileSkills);
router.get('/details', getProfileSkillsWithDetails);
router.get('/profile/:profileId', getProfileSkillsByProfileId);
router.get('/category/:categoryId', getProfileSkillsByCategoryId);
router.get('/:id', getProfileSkillById);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), validateProfileSkill, createProfileSkill);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateProfileSkillUpdate, updateProfileSkill);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteProfileSkill);
router.patch('/:id/toggle-status', authenticateToken, authorizeRoles('admin'), toggleProfileSkillStatus);

module.exports = router; 