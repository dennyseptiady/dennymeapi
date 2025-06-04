const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  
  handleValidationErrors
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('created_by')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('created_by must be a valid user ID'),
  
  body('updated_by')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('updated_by must be a valid user ID'),
  
  handleValidationErrors
];

const validateCategoryUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('updated_by')
    .optional()
    .isInt({ min: 1 })
    .withMessage('updated_by must be a valid user ID'),
  
  handleValidationErrors
];

const validateSkill = [
  body('category_id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('category_id must be a valid category ID'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Icon must not exceed 255 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('created_by')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('created_by must be a valid user ID'),
  
  body('updated_by')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('updated_by must be a valid user ID'),
  
  handleValidationErrors
];

const validateSkillUpdate = [
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('category_id must be a valid category ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Icon must not exceed 255 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('updated_by')
    .optional()
    .isInt({ min: 1 })
    .withMessage('updated_by must be a valid user ID'),
  
  handleValidationErrors
];

const validateProfile = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone_number')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  
  body('linkedin_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('LinkedIn profile URL must not exceed 255 characters'),
  
  body('github_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('GitHub profile URL must not exceed 255 characters'),
  
  body('instagram_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Instagram profile URL must not exceed 255 characters'),
  
  body('tiktok_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('TikTok profile URL must not exceed 255 characters'),
  
  body('x_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('X profile URL must not exceed 255 characters'),
  
  body('profile_picture_url')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Profile picture URL must not exceed 255 characters'),
  
  body('bio')
    .optional()
    .trim(),
  
  body('years_of_experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a positive integer'),
  
  body('current_job_title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Current job title must not exceed 100 characters'),
  
  body('preferred_tech_stack')
    .optional()
    .trim(),
  
  body('certifications')
    .optional()
    .trim(),
  
  body('resume_url')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Resume URL must not exceed 255 characters'),
  
  handleValidationErrors
];

const validateProfileUpdate = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone_number')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  
  body('linkedin_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('LinkedIn profile URL must not exceed 255 characters'),
  
  body('github_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('GitHub profile URL must not exceed 255 characters'),
  
  body('instagram_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Instagram profile URL must not exceed 255 characters'),
  
  body('tiktok_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('TikTok profile URL must not exceed 255 characters'),
  
  body('x_profile')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('X profile URL must not exceed 255 characters'),
  
  body('profile_picture_url')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Profile picture URL must not exceed 255 characters'),
  
  body('bio')
    .optional()
    .trim(),
  
  body('years_of_experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a positive integer'),
  
  body('current_job_title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Current job title must not exceed 100 characters'),
  
  body('preferred_tech_stack')
    .optional()
    .trim(),
  
  body('certifications')
    .optional()
    .trim(),
  
  body('resume_url')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Resume URL must not exceed 255 characters'),
  
  handleValidationErrors
];

const validateProfileSkill = [
  body('profile_id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('profile_id must be a valid profile ID'),
  
  body('category_id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('category_id must be a valid category ID'),
  
  body('skill_id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('skill_id must be a valid skill ID'),
  
  body('percent')
    .notEmpty()
    .isInt({ min: 0, max: 100 })
    .withMessage('percent must be an integer between 0 and 100'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('created_by')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('created_by must be a valid user ID'),
  
  body('updated_by')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('updated_by must be a valid user ID'),
  
  handleValidationErrors
];

const validateProfileSkillUpdate = [
  body('profile_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('profile_id must be a valid profile ID'),
  
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('category_id must be a valid category ID'),
  
  body('skill_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('skill_id must be a valid skill ID'),
  
  body('percent')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('percent must be an integer between 0 and 100'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('updated_by')
    .optional()
    .isInt({ min: 1 })
    .withMessage('updated_by must be a valid user ID'),
  
  handleValidationErrors
];

const validateProfileExperience = [
  body('profile_id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('profile_id must be a valid profile ID'),
  
  body('job_title')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('job_title must be between 1 and 255 characters'),
  
  body('company_name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('company_name must be between 1 and 255 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('location must not exceed 255 characters'),
  
  body('start_date')
    .notEmpty()
    .isDate()
    .withMessage('start_date must be a valid date'),
  
  body('end_date')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!new Date(value).getTime()) {
        throw new Error('end_date must be a valid date');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim(),
  
  body('is_current')
    .optional()
    .isBoolean()
    .withMessage('is_current must be a boolean value'),
  
  handleValidationErrors
];

const validateProfileExperienceUpdate = [
  body('profile_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('profile_id must be a valid profile ID'),
  
  body('job_title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('job_title must be between 1 and 255 characters'),
  
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('company_name must be between 1 and 255 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('location must not exceed 255 characters'),
  
  body('start_date')
    .optional()
    .isDate()
    .withMessage('start_date must be a valid date'),
  
  body('end_date')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      if (!new Date(value).getTime()) {
        throw new Error('end_date must be a valid date');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim(),
  
  body('is_current')
    .optional()
    .isBoolean()
    .withMessage('is_current must be a boolean value'),
  
  handleValidationErrors
];

const validateProfileEducation = [
  body('profile_id')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('profile_id must be a valid profile ID'),
  
  body('degree')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('degree must be between 1 and 255 characters'),
  
  body('major')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('major must be between 1 and 255 characters'),
  
  body('institution_name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('institution_name must be between 1 and 255 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('location must not exceed 255 characters'),
  
  body('graduation_year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('graduation_year must be a valid year between 1900 and 2100'),
  
  body('start_year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('start_year must be a valid year between 1900 and 2100'),
  
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4.0 })
    .withMessage('gpa must be a decimal between 0 and 4.0'),
  
  body('description')
    .optional()
    .trim(),
  
  handleValidationErrors
];

const validateProfileEducationUpdate = [
  body('profile_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('profile_id must be a valid profile ID'),
  
  body('degree')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('degree must be between 1 and 255 characters'),
  
  body('major')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('major must be between 1 and 255 characters'),
  
  body('institution_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('institution_name must be between 1 and 255 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('location must not exceed 255 characters'),
  
  body('graduation_year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('graduation_year must be a valid year between 1900 and 2100'),
  
  body('start_year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('start_year must be a valid year between 1900 and 2100'),
  
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4.0 })
    .withMessage('gpa must be a decimal between 0 and 4.0'),
  
  body('description')
    .optional()
    .trim(),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateChangePassword,
  validateCategory,
  validateCategoryUpdate,
  validateSkill,
  validateSkillUpdate,
  validateProfile,
  validateProfileUpdate,
  validateProfileSkill,
  validateProfileSkillUpdate,
  validateProfileExperience,
  validateProfileExperienceUpdate,
  validateProfileEducation,
  validateProfileEducationUpdate,
  handleValidationErrors
}; 