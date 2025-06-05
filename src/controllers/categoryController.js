const Category = require('../models/Category');

// Get all categories
const getAllCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Fix: Pass search as filters object instead of string
    const filters = search ? { search } : {};
    const categories = await Category.findAll(limit, offset, filters);
    const totalData = await Category.getCount(filters);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        categories: categories.map(category => category.toJSON()),
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

// Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        categories: category.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, is_active, created_by, updated_by } = req.body;

    // Check if category already exists
    const existingCategories = await Category.findAll();
    const existingCategory = existingCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
      return res.status(400).json({
        status: 'error',
        message: 'Category with this name already exists'
      });
    }

    // Create new category
    const categoryId = await Category.create({ name, description, is_active, created_by, updated_by });
    
    // Get created category
    const newCategory = await Category.findById(categoryId);

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: {
        category: newCategory.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, updated_by } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Check if name is being changed and already exists
    if (name && name.toLowerCase() !== existingCategory.name.toLowerCase()) {
      const allCategories = await Category.findAll();
      const nameExists = allCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.id !== parseInt(id));
      if (nameExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Category name already in use'
        });
      }
    }

    // Update category
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (updated_by) updateData.updated_by = updated_by;

    const updated = await Category.update(id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update category'
      });
    }

    // Get updated category
    const updatedCategory = await Category.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: {
        category: updatedCategory.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (Soft delete)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Delete category (soft delete)
    const deleted = await Category.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete category'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle category status
const toggleCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Toggle status
    const newStatus = existingCategory.is_active === 1 ? 0 : 1;
    const updated = await Category.update(id, { is_active: newStatus });
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update category status'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Category ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories with skills
const getAllCategoriesWithSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const categories = await Category.findAllWithSkills(limit, offset);
    const totalData = await Category.getCount();
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        categories: categories.map(category => category.toJSON()),
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

// Get categories with skills (with optional categoryId filter)
const getCategoriesWithSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId || req.params.categoryId || null;

    const categories = await Category.findCategoriesWithSkills(categoryId, limit, offset);
    const totalData = await Category.getCount();
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        categories,
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

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getAllCategoriesWithSkills,
  getCategoriesWithSkills
};