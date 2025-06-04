const ProfileExperience = require('../models/ProfileExperience');
const Profile = require('../models/Profile');

// Get all profile experiences
const getAllProfileExperiences = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const profileExperiences = await ProfileExperience.findAll(limit, offset, search);
    const totalData = await ProfileExperience.getCount(search);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_experiences: profileExperiences.map(profileExperience => profileExperience.toJSON()),
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

// Get profile experience by ID
const getProfileExperienceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profileExperience = await ProfileExperience.findById(id);
    
    if (!profileExperience) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile experience not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        profile_experience: profileExperience.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get profile experiences by profile ID
const getProfileExperiencesByProfileId = async (req, res, next) => {
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

    const profileExperiences = await ProfileExperience.findByProfileId(profileId, limit, offset);
    const totalData = await ProfileExperience.getCountByProfileId(profileId);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_experiences: profileExperiences.map(profileExperience => profileExperience.toJSON()),
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

// Get current profile experiences by profile ID
const getCurrentProfileExperiencesByProfileId = async (req, res, next) => {
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

    const profileExperiences = await ProfileExperience.findCurrentByProfileId(profileId, limit, offset);

    res.status(200).json({
      status: 'success',
      data: {
        profile_experiences: profileExperiences.map(profileExperience => profileExperience.toJSON())
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get profile experiences with detailed information and filters
const getProfileExperiencesWithDetails = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build filters from query parameters
    const filters = {};
    if (req.query.profile_id) filters.profile_id = req.query.profile_id;
    if (req.query.is_current !== undefined) filters.is_current = parseInt(req.query.is_current);
    if (req.query.company_name) filters.company_name = req.query.company_name;
    if (req.query.location) filters.location = req.query.location;

    const profileExperiences = await ProfileExperience.findAllWithDetails(limit, offset, filters);
    const totalData = await ProfileExperience.getCount();
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_experiences: profileExperiences.map(profileExperience => profileExperience.toJSON()),
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

// Create new profile experience
const createProfileExperience = async (req, res, next) => {
  try {
    const { 
      profile_id, 
      job_title, 
      company_name, 
      location, 
      start_date, 
      end_date, 
      description, 
      is_current 
    } = req.body;

    // Validate required fields
    if (!profile_id || !job_title || !company_name || !start_date) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: profile_id, job_title, company_name, and start_date are required'
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

    // Validate dates
    if (end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date cannot be after end date'
      });
    }

    // If is_current is true, end_date should be null
    if (is_current === 1 && end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'End date should be null for current positions'
      });
    }

    // Check if similar experience already exists (optional validation)
    const existingExperience = await ProfileExperience.findByProfileJobAndCompany(profile_id, job_title, company_name);
    if (existingExperience) {
      return res.status(409).json({
        status: 'error',
        message: 'Profile experience with same job title and company already exists'
      });
    }

    const experienceId = await ProfileExperience.create({
      profile_id,
      job_title,
      company_name,
      location,
      start_date,
      end_date: is_current === 1 ? null : end_date,
      description,
      is_current
    });

    const profileExperience = await ProfileExperience.findById(experienceId);

    res.status(201).json({
      status: 'success',
      message: 'Profile experience created successfully',
      data: {
        profile_experience: profileExperience.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile experience
const updateProfileExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if profile experience exists
    const existingExperience = await ProfileExperience.findById(id);
    if (!existingExperience) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile experience not found'
      });
    }

    // Validate profile_id if being updated
    if (updateData.profile_id) {
      const profile = await Profile.findById(updateData.profile_id);
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }
    }

    // Validate dates if being updated
    const startDate = updateData.start_date || existingExperience.start_date;
    const endDate = updateData.end_date || existingExperience.end_date;
    const isCurrent = updateData.is_current !== undefined ? updateData.is_current : existingExperience.is_current;

    if (endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date cannot be after end date'
      });
    }

    // If is_current is true, end_date should be null
    if (isCurrent === 1 && endDate) {
      updateData.end_date = null;
    }

    const updated = await ProfileExperience.update(id, updateData);

    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update profile experience'
      });
    }

    const profileExperience = await ProfileExperience.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Profile experience updated successfully',
      data: {
        profile_experience: profileExperience.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete profile experience
const deleteProfileExperience = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if profile experience exists
    const profileExperience = await ProfileExperience.findById(id);
    if (!profileExperience) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile experience not found'
      });
    }

    const deleted = await ProfileExperience.delete(id);

    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete profile experience'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile experience deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle profile experience current status
const toggleProfileExperienceCurrentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if profile experience exists
    const profileExperience = await ProfileExperience.findById(id);
    if (!profileExperience) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile experience not found'
      });
    }

    const updated = await ProfileExperience.toggleCurrentStatus(id);

    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to toggle current status'
      });
    }

    const updatedExperience = await ProfileExperience.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Profile experience current status updated successfully',
      data: {
        profile_experience: updatedExperience.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProfileExperiences,
  getProfileExperienceById,
  getProfileExperiencesByProfileId,
  getCurrentProfileExperiencesByProfileId,
  getProfileExperiencesWithDetails,
  createProfileExperience,
  updateProfileExperience,
  deleteProfileExperience,
  toggleProfileExperienceCurrentStatus
}; 