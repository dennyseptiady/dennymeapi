const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRegister, validateUpdateUser } = require('../middleware/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// Admin only routes
router.get('/', authorizeRoles('admin'), userController.getAllUsers);
router.get('/:id', authorizeRoles('admin'), userController.getUserById);
router.post('/', authorizeRoles('admin'), validateRegister, userController.createUser);
router.put('/:id', authorizeRoles('admin'), validateUpdateUser, userController.updateUser);
router.delete('/:id', authorizeRoles('admin'), userController.deleteUser);
router.patch('/:id/toggle-status', authorizeRoles('admin'), userController.toggleUserStatus);

module.exports = router; 