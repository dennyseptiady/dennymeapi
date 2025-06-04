const path = require('path');
const { getFileUrl, deleteFile, profileImagesDir } = require('../middleware/upload');

// Upload profile image
const uploadProfileImage = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided. Please upload an image.'
      });
    }

    // Get file information
    const file = req.file;
    const fileUrl = getFileUrl(req, file.filename);

    // Return file information
    res.status(200).json({
      status: 'success',
      message: 'Image uploaded successfully',
      data: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUrl,
        path: `/uploads/profile-images/${file.filename}`
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

// Delete profile image
const deleteProfileImage = async (req, res, next) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        status: 'error',
        message: 'Filename is required'
      });
    }

    // Construct file path
    const filePath = path.join(profileImagesDir, filename);

    // Delete file
    const deleted = deleteFile(filePath);

    if (deleted) {
      res.status(200).json({
        status: 'success',
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Image not found'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get image info
const getImageInfo = async (req, res, next) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        status: 'error',
        message: 'Filename is required'
      });
    }

    // Construct file path
    const filePath = path.join(profileImagesDir, filename);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Image not found'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileUrl = getFileUrl(req, filename);

    res.status(200).json({
      status: 'success',
      data: {
        filename: filename,
        size: stats.size,
        url: fileUrl,
        path: `/uploads/profile-images/${filename}`,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadProfileImage,
  deleteProfileImage,
  getImageInfo
}; 