const ProfileEducation = require('../models/ProfileEducation');
const Profile = require('../models/Profile');

// Get all profile educations
const getAllProfileEducations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const profileEducations = await ProfileEducation.findAll(limit, offset, search);
    const totalData = await ProfileEducation.getCount(search);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_educations: profileEducations.map(profileEducation => profileEducation.toJSON()),
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

// Get profile education by ID
const getProfileEducationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profileEducation = await ProfileEducation.findById(id);
    
    if (!profileEducation) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile education not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        profile_education: profileEducation.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get profile educations by profile ID
const getProfileEducationsByProfileId = async (req, res, next) => {
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

    const profileEducations = await ProfileEducation.findByProfileId(profileId, limit, offset);
    const totalData = await ProfileEducation.getCountByProfileId(profileId);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_educations: profileEducations.map(profileEducation => profileEducation.toJSON()),
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

// Get profile educations with detailed information and filters
const getProfileEducationsWithDetails = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build filters from query parameters
    const filters = {};
    if (req.query.profile_id) filters.profile_id = req.query.profile_id;
    if (req.query.degree) filters.degree = req.query.degree;
    if (req.query.major) filters.major = req.query.major;
    if (req.query.institution_name) filters.institution_name = req.query.institution_name;
    if (req.query.location) filters.location = req.query.location;
    if (req.query.graduation_year) filters.graduation_year = parseInt(req.query.graduation_year);
    if (req.query.start_year) filters.start_year = parseInt(req.query.start_year);
    if (req.query.min_gpa) filters.min_gpa = parseFloat(req.query.min_gpa);
    if (req.query.max_gpa) filters.max_gpa = parseFloat(req.query.max_gpa);
    if (req.query.search) filters.search = req.query.search;

    const profileEducations = await ProfileEducation.findAllWithDetails(limit, offset, filters);
    const totalData = await ProfileEducation.getCount(filters.search || '');
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profile_educations: profileEducations.map(profileEducation => profileEducation.toJSON()),
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

// Create new profile education
const createProfileEducation = async (req, res, next) => {
  try {
    const { 
      profile_id, 
      degree, 
      major, 
      institution_name, 
      location, 
      graduation_year, 
      start_year, 
      gpa, 
      description 
    } = req.body;

    // Validate required fields
    if (!profile_id || !degree || !major || !institution_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: profile_id, degree, major, and institution_name are required'
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

    // Validate years
    if (start_year && graduation_year && start_year > graduation_year) {
      return res.status(400).json({
        status: 'error',
        message: 'Start year cannot be after graduation year'
      });
    }

    // Validate GPA
    if (gpa && (gpa < 0 || gpa > 4.0)) {
      return res.status(400).json({
        status: 'error',
        message: 'GPA must be between 0 and 4.0'
      });
    }

    // Check if the same education already exists
    const existingEducation = await ProfileEducation.findByProfileDegreeAndInstitution(profile_id, degree, institution_name);
    if (existingEducation) {
      return res.status(409).json({
        status: 'error',
        message: 'Education with same degree and institution already exists for this profile'
      });
    }

    const educationId = await ProfileEducation.create({
      profile_id,
      degree,
      major,
      institution_name,
      location,
      graduation_year,
      start_year,
      gpa,
      description
    });

    const newEducation = await ProfileEducation.findById(educationId);

    res.status(201).json({
      status: 'success',
      message: 'Profile education created successfully',
      data: {
        profile_education: newEducation.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile education
const updateProfileEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if profile education exists
    const existingEducation = await ProfileEducation.findById(id);
    if (!existingEducation) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile education not found'
      });
    }

    // If profile_id is being updated, check if new profile exists
    if (updateData.profile_id) {
      const profile = await Profile.findById(updateData.profile_id);
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }
    }

    // Validate years if provided
    const startYear = updateData.start_year || existingEducation.start_year;
    const graduationYear = updateData.graduation_year || existingEducation.graduation_year;
    
    if (startYear && graduationYear && startYear > graduationYear) {
      return res.status(400).json({
        status: 'error',
        message: 'Start year cannot be after graduation year'
      });
    }

    // Validate GPA if provided
    if (updateData.gpa && (updateData.gpa < 0 || updateData.gpa > 4.0)) {
      return res.status(400).json({
        status: 'error',
        message: 'GPA must be between 0 and 4.0'
      });
    }

    // Check for duplicate if degree or institution is being updated
    if (updateData.degree || updateData.institution_name) {
      const profileId = updateData.profile_id || existingEducation.profile_id;
      const degree = updateData.degree || existingEducation.degree;
      const institutionName = updateData.institution_name || existingEducation.institution_name;
      
      const duplicateEducation = await ProfileEducation.findByProfileDegreeAndInstitution(profileId, degree, institutionName);
      if (duplicateEducation && duplicateEducation.id !== parseInt(id)) {
        return res.status(409).json({
          status: 'error',
          message: 'Education with same degree and institution already exists for this profile'
        });
      }
    }

    const updated = await ProfileEducation.update(id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update profile education'
      });
    }

    const updatedEducation = await ProfileEducation.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Profile education updated successfully',
      data: {
        profile_education: updatedEducation.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete profile education
const deleteProfileEducation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingEducation = await ProfileEducation.findById(id);
    if (!existingEducation) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile education not found'
      });
    }

    const deleted = await ProfileEducation.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete profile education'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile education deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProfileEducations,
  getProfileEducationById,
  getProfileEducationsByProfileId,
  getProfileEducationsWithDetails,
  createProfileEducation,
  updateProfileEducation,
  deleteProfileEducation
}; 