# 🚀 API CMS DennyMe

> **Professional Node.js Express API with MySQL for Portfolio & CMS Management**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)](https://jwt.io/)

Comprehensive REST API for managing portfolio content, user profiles, skills, experiences, education, and projects. Built with modern Node.js architecture and ready for production deployment.

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt
- Token validation middleware

### 👤 **User Management**
- User registration and login
- Profile management
- Admin user controls

### 📊 **Portfolio Management**
- **Profile Information**: Personal details, bio, contact info
- **Education**: Academic background with GPA tracking
- **Experience**: Work history with current position tracking
- **Skills**: Categorized skills with proficiency percentages
- **Projects**: Portfolio projects with demo links and code repositories

### 📂 **File Management**
- Image upload for profile pictures
- Secure file handling with multer
- File validation and storage management

### 🏷️ **Categories & Skills**
- Master data for skill categories
- Predefined skills with icons and descriptions
- Extensible category system

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: bcryptjs, CORS
- **Environment**: dotenv
- **Logging**: Morgan

## 📋 API Endpoints

### Authentication
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/auth/profile      # Get current user profile
```

### User Management
```
GET    /api/users             # Get all users (Admin only)
GET    /api/users/:id         # Get user by ID
PUT    /api/users/:id         # Update user
DELETE /api/users/:id         # Delete user (Admin only)
```

### Profile Management
```
GET    /api/profile           # Get user profile
POST   /api/profile           # Create profile
PUT    /api/profile/:id       # Update profile
DELETE /api/profile/:id       # Delete profile
```

### Skills & Categories
```
GET    /api/categories        # Get all categories
POST   /api/categories        # Create category
GET    /api/skills            # Get all skills
POST   /api/skills            # Create skill
```

### Education Management
```
GET    /api/profile/:id/educations        # Get profile educations
POST   /api/profile/:id/educations        # Add education
PUT    /api/profile/educations/:id        # Update education
DELETE /api/profile/educations/:id        # Delete education
```

### Experience Management
```
GET    /api/profile/:id/experiences       # Get profile experiences
POST   /api/profile/:id/experiences       # Add experience
PUT    /api/profile/experiences/:id       # Update experience
DELETE /api/profile/experiences/:id       # Delete experience
```

### Profile Skills
```
GET    /api/profile/:id/skills            # Get profile skills
POST   /api/profile/:id/skills            # Add skill to profile
PUT    /api/profile/skills/:id            # Update profile skill
DELETE /api/profile/skills/:id            # Remove skill from profile
```

### File Upload
```
POST   /api/upload/profile-image          # Upload profile image
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/[username]/dennymeapi.git
cd dennymeapi
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp env.example .env
# Edit .env with your database credentials
```

4. **Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE api_cms_dennyme;

# Import database schema
mysql -u root -p api_cms_dennyme < database/run_migrations.sql
```

5. **Run the application**
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000/api`

## 🚂 Railway Deployment

### Quick Deploy to Railway

1. **Create GitHub Repository**
   - Create repository named `dennymeapi`
   - Push your code to GitHub

2. **Deploy to Railway**
   - Visit [railway.app](https://railway.app)
   - Login with GitHub
   - Create new project from GitHub repo
   - Add MySQL database service
   - Set environment variables
   - Deploy automatically!

### Database Setup on Railway

1. **Add MySQL Service**
   - In Railway dashboard: "+ New" → "Database" → "Add MySQL"
   - Wait for service to be ready

2. **Import Database Schema**
   - Go to MySQL service → "Query" tab
   - Copy and paste content from `database/run_migrations.sql`
   - Execute the query

3. **Environment Variables**
```env
NODE_ENV=production
PORT=8000
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
```

**📖 For detailed deployment instructions, see:**
- `RAILWAY_SETUP_GUIDE.md` - Complete Railway deployment guide
- `DEPLOYMENT.md` - Multi-platform deployment options
- `SHARED_HOSTING_GUIDE.md` - Shared hosting deployment

## 🗄️ Database Structure

### Core Tables
- **users** - User authentication and roles
- **cms_profile** - User profile information
- **cms_m_category** - Skill categories
- **cms_m_skills** - Master skills data

### Profile Related Tables
- **cms_profile_educations** - Educational background
- **cms_profile_experiences** - Work experience
- **cms_profile_skills** - User skills with proficiency
- **cms_profile_projects** - Portfolio projects

### Sample Data Included
- Default admin user
- Skill categories (Frontend, Backend, Mobile, DevOps)
- Sample skills (React.js, Node.js, MySQL, etc.)
- Demo profile data for testing

## 🔒 Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=api_cms_dennyme
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Sample API Calls
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (with JWT token)
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 Documentation

- **API Examples**: See `api-examples.http` for complete API usage examples
- **Profile Education API**: `ProfileEducationAPI.md`
- **Profile Experience API**: `ProfileExperienceAPI.md`
- **Profile Skills API**: `ProfileSkillAPI.md`
- **Image Upload Guide**: `docs/IMAGE_UPLOAD_GUIDE.md`

## 🔧 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run dev:watch  # Start with file watching
npm run start:shared  # Start for shared hosting
```

### File Structure
```
api_cms_dennyme/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   └── config/         # Configuration files
├── database/
│   └── migrations/     # Database migration files
├── uploads/           # File uploads directory
├── docs/             # Documentation
└── scripts/          # Deployment scripts
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express validator middleware
- **CORS Protection**: Configurable CORS settings
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: File type and size validation

## 🌟 Production Ready

- **Environment Configuration**: Separate development/production configs
- **Error Handling**: Comprehensive error middleware
- **Logging**: Request logging with Morgan
- **Health Checks**: Built-in health check endpoint
- **Database Connection Pooling**: Optimized MySQL connections
- **Graceful Shutdown**: Proper server shutdown handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Denny Septiady**
- GitHub: [@dennyseptiady](https://github.com/dennyseptiady)
- LinkedIn: [dennyseptiady](https://linkedin.com/in/dennyseptiady)
- Email: dennyseptiady2012@gmail.com

---

## 🚀 Deploy Now

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/[username]/dennymeapi)

**Ready to deploy? Follow the Railway setup guide for instant deployment!** 🚂 