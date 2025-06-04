# API CMS DennyMe

RESTful API dengan MySQL database dan JWT authentication untuk sistem manajemen konten.

## 🚀 Fitur

- ✅ Authentication dengan JWT Token
- ✅ User Management (CRUD)
- ✅ Role-based Access Control (Admin/User)
- ✅ Password Hashing dengan bcrypt
- ✅ Input Validation
- ✅ Error Handling
- ✅ Database Connection Pooling
- ✅ Soft Delete untuk Users
- ✅ Pagination
- ✅ CORS Support

## 📁 Struktur Folder

```
api_cms_dennyme/
├── src/
│   ├── app.js                 # Konfigurasi Express app
│   ├── config/
│   │   └── database.js        # Konfigurasi database MySQL
│   ├── controllers/
│   │   ├── authController.js  # Controller untuk authentication
│   │   └── userController.js  # Controller untuk user management
│   ├── middleware/
│   │   ├── auth.js           # Middleware JWT authentication
│   │   ├── errorHandler.js   # Global error handler
│   │   └── validation.js     # Input validation middleware
│   ├── models/
│   │   └── User.js           # Model User
│   └── routes/
│       ├── authRoutes.js     # Routes untuk authentication
│       └── userRoutes.js     # Routes untuk user management
├── database/
│   └── migrations/
│       └── 001_create_users_table.sql
├── server.js                 # Entry point aplikasi
├── env.example              # Contoh environment variables
├── package.json
└── README.md
```

## 🛠️ Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd api_cms_dennyme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit file `.env` sesuai konfigurasi Anda:
   ```env
   PORT=8000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=api_cms_dennyme
   DB_PORT=3306
   
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   ```

4. **Setup Database**
   - Buat database MySQL dengan nama `api_cms_dennyme`
   - Jalankan migration:
   ```bash
   mysql -u root -p api_cms_dennyme < database/migrations/001_create_users_table.sql
   ```

5. **Start server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "user" // optional, default: "user"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### 3. Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

#### 4. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### 5. Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

#### 6. Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

### User Management Endpoints (Admin Only)

#### 1. Get All Users
```http
GET /api/users?page=1&limit=10
Authorization: Bearer <admin_jwt_token>
```

#### 2. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <admin_jwt_token>
```

#### 3. Create User
```http
POST /api/users
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "user"
}
```

#### 4. Update User
```http
PUT /api/users/:id
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Jane Updated",
  "email": "jane.updated@example.com",
  "role": "admin"
}
```

#### 5. Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin_jwt_token>
```

#### 6. Toggle User Status
```http
PATCH /api/users/:id/toggle-status
Authorization: Bearer <admin_jwt_token>
```

### Health Check
```http
GET /api/health
```

## 🔐 Default Admin Account

Setelah menjalankan migration, akan tersedia akun admin default:
- **Email**: admin@example.com
- **Password**: Admin123

## 📝 Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    // response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // validation errors (if any)
  ]
}
```

## 🛡️ Security Features

- Password hashing dengan bcrypt (12 rounds)
- JWT token authentication
- Input validation dengan express-validator
- SQL injection protection dengan prepared statements
- Role-based access control
- CORS protection

## 🚦 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📋 Requirements

- Node.js >= 14.x
- MySQL >= 5.7
- npm >= 6.x

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

This project is licensed under the ISC License. 