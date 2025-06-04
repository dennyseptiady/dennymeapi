# Profile Experience API Documentation

API endpoints untuk mengelola pengalaman kerja profil dalam sistem CMS.

## Base URL
```
/api/profile-experiences
```

## Endpoints

### 1. Get All Profile Experiences
Mengambil semua pengalaman kerja profil dengan pagination dan pencarian.

**Endpoint:** `GET /api/profile-experiences`

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `search` (optional): Kata kunci pencarian

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_experiences": [
      {
        "id": 1,
        "profile_id": 1,
        "job_title": "Senior Frontend Developer",
        "company_name": "Tech Company ABC",
        "location": "Jakarta, Indonesia",
        "start_date": "2022-01-01",
        "end_date": null,
        "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
        "is_current": 1,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z",
        "profile_name": "John Doe"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalData": 1,
      "limit": 10
    }
  }
}
```

### 2. Get Profile Experience by ID
Mengambil detail pengalaman kerja berdasarkan ID.

**Endpoint:** `GET /api/profile-experiences/:id`

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_experience": {
      "id": 1,
      "profile_id": 1,
      "job_title": "Senior Frontend Developer",
      "company_name": "Tech Company ABC",
      "location": "Jakarta, Indonesia",
      "start_date": "2022-01-01",
      "end_date": null,
      "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
      "is_current": 1,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 3. Get Profile Experiences by Profile ID
Mengambil semua pengalaman kerja berdasarkan profile ID.

**Endpoint:** `GET /api/profile-experiences/profile/:profileId`

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_experiences": [
      {
        "id": 1,
        "profile_id": 1,
        "job_title": "Senior Frontend Developer",
        "company_name": "Tech Company ABC",
        "location": "Jakarta, Indonesia",
        "start_date": "2022-01-01",
        "end_date": null,
        "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
        "is_current": 1,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalData": 1,
      "limit": 10
    }
  }
}
```

### 4. Get Current Profile Experiences by Profile ID
Mengambil pengalaman kerja yang sedang aktif berdasarkan profile ID.

**Endpoint:** `GET /api/profile-experiences/profile/:profileId/current`

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_experiences": [
      {
        "id": 1,
        "profile_id": 1,
        "job_title": "Senior Frontend Developer",
        "company_name": "Tech Company ABC",
        "location": "Jakarta, Indonesia",
        "start_date": "2022-01-01",
        "end_date": null,
        "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
        "is_current": 1,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### 5. Get Profile Experiences with Details
Mengambil pengalaman kerja dengan informasi detail dan filter.

**Endpoint:** `GET /api/profile-experiences/details`

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `profile_id` (optional): Filter berdasarkan profile ID
- `is_current` (optional): Filter berdasarkan status aktif (0 atau 1)
- `company_name` (optional): Filter berdasarkan nama perusahaan
- `location` (optional): Filter berdasarkan lokasi

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_experiences": [
      {
        "id": 1,
        "profile_id": 1,
        "job_title": "Senior Frontend Developer",
        "company_name": "Tech Company ABC",
        "location": "Jakarta, Indonesia",
        "start_date": "2022-01-01",
        "end_date": null,
        "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
        "is_current": 1,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z",
        "profile_name": "John Doe",
        "profile_email": "john@example.com"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalData": 1,
      "limit": 10
    }
  }
}
```

### 6. Create Profile Experience
Membuat pengalaman kerja profil baru (Hanya Admin).

**Endpoint:** `POST /api/profile-experiences`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "profile_id": 1,
  "job_title": "Senior Frontend Developer",
  "company_name": "Tech Company ABC",
  "location": "Jakarta, Indonesia",
  "start_date": "2022-01-01",
  "end_date": null,
  "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
  "is_current": 1
}
```

**Required Fields:**
- `profile_id`: ID profil
- `job_title`: Judul pekerjaan
- `company_name`: Nama perusahaan
- `start_date`: Tanggal mulai kerja

**Optional Fields:**
- `location`: Lokasi
- `end_date`: Tanggal selesai kerja (null jika masih aktif)
- `description`: Deskripsi pekerjaan
- `is_current`: Status aktif (default: 0)

**Response:**
```json
{
  "status": "success",
  "message": "Profile experience created successfully",
  "data": {
    "profile_experience": {
      "id": 1,
      "profile_id": 1,
      "job_title": "Senior Frontend Developer",
      "company_name": "Tech Company ABC",
      "location": "Jakarta, Indonesia",
      "start_date": "2022-01-01",
      "end_date": null,
      "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
      "is_current": 1,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 7. Update Profile Experience
Memperbarui pengalaman kerja profil (Hanya Admin).

**Endpoint:** `PUT /api/profile-experiences/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "job_title": "Lead Frontend Developer",
  "location": "Jakarta, Indonesia",
  "description": "Leading frontend development team and implementing new technologies.",
  "is_current": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile experience updated successfully",
  "data": {
    "profile_experience": {
      "id": 1,
      "profile_id": 1,
      "job_title": "Lead Frontend Developer",
      "company_name": "Tech Company ABC",
      "location": "Jakarta, Indonesia",
      "start_date": "2022-01-01",
      "end_date": null,
      "description": "Leading frontend development team and implementing new technologies.",
      "is_current": 1,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

### 8. Delete Profile Experience
Menghapus pengalaman kerja profil (soft delete) (Hanya Admin).

**Endpoint:** `DELETE /api/profile-experiences/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile experience deleted successfully"
}
```

### 9. Toggle Current Status
Mengubah status aktif pengalaman kerja profil (Hanya Admin).

**Endpoint:** `PATCH /api/profile-experiences/:id/toggle-current`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile experience current status updated successfully",
  "data": {
    "profile_experience": {
      "id": 1,
      "profile_id": 1,
      "job_title": "Senior Frontend Developer",
      "company_name": "Tech Company ABC",
      "location": "Jakarta, Indonesia",
      "start_date": "2022-01-01",
      "end_date": null,
      "description": "Responsible for developing user interfaces using React.js and managing frontend team.",
      "is_current": 0,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

## Error Responses

### 400 - Bad Request
```json
{
  "status": "error",
  "message": "Missing required fields: profile_id, job_title, company_name, and start_date are required"
}
```

### 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Access token required"
}
```

### 403 - Forbidden
```json
{
  "status": "error",
  "message": "Access denied. Admin role required"
}
```

### 404 - Not Found
```json
{
  "status": "error",
  "message": "Profile experience not found"
}
```

### 409 - Conflict
```json
{
  "status": "error",
  "message": "Profile experience with same job title and company already exists"
}
```

### 500 - Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Validation Rules

### Create Profile Experience
- `profile_id`: Required, must be a valid integer > 0
- `job_title`: Required, 1-255 characters
- `company_name`: Required, 1-255 characters
- `location`: Optional, max 255 characters
- `start_date`: Required, must be a valid date
- `end_date`: Optional, must be a valid date
- `description`: Optional, text field
- `is_current`: Optional, boolean

### Update Profile Experience
- All fields optional but at least one field must be provided
- Same validation rules as create for provided fields

## Examples

### Create New Experience
```bash
curl -X POST http://localhost:8000/api/profile-experiences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "profile_id": 1,
    "job_title": "Senior Frontend Developer",
    "company_name": "Tech Company ABC",
    "location": "Jakarta, Indonesia",
    "start_date": "2022-01-01",
    "description": "Developing modern web applications using React.js",
    "is_current": 1
  }'
```

### Get Profile Experiences with Search
```bash
curl "http://localhost:8000/api/profile-experiences?search=developer&page=1&limit=5"
```

### Get Current Experiences for Profile
```bash
curl "http://localhost:8000/api/profile-experiences/profile/1/current"
```

### Update Experience
```bash
curl -X PUT http://localhost:8000/api/profile-experiences/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "job_title": "Lead Frontend Developer",
    "description": "Leading the frontend development team"
  }'
``` 