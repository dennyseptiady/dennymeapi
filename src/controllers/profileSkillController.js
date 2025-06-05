const ProfileSkill = require('../models/ProfileSkill');
const Profile = require('../models/Profile');
const Category = require('../models/Category');
const Skill = require('../models/Skill');

// Get all profile skills
const getAllProfileSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Fix: Pass search as filters object instead of string
    const filters = search ? { search } : {};
    const profileSkills = await ProfileSkill.findAll(limit, offset, filters);
    const totalData = await ProfileSkill.getCount(filters);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_skills: profileSkills.map(profileSkill => profileSkill.toJSON()),
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

// Get profile skill by ID
const getProfileSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profileSkill = await ProfileSkill.findById(id);
    
    if (!profileSkill) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile skill not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        profile_skill: profileSkill.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get profile skills by profile ID
const getProfileSkillsByProfileId = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if profile exists
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    const profileSkills = await ProfileSkill.findByProfileIdGrouped(profileId, limit, offset);
    const totalData = await ProfileSkill.getCountByProfileId(profileId);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_skills: profileSkills,
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

// Get profile skills by category ID
const getProfileSkillsByCategoryId = async (req, res, next) => {
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

    const profileSkills = await ProfileSkill.findByCategoryId(categoryId, limit, offset);
    const totalData = await ProfileSkill.getCountByCategoryId(categoryId);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_skills: profileSkills.map(profileSkill => profileSkill.toJSON()),
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

// Get profile skills with detailed information and filters
const getProfileSkillsWithDetails = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build filters from query parameters
    const filters = {};
    if (req.query.profile_id) filters.profile_id = req.query.profile_id;
    if (req.query.category_id) filters.category_id = req.query.category_id;
    if (req.query.skill_id) filters.skill_id = req.query.skill_id;
    if (req.query.is_active !== undefined) filters.is_active = parseInt(req.query.is_active);

    const profileSkills = await ProfileSkill.findAllWithDetails(limit, offset, filters);
    const totalData = await ProfileSkill.getCount();
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_skills: profileSkills.map(profileSkill => profileSkill.toJSON()),
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

// Create new profile skill
const createProfileSkill = async (req, res, next) => {
  try {
    const { profile_id, category_id, skill_id, percent, is_active, created_by, updated_by } = req.body;

    // Validate required fields
    if (!profile_id || !category_id || !skill_id || percent === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: profile_id, category_id, skill_id, and percent are required'
      });
    }

    // Validate percent range
    if (percent < 0 || percent > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Percent must be between 0 and 100'
      });
    }

    // Check if profile exists
    const profile = await Profile.findById(profile_id);
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    // Check if category exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Check if skill exists
    const skill = await Skill.findById(skill_id);
    if (!skill) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill not found'
      });
    }

    // Check if skill belongs to the specified category
    if (skill.category_id !== category_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Skill does not belong to the specified category'
      });
    }

    // Check if profile skill already exists
    const existingProfileSkill = await ProfileSkill.findByProfileAndSkill(profile_id, skill_id);
    if (existingProfileSkill) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile skill combination already exists'
      });
    }

    // Create new profile skill
    const profileSkillId = await ProfileSkill.create({
      profile_id,
      category_id,
      skill_id,
      percent,
      is_active,
      created_by,
      updated_by
    });
    
    // Get created profile skill
    const newProfileSkill = await ProfileSkill.findById(profileSkillId);

    res.status(201).json({
      status: 'success',
      message: 'Profile skill created successfully',
      data: {
        profile_skill: newProfileSkill.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile skill
const updateProfileSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { profile_id, category_id, skill_id, percent, is_active, updated_by } = req.body;

    // Check if profile skill exists
    const existingProfileSkill = await ProfileSkill.findById(id);
    if (!existingProfileSkill) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile skill not found'
      });
    }

    // Validate percent range if provided
    if (percent !== undefined && (percent < 0 || percent > 100)) {
      return res.status(400).json({
        status: 'error',
        message: 'Percent must be between 0 and 100'
      });
    }

    // If profile_id is being changed, check if new profile exists
    if (profile_id && profile_id !== existingProfileSkill.profile_id) {
      const profile = await Profile.findById(profile_id);
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }
    }

    // If category_id is being changed, check if new category exists
    if (category_id && category_id !== existingProfileSkill.category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }
    }

    // If skill_id is being changed, check if new skill exists
    if (skill_id && skill_id !== existingProfileSkill.skill_id) {
      const skill = await Skill.findById(skill_id);
      if (!skill) {
        return res.status(404).json({
          status: 'error',
          message: 'Skill not found'
        });
      }

      // Check if skill belongs to the category
      const finalCategoryId = category_id || existingProfileSkill.category_id;
      if (skill.category_id !== finalCategoryId) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill does not belong to the specified category'
        });
      }

      // Check if this would create a duplicate
      const finalProfileId = profile_id || existingProfileSkill.profile_id;
      const duplicateCheck = await ProfileSkill.findByProfileAndSkill(finalProfileId, skill_id);
      if (duplicateCheck && duplicateCheck.id !== parseInt(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Profile skill combination already exists'
        });
      }
    }

    // Update profile skill
    const updateData = {};
    if (profile_id !== undefined) updateData.profile_id = profile_id;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (skill_id !== undefined) updateData.skill_id = skill_id;
    if (percent !== undefined) updateData.percent = percent;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (updated_by !== undefined) updateData.updated_by = updated_by;

    const updated = await ProfileSkill.update(id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update profile skill'
      });
    }

    // Get updated profile skill
    const updatedProfileSkill = await ProfileSkill.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Profile skill updated successfully',
      data: {
        profile_skill: updatedProfileSkill.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete profile skill (Soft delete)
const deleteProfileSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if profile skill exists
    const existingProfileSkill = await ProfileSkill.findById(id);
    if (!existingProfileSkill) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile skill not found'
      });
    }

    // Delete profile skill (soft delete)
    const deleted = await ProfileSkill.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete profile skill'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle profile skill status
const toggleProfileSkillStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if profile skill exists
    const existingProfileSkill = await ProfileSkill.findById(id);
    if (!existingProfileSkill) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile skill not found'
      });
    }

    // Toggle status
    const newStatus = existingProfileSkill.is_active === 1 ? 0 : 1;
    const updated = await ProfileSkill.update(id, { is_active: newStatus });
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update profile skill status'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Profile skill ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProfileSkills,
  getProfileSkillById,
  getProfileSkillsByProfileId,
  getProfileSkillsByCategoryId,
  getProfileSkillsWithDetails,
  createProfileSkill,
  updateProfileSkill,
  deleteProfileSkill,
  toggleProfileSkillStatus
}; 