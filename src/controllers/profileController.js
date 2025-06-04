const Profile = require('../models/Profile');
const { getFileUrl, deleteFile, profileImagesDir } = require('../middleware/upload');
const path = require('path');

// Helper function to convert empty strings and undefined to null
const sanitizeFormData = (data) => {
  const sanitized = {};
  Object.keys(data).forEach(key => {
    const value = data[key];
    // Convert empty strings, undefined, and 'undefined' string to null
    if (value === '' || value === undefined || value === 'undefined' || value === null) {
      sanitized[key] = null;
    } else if (key === 'years_of_experience' && value !== null) {
      // Convert years_of_experience to integer
      sanitized[key] = parseInt(value) || null;
    } else {
      sanitized[key] = value;
    }
  });
  return sanitized;
};

// Get all profiles
const getAllProfiles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const profiles = await Profile.findAll(limit, offset);
    const totalData = await Profile.getCount();
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profiles: profiles.map(profile => profile.toJSON()),
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

// Get profile by ID
const getProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new profile
const createProfile = async (req, res, next) => {
  try {
    // Sanitize form data to handle empty strings and undefined values
    const sanitizedData = sanitizeFormData(req.body);
    
    const {
      full_name,
      email,
      phone_number,
      linkedin_profile,
      github_profile,
      instagram_profile,
      tiktok_profile,
      x_profile,
      profile_picture_url,
      bio,
      years_of_experience,
      current_job_title,
      preferred_tech_stack,
      certifications,
      resume_url
    } = sanitizedData;

    // Check if profile with email already exists
    const existingProfile = await Profile.findByEmail(email);
    if (existingProfile) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile with this email already exists'
      });
    }

    // Create new profile
    const profileId = await Profile.create({
      full_name,
      email,
      phone_number,
      linkedin_profile,
      github_profile,
      instagram_profile,
      tiktok_profile,
      x_profile,
      profile_picture_url,
      bio,
      years_of_experience,
      current_job_title,
      preferred_tech_stack,
      certifications,
      resume_url
    });
    
    // Get created profile
    const newProfile = await Profile.findById(profileId);

    res.status(201).json({
      status: 'success',
      message: 'Profile created successfully',
      data: {
        profile: newProfile.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Sanitize form data to handle empty strings and undefined values
    const sanitizedData = sanitizeFormData(req.body);
    
    const {
      full_name,
      email,
      phone_number,
      linkedin_profile,
      github_profile,
      instagram_profile,
      tiktok_profile,
      x_profile,
      profile_picture_url,
      bio,
      years_of_experience,
      current_job_title,
      preferred_tech_stack,
      certifications,
      resume_url
    } = sanitizedData;

    // Check if profile exists
    const existingProfile = await Profile.findById(id);
    if (!existingProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    // Check if email is being changed and already exists
    if (email && email.toLowerCase() !== existingProfile.email.toLowerCase()) {
      const emailExists = await Profile.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already in use'
        });
      }
    }

    // Update profile
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (linkedin_profile !== undefined) updateData.linkedin_profile = linkedin_profile;
    if (github_profile !== undefined) updateData.github_profile = github_profile;
    if (instagram_profile !== undefined) updateData.instagram_profile = instagram_profile;
    if (tiktok_profile !== undefined) updateData.tiktok_profile = tiktok_profile;
    if (x_profile !== undefined) updateData.x_profile = x_profile;
    if (profile_picture_url !== undefined) updateData.profile_picture_url = profile_picture_url;
    if (bio !== undefined) updateData.bio = bio;
    if (years_of_experience !== undefined) updateData.years_of_experience = years_of_experience;
    if (current_job_title !== undefined) updateData.current_job_title = current_job_title;
    if (preferred_tech_stack !== undefined) updateData.preferred_tech_stack = preferred_tech_stack;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (resume_url !== undefined) updateData.resume_url = resume_url;

    const updated = await Profile.update(id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update profile'
      });
    }

    // Get updated profile
    const updatedProfile = await Profile.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        profile: updatedProfile.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete profile
const deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if profile exists
    const existingProfile = await Profile.findById(id);
    if (!existingProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    // Delete profile
    const deleted = await Profile.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete profile'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get profile by email
const getProfileByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const profile = await Profile.findByEmail(email);
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        profile: profile.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search profiles
const searchProfiles = async (req, res, next) => {
  try {
    const { q } = req.query; // search query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate search query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const searchTerm = q.trim();
    const profiles = await Profile.search(searchTerm, limit, offset);
    const totalData = await Profile.getSearchCount(searchTerm);
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: {
        profiles: profiles.map(profile => profile.toJSON()),
        searchTerm: searchTerm,
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

// Create profile with image upload
const createProfileWithImage = async (req, res, next) => {
  try {
    // Sanitize form data to handle empty strings and undefined values
    const sanitizedData = sanitizeFormData(req.body);
    
    const {
      full_name,
      email,
      phone_number,
      linkedin_profile,
      github_profile,
      instagram_profile,
      tiktok_profile,
      x_profile,
      bio,
      years_of_experience,
      current_job_title,
      preferred_tech_stack,
      certifications,
      resume_url
    } = sanitizedData;

    // Validate required fields
    if (!full_name || !email) {
      // If file was uploaded, delete it since validation failed
      if (req.file) {
        const filePath = path.join(profileImagesDir, req.file.filename);
        deleteFile(filePath);
      }
      return res.status(400).json({
        status: 'error',
        message: 'Full name and email are required'
      });
    }

    // Check if profile with email already exists
    const existingProfile = await Profile.findByEmail(email);
    if (existingProfile) {
      // If file was uploaded, delete it since we're not creating the profile
      if (req.file) {
        const filePath = path.join(profileImagesDir, req.file.filename);
        deleteFile(filePath);
      }
      return res.status(400).json({
        status: 'error',
        message: 'Profile with this email already exists'
      });
    }

    // Get profile picture URL if image was uploaded
    let profile_picture_url = null;
    let filename_image = null;
    if (req.file) {
      profile_picture_url = getFileUrl(req, req.file.filename);
      filename_image = req.file.filename;
    }

    // Create new profile
    const profileId = await Profile.create({
      full_name,
      email,
      phone_number,
      linkedin_profile,
      github_profile,
      instagram_profile,
      tiktok_profile,
      x_profile,
      filename_image,
      bio,
      years_of_experience,
      current_job_title,
      preferred_tech_stack,
      certifications,
      resume_url
    });
    
    // Get created profile
    const newProfile = await Profile.findById(profileId);

    res.status(201).json({
      status: 'success',
      message: 'Profile created successfully',
      data: {
        profile: newProfile.toJSON(),
        uploadedImage: req.file ? {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: profile_picture_url
        } : null
      }
    });
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(profileImagesDir, req.file.filename);
      deleteFile(filePath);
    }
    next(error);
  }
};

// Update profile with image upload
const updateProfileWithImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Sanitize form data to handle empty strings and undefined values
    const sanitizedData = sanitizeFormData(req.body);
    
    const {
      full_name,
      email,
      phone_number,
      linkedin_profile,
      github_profile,
      instagram_profile,
      tiktok_profile,
      x_profile,
      bio,
      years_of_experience,
      current_job_title,
      preferred_tech_stack,
      certifications,
      resume_url
    } = sanitizedData;

    // Check if profile exists
    const existingProfile = await Profile.findById(id);
    if (!existingProfile) {
      // If file was uploaded, delete it since profile doesn't exist
      if (req.file) {
        const filePath = path.join(profileImagesDir, req.file.filename);
        deleteFile(filePath);
      }
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    // Check if email is being changed and already exists
    if (email && email.toLowerCase() !== existingProfile.email.toLowerCase()) {
      const emailExists = await Profile.findByEmail(email);
      if (emailExists) {
        // If file was uploaded, delete it since email already exists
        if (req.file) {
          const filePath = path.join(profileImagesDir, req.file.filename);
          deleteFile(filePath);
        }
        return res.status(400).json({
          status: 'error',
          message: 'Email already in use'
        });
      }
    }

    // Handle profile picture update
    let profile_picture_url = undefined;
    let oldImageDeleted = false;
    
    if (req.file) {
      // New image uploaded
      profile_picture_url = getFileUrl(req, req.file.filename);
      
      // Delete old image if exists
      if (existingProfile.profile_picture_url) {
        try {
          // Extract filename from URL
          const oldImageUrl = existingProfile.profile_picture_url;
          const oldFilename = path.basename(oldImageUrl);
          const oldFilePath = path.join(profileImagesDir, oldFilename);
          oldImageDeleted = deleteFile(oldFilePath);
        } catch (error) {
          console.error('Error deleting old profile image:', error);
        }
      }
    }

    // Update profile
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (linkedin_profile !== undefined) updateData.linkedin_profile = linkedin_profile;
    if (github_profile !== undefined) updateData.github_profile = github_profile;
    if (instagram_profile !== undefined) updateData.instagram_profile = instagram_profile;
    if (tiktok_profile !== undefined) updateData.tiktok_profile = tiktok_profile;
    if (x_profile !== undefined) updateData.x_profile = x_profile;
    if (profile_picture_url !== undefined) updateData.profile_picture_url = profile_picture_url;
    if (bio !== undefined) updateData.bio = bio;
    if (years_of_experience !== undefined) updateData.years_of_experience = years_of_experience;
    if (current_job_title !== undefined) updateData.current_job_title = current_job_title;
    if (preferred_tech_stack !== undefined) updateData.preferred_tech_stack = preferred_tech_stack;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (resume_url !== undefined) updateData.resume_url = resume_url;

    const updated = await Profile.update(id, updateData);
    
    if (!updated) {
      // If update failed and new file was uploaded, delete it
      if (req.file) {
        const filePath = path.join(profileImagesDir, req.file.filename);
        deleteFile(filePath);
      }
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update profile'
      });
    }

    // Get updated profile
    const updatedProfile = await Profile.findById(id);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        profile: updatedProfile.toJSON(),
        uploadedImage: req.file ? {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: profile_picture_url
        } : null,
        oldImageDeleted: oldImageDeleted
      }
    });
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(profileImagesDir, req.file.filename);
      deleteFile(filePath);
    }
    next(error);
  }
};

module.exports = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileByEmail,
  searchProfiles,
  createProfileWithImage,
  updateProfileWithImage
};
