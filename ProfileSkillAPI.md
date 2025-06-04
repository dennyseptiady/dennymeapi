# Profile Skills API Documentation

The Profile Skills API allows you to manage the relationship between profiles, categories, and skills with percentage proficiency levels.

## Base URL
```
/api/profile-skills
```

## Endpoints

### 1. Get All Profile Skills
```http
GET /api/profile-skills
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term for profile name, category name, or skill name

**Example:**
```http
GET /api/profile-skills?page=1&limit=10&search=javascript
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_skills": [
      {
        "id": 1,
        "profile_id": 1,
        "category_id": 1,
        "skill_id": 1,
        "percent": 85,
        "is_active": 1,
        "is_delete": 0,
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2023-12-01T10:00:00.000Z",
        "updated_at": "2023-12-01T10:00:00.000Z",
        "profile_name": "John Doe",
        "category_name": "Programming Languages",
        "skill_name": "JavaScript"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalData": 50,
      "limit": 10
    }
  }
}
```

### 2. Get Profile Skill by ID
```http
GET /api/profile-skills/:id
```

**Example:**
```http
GET /api/profile-skills/1
```

### 3. Get Profile Skills by Profile ID
```http
GET /api/profile-skills/profile/:profileId
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Example:**
```http
GET /api/profile-skills/profile/1?page=1&limit=5
```

### 4. Get Profile Skills by Category ID
```http
GET /api/profile-skills/category/:categoryId
```

**Example:**
```http
GET /api/profile-skills/category/1
```

### 5. Get Profile Skills with Detailed Information
```http
GET /api/profile-skills/details
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `profile_id` (optional): Filter by profile ID
- `category_id` (optional): Filter by category ID
- `skill_id` (optional): Filter by skill ID
- `is_active` (optional): Filter by active status (0 or 1)

**Example:**
```http
GET /api/profile-skills/details?profile_id=1&is_active=1
```

### 6. Create Profile Skill (Admin Only)
```http
POST /api/profile-skills
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "profile_id": 1,
  "category_id": 1,
  "skill_id": 1,
  "percent": 85,
  "is_active": 1,
  "created_by": 1,
  "updated_by": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile skill created successfully",
  "data": {
    "profile_skill": {
      "id": 1,
      "profile_id": 1,
      "category_id": 1,
      "skill_id": 1,
      "percent": 85,
      "is_active": 1,
      "is_delete": 0,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2023-12-01T10:00:00.000Z",
      "updated_at": "2023-12-01T10:00:00.000Z"
    }
  }
}
```

### 7. Update Profile Skill (Admin Only)
```http
PUT /api/profile-skills/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "percent": 90,
  "is_active": 1,
  "updated_by": 1
}
```

### 8. Delete Profile Skill (Admin Only)
```http
DELETE /api/profile-skills/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile skill deleted successfully"
}
```

### 9. Toggle Profile Skill Status (Admin Only)
```http
PATCH /api/profile-skills/:id/toggle-status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile skill activated successfully"
}
```

## Error Responses

### Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "percent",
      "message": "percent must be an integer between 0 and 100"
    }
  ]
}
```

### Not Found Error
```json
{
  "status": "error",
  "message": "Profile skill not found"
}
```

### Duplicate Error
```json
{
  "status": "error",
  "message": "Profile skill combination already exists"
}
```

### Unauthorized Error
```json
{
  "status": "error",
  "message": "Access denied. Admin role required."
}
```

## Data Validation Rules

- `profile_id`: Required, must be a valid profile ID (integer >= 1)
- `category_id`: Required, must be a valid category ID (integer >= 1)
- `skill_id`: Required, must be a valid skill ID (integer >= 1)
- `percent`: Required, must be an integer between 0 and 100
- `is_active`: Optional, must be a boolean value (default: 1)
- `created_by`: Required for creation, must be a valid user ID (integer >= 1)
- `updated_by`: Required for creation, optional for updates, must be a valid user ID (integer >= 1)

## Business Rules

1. The skill must belong to the specified category
2. A profile can only have one entry per skill (unique combination of profile_id and skill_id)
3. Percent values represent proficiency levels from 0-100
4. Soft delete is used (is_delete flag) instead of hard deletion
5. All referenced entities (profile, category, skill) must exist and be active 