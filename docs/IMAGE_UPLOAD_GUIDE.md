# Profile Image Upload Guide

## Overview
This guide explains how to use the profile image upload functionality in the CMS API. The system provides separated functionality for uploading images and managing profiles with images.

## Features

### ✅ **Separated Functionality**
- **Standalone Image Upload**: Upload images independently
- **Profile with Image**: Create/update profiles with image upload in one request
- **Backward Compatibility**: Original profile endpoints still work

### ✅ **Image Validation**
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **File Size Limit**: 5MB maximum
- **Single File Upload**: One image per request
- **Automatic Validation**: File type and size checking

### ✅ **File Management**
- **Unique Filenames**: Timestamp + random number generation
- **Auto Directory Creation**: `/uploads/profile-images/` folder
- **Old Image Cleanup**: Automatic deletion when updating
- **Error Cleanup**: Failed uploads are automatically cleaned up

### ✅ **Security**
- **Admin Only**: Upload requires admin authentication
- **File Type Validation**: Only image files allowed
- **Size Limits**: Prevents abuse with large files
- **Secure Naming**: Generated filenames prevent conflicts

## API Endpoints

### 1. Image Upload Only

#### Upload Image
```http
POST /api/upload/profile-image
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- profile_image: [image file]
```

#### Get Image Info
```http
GET /api/upload/profile-image/:filename
```

#### Delete Image
```http
DELETE /api/upload/profile-image/:filename
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

### 2. Profile with Image

#### Create Profile with Image
```http
POST /api/profiles/with-image
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- profile_image: [image file] (optional)
- full_name: "John Doe"
- email: "john@example.com"
- [other profile fields...]
```

#### Update Profile with Image
```http
PUT /api/profiles/:id/with-image
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- profile_image: [image file] (optional)
- [profile fields to update...]
```

## Best Practices

1. **Always validate file types** on both frontend and backend
2. **Implement progress indicators** for file uploads
3. **Handle errors gracefully** with user-friendly messages
4. **Use the combined endpoints** (`/with-image`) for better UX
5. **Implement image preview** before upload 