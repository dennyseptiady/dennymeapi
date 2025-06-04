const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  getSkillById,
  getSkillsByCategory,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillStatus
} = require('../controllers/skillController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateSkill, validateSkillUpdate } = require('../middleware/validation');

// Public routes
router.get('/', getAllSkills);
router.get('/:id', getSkillById);
router.get('/category/:categoryId', getSkillsByCategory);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), validateSkill, createSkill);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateSkillUpdate, updateSkill);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSkill);
router.patch('/:id/toggle-status', authenticateToken, authorizeRoles('admin'), toggleSkillStatus);

module.exports = router;
