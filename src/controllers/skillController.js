const Skill = require('../models/Skill');
const Category = require('../models/Category');

// Get all skills
const getAllSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Fix: Pass search as filters object instead of string
    const filters = search ? { search } : {};
    const skills = await Skill.findAll(limit, offset, filters);
    const totalData = await Skill.getCount(filters);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        skills: skills.map(skill => skill.toJSON()),
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

// Get skill by ID
const getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        skill: skill.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get skills by category ID
const getSkillsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    const skills = await Skill.findByCategory(categoryId, limit, offset);
    const totalData = await Skill.getCountByCategory(categoryId);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        skills: skills.map(skill => skill.toJSON()),
        category: category.toJSON(),
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

// Create new skill
const createSkill = async (req, res, next) => {
  try {
    const { category_id, name, description, icon, is_active, created_by, updated_by } = req.body;

    // Check if category exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Check if skill already exists in the same category
    const existingSkills = await Skill.findByCategory(category_id, 1000, 0); // Get all skills in category
    const existingSkill = existingSkills.find(skill => skill.name.toLowerCase() === name.toLowerCase());
    if (existingSkill) {
      return res.status(400).json({
        status: 'error',
        message: 'Skill with this name already exists in this category'
      });
    }

    // Create new skill
    const skillId = await Skill.create({ category_id, name, description, icon, is_active, created_by, updated_by });
    
    // Get created skill
    const newSkill = await Skill.findById(skillId);

    res.status(201).json({
      status: 'success',
      message: 'Skill created successfully',
      data: {
        skill: newSkill.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update skill
const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, icon, is_active, updated_by } = req.body;

    // Check if skill exists
    const existingSkill = await Skill.findById(id);
    if (!existingSkill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found'
      });
    }

    // Check if category exists (if category_id is being updated)
    if (category_id && category_id !== existingSkill.category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }
    }

    // Check if name is being changed and already exists in the same category
    if (name && name.toLowerCase() !== existingSkill.name.toLowerCase()) {
      const categoryToCheck = category_id || existingSkill.category_id;
      const skillsInCategory = await Skill.findByCategory(categoryToCheck, 1000, 0); // Get all skills in category
      const nameExists = skillsInCategory.find(skill => 
        skill.name.toLowerCase() === name.toLowerCase() && skill.id !== parseInt(id)
      );
      if (nameExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill name already exists in this category'
        });
      }
    }

    // Update skill
    const updateData = {};
    if (category_id !== undefined) updateData.category_id = category_id;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (updated_by) updateData.updated_by = updated_by;

    const updated = await Skill.update(id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update skill'
      });
    }

    // Get updated skill
    const updatedSkill = await Skill.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Skill updated successfully',
      data: {
        skill: updatedSkill.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete skill (Soft delete)
const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if skill exists
    const existingSkill = await Skill.findById(id);
    if (!existingSkill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found'
      });
    }

    // Delete skill (soft delete)
    const deleted = await Skill.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete skill'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle skill status
const toggleSkillStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if skill exists
    const existingSkill = await Skill.findById(id);
    if (!existingSkill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found'
      });
    }

    // Toggle status
    const newStatus = existingSkill.is_active === 1 ? 0 : 1;
    const updated = await Skill.update(id, { is_active: newStatus });
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update skill status'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Skill ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  getSkillsByCategory,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillStatus
};
