const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getAllCategoriesWithSkills,
  getCategoriesWithSkills
} = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateCategory, validateCategoryUpdate } = require('../middleware/validation');

// Public routes
router.get('/', getAllCategories);
router.get('/with-skills', getAllCategoriesWithSkills);
router.get('/skills', getCategoriesWithSkills); // New flexible endpoint
router.get('/skills/:categoryId', getCategoriesWithSkills); // With specific categoryId
router.get('/:id', getCategoryById);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), validateCategory, createCategory);
router.put('/:id', authenticateToken, authorizeRoles('admin'), validateCategoryUpdate, updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteCategory);
router.patch('/:id/toggle-status', authenticateToken, authorizeRoles('admin'), toggleCategoryStatus);

module.exports = router;
