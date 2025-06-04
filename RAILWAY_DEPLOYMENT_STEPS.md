# 🚂 Railway Deployment - Step by Step Guide

## ✅ **Pre-deployment Checklist**
- [x] ✅ Code pushed to GitHub: `https://github.com/dennyseptiady/dennymeapi`
- [x] ✅ Database migrations ready: `database/run_migrations.sql`
- [x] ✅ Railway config ready: `railway.json`
- [x] ✅ Environment template ready: `env.production`

**🎯 Repository**: https://github.com/dennyseptiady/dennymeapi

---

## 🚀 **Step 1: Setup Railway Account**

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Start a new project"**
3. **Login with GitHub** (use account: dennyseptiady)
4. Allow Railway access to your repositories

### 1.2 Verify Account
- Check email for verification if needed
- Railway provides **$5 monthly credit** for free tier

---

## 🗄️ **Step 2: Create MySQL Database**

### 2.1 Create New Project
1. In Railway dashboard: **"New Project"**
2. Select **"Empty Project"**
3. Give project name: **"DennyMe API"**

### 2.2 Add MySQL Database
1. Click **"+ New"** button
2. Select **"Database"**
3. Choose **"Add MySQL"**
4. Wait 2-3 minutes for MySQL service to initialize

### 2.3 Get Database Credentials
After MySQL is ready, click on the MySQL service and note:
```
🔗 Connection Info (akan muncul otomatis):
MYSQL_HOST: [generated-host].railway.app
MYSQL_PORT: [generated-port]
MYSQL_USER: root
MYSQL_PASSWORD: [auto-generated-password]
MYSQL_DATABASE: railway
```

---

## 📊 **Step 3: Import Database Schema**

### 3.1 Access MySQL Query Interface
1. Click on **MySQL service** in Railway dashboard
2. Go to **"Query"** tab
3. You'll see SQL query interface

### 3.2 Import Complete Schema
1. **Copy all content** from file: `database/run_migrations.sql`
2. **Paste** into the Query interface
3. Click **"Run Query"** or press Ctrl+Enter
4. Wait for execution to complete

### 3.3 Verify Database Setup
Run this query to verify:
```sql
SHOW TABLES;
```

You should see these tables:
- ✅ users
- ✅ cms_m_category  
- ✅ cms_m_skills
- ✅ cms_profile
- ✅ cms_profile_educations
- ✅ cms_profile_experiences
- ✅ cms_profile_projects
- ✅ cms_profile_skills

---

## 🚀 **Step 4: Deploy Node.js Application**

### 4.1 Connect GitHub Repository
1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose repository: **"dennyseptiady/dennymeapi"**
4. Railway will auto-detect Node.js and start building

### 4.2 Monitor Initial Deployment
- Go to **"Deployments"** tab
- Watch the build process
- Initial deployment might fail (this is expected - we need to set environment variables)

---

## ⚙️ **Step 5: Configure Environment Variables**

### 5.1 Access Variables Settings
1. Click on your **Node.js service** (not MySQL)
2. Go to **"Variables"** tab
3. Add the following environment variables:

### 5.2 Set Required Variables
```env
NODE_ENV=production
PORT=8000

# Database connection (use Railway's reference variables)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}

# JWT Configuration
JWT_SECRET=DennyMeAPI_SuperSecure_JWT_Secret_Key_Production_Railway_2024
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=*
```

### 5.3 Save and Redeploy
1. Click **"Save"** after adding all variables
2. Railway will automatically **redeploy** the application
3. Wait for deployment to complete (2-3 minutes)

---

## 🔗 **Step 6: Get Your API URL**

### 6.1 Find Generated URL
1. Go to your **Node.js service**
2. Click **"Settings"** tab
3. Under **"Environment"**, you'll see generated URL like:
   ```
   https://dennymeapi-production-[random].up.railway.app
   ```

### 6.2 Test API Health Check
```bash
curl https://dennymeapi-production-[random].up.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "API is running",
  "timestamp": "2024-06-04T10:30:00.000Z",
  "environment": "production"
}
```

---

## 🧪 **Step 7: Test API Endpoints**

### 7.1 Test User Registration
```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "password123"
  }'
```

### 7.2 Test Login
```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 7.3 Test Sample Data
```bash
# Get categories
curl https://your-railway-url.up.railway.app/api/categories

# Get skills  
curl https://your-railway-url.up.railway.app/api/skills

# Get profiles
curl https://your-railway-url.up.railway.app/api/profile
```

---

## 📊 **Step 8: Monitor & Manage**

### 8.1 Railway Dashboard Features
- **📈 Metrics**: Monitor CPU, Memory, Network usage
- **📝 Logs**: Real-time application logs
- **🔄 Deployments**: View deployment history
- **💰 Usage**: Track credit usage

### 8.2 Database Management
- **📊 Metrics**: Connection count, query performance
- **🔍 Query Interface**: Run SQL queries directly
- **💾 Data Browser**: View table data

---

## 🎯 **Default Login Accounts**

After successful deployment, you can use these accounts:

### Admin Account
```
Email: admin@example.com
Password: Admin123
```

### Sample Profile
```
Email: dennyseptiady2012@gmail.com  
(Check profile data with complete education, experience, skills)
```

---

## 🛠️ **Troubleshooting**

### Issue 1: Build Fails
```
Error: Cannot find module 'xyz'
```
**Solution**: Check `package.json` dependencies are complete

### Issue 2: Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Verify environment variables are set correctly
- Check MySQL service is running
- Ensure Railway reference variables are used

### Issue 3: Port Issues
```
Error: listen EADDRINUSE
```
**Solution**: Railway auto-assigns PORT, ensure using `process.env.PORT`

### Issue 4: Missing Tables
```
Error: Table 'users' doesn't exist  
```
**Solution**: Re-run the migration SQL in Railway MySQL Query interface

---

## 📱 **Custom Domain (Optional)**

### Add Custom Domain
1. Go to Node.js service **"Settings"**
2. Click **"Domains"** 
3. Click **"Custom Domain"**
4. Enter your domain: `api.dennyme.com`
5. Configure DNS records as shown

---

## 💰 **Railway Pricing**

### Free Tier ($5/month credit)
- ✅ Good for development/testing
- ✅ Shared resources
- ✅ Community support

### Pro Plan ($20/month)
- ✅ More resources
- ✅ Priority support
- ✅ Database backups

---

## ✅ **Deployment Checklist**

**Pre-deployment:**
- [x] ✅ Code in GitHub: `dennyseptiady/dennymeapi`
- [x] ✅ Database migrations ready
- [x] ✅ Railway config files ready

**Railway Setup:**
- [ ] 🔄 Railway account created
- [ ] 🔄 MySQL service created  
- [ ] 🔄 Database schema imported
- [ ] 🔄 GitHub repository connected
- [ ] 🔄 Environment variables set

**Post-deployment:**
- [ ] 🔄 Health check passed
- [ ] 🔄 Database connection verified
- [ ] 🔄 API endpoints tested
- [ ] 🔄 Sample data accessible

---

## 🎉 **Success! Your API is Live**

Once everything is working:
- ✅ **API URL**: https://your-app.up.railway.app
- ✅ **Health Check**: `/api/health`
- ✅ **Documentation**: Available in repository
- ✅ **Database**: Fully configured with sample data
- ✅ **Authentication**: JWT working
- ✅ **File Upload**: Ready for profile images

**🚀 Next Steps**: 
- Update frontend to use Railway API URL
- Test all endpoints thoroughly  
- Monitor performance in Railway dashboard
- Consider custom domain for production

---

**📞 Need Help?**
- Railway Documentation: https://docs.railway.app
- GitHub Repository: https://github.com/dennyseptiady/dennymeapi  
- Issues: Create issue in GitHub repo 