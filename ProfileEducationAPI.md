# Profile Education API Documentation

API endpoints untuk mengelola riwayat pendidikan profil dalam sistem CMS.

## Base URL
```
/api/profile-educations
```

## Endpoints

### 1. Get All Profile Educations
Mengambil semua riwayat pendidikan profil dengan pagination dan pencarian.

**Endpoint:** `GET /api/profile-educations`

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `search` (optional): Kata kunci pencarian

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_educations": [
      {
        "id": 1,
        "profile_id": 1,
        "degree": "Bachelor of Science",
        "major": "Computer Science",
        "institution_name": "University of Technology",
        "location": "Jakarta, Indonesia",
        "graduation_year": 2020,
        "start_year": 2016,
        "gpa": 3.75,
        "description": "Focused on software engineering and data structures.",
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

### 2. Get Profile Education by ID
Mengambil detail riwayat pendidikan berdasarkan ID.

**Endpoint:** `GET /api/profile-educations/:id`

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_education": {
      "id": 1,
      "profile_id": 1,
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "institution_name": "University of Technology",
      "location": "Jakarta, Indonesia",
      "graduation_year": 2020,
      "start_year": 2016,
      "gpa": 3.75,
      "description": "Focused on software engineering and data structures.",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 3. Get Profile Educations by Profile ID
Mengambil semua riwayat pendidikan berdasarkan profile ID.

**Endpoint:** `GET /api/profile-educations/profile/:profileId`

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_educations": [
      {
        "id": 1,
        "profile_id": 1,
        "degree": "Bachelor of Science",
        "major": "Computer Science",
        "institution_name": "University of Technology",
        "location": "Jakarta, Indonesia",
        "graduation_year": 2020,
        "start_year": 2016,
        "gpa": 3.75,
        "description": "Focused on software engineering and data structures.",
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

### 4. Get Profile Educations with Details
Mengambil riwayat pendidikan dengan informasi detail dan filter.

**Endpoint:** `GET /api/profile-educations/details`

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `profile_id` (optional): Filter berdasarkan profile ID
- `degree` (optional): Filter berdasarkan gelar
- `major` (optional): Filter berdasarkan jurusan
- `institution_name` (optional): Filter berdasarkan nama institusi
- `location` (optional): Filter berdasarkan lokasi
- `graduation_year` (optional): Filter berdasarkan tahun lulus
- `start_year` (optional): Filter berdasarkan tahun mulai
- `min_gpa` (optional): Filter minimum GPA
- `max_gpa` (optional): Filter maximum GPA
- `search` (optional): Kata kunci pencarian

**Response:**
```json
{
  "status": "success",
  "data": {
    "profile_educations": [
      {
        "id": 1,
        "profile_id": 1,
        "degree": "Bachelor of Science",
        "major": "Computer Science",
        "institution_name": "University of Technology",
        "location": "Jakarta, Indonesia",
        "graduation_year": 2020,
        "start_year": 2016,
        "gpa": 3.75,
        "description": "Focused on software engineering and data structures.",
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

### 5. Create Profile Education
Membuat riwayat pendidikan profil baru (Hanya Admin).

**Endpoint:** `POST /api/profile-educations`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "profile_id": 1,
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "institution_name": "University of Technology",
  "location": "Jakarta, Indonesia",
  "graduation_year": 2020,
  "start_year": 2016,
  "gpa": 3.75,
  "description": "Focused on software engineering and data structures."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile education created successfully",
  "data": {
    "profile_education": {
      "id": 1,
      "profile_id": 1,
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "institution_name": "University of Technology",
      "location": "Jakarta, Indonesia",
      "graduation_year": 2020,
      "start_year": 2016,
      "gpa": 3.75,
      "description": "Focused on software engineering and data structures.",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

### 6. Update Profile Education
Mengupdate riwayat pendidikan profil (Hanya Admin).

**Endpoint:** `PUT /api/profile-educations/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "degree": "Master of Science",
  "major": "Software Engineering",
  "graduation_year": 2022,
  "gpa": 3.85
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile education updated successfully",
  "data": {
    "profile_education": {
      "id": 1,
      "profile_id": 1,
      "degree": "Master of Science",
      "major": "Software Engineering",
      "institution_name": "University of Technology",
      "location": "Jakarta, Indonesia",
      "graduation_year": 2022,
      "start_year": 2016,
      "gpa": 3.85,
      "description": "Focused on software engineering and data structures.",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

### 7. Delete Profile Education
Menghapus riwayat pendidikan profil (Hanya Admin).

**Endpoint:** `DELETE /api/profile-educations/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile education deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Missing required fields: profile_id, degree, major, and institution_name are required"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Access token is required"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Access forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Profile education not found"
}
```

### 409 Conflict
```json
{
  "status": "error",
  "message": "Education with same degree and institution already exists for this profile"
}
```

### 422 Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "gpa",
      "message": "gpa must be a decimal between 0 and 4.0"
    }
  ]
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| profile_id | integer | Yes | ID dari profil yang terkait |
| degree | varchar(255) | Yes | Gelar pendidikan (contoh: Bachelor of Science) |
| major | varchar(255) | Yes | Jurusan atau bidang studi |
| institution_name | varchar(255) | Yes | Nama institusi pendidikan |
| location | varchar(255) | No | Lokasi institusi |
| graduation_year | integer | No | Tahun lulus (1900-2100) |
| start_year | integer | No | Tahun mulai (1900-2100) |
| gpa | decimal | No | IPK/GPA (0.0-4.0) |
| description | text | No | Deskripsi tambahan |

## Notes

1. Semua endpoint CREATE, UPDATE, dan DELETE memerlukan autentikasi admin
2. Endpoint GET bersifat public dan dapat diakses tanpa autentikasi
3. GPA harus dalam rentang 0.0 - 4.0
4. Tahun harus dalam rentang 1900 - 2100
5. Start year tidak boleh lebih besar dari graduation year
6. Kombinasi degree dan institution_name harus unik untuk setiap profil
7. Pencarian akan mencari berdasarkan nama profil, gelar, jurusan, nama institusi, dan lokasi 