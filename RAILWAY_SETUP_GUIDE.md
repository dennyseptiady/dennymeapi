# 🚂 Panduan Lengkap Deploy API ke Railway

## 📋 Persiapan Sebelum Deploy

### 1. Push ke GitHub dengan nama "dennymeapi"

```bash
# Repository sudah di-init dan commit
# Sekarang buat repository di GitHub dengan nama "dennymeapi"

# Tambahkan remote GitHub
git remote add origin https://github.com/[username]/dennymeapi.git

# Push ke GitHub
git push -u origin main
```

### 2. File yang Sudah Disiapkan
- ✅ `railway.json` - Konfigurasi Railway
- ✅ `env.production` - Template environment variables
- ✅ `package.json` - Scripts dan dependencies
- ✅ `server.js` - Main server file

---

## 🚀 Step 1: Setup Railway Account

### 1.1 Daftar Railway
1. Buka [railway.app](https://railway.app)
2. Klik **"Login"** atau **"Start a New Project"**
3. Login dengan **GitHub account** Anda
4. Railway akan meminta akses ke GitHub repositories

### 1.2 Verifikasi Akun
- Railway mungkin meminta verifikasi email
- Verifikasi akun untuk mendapat free credits ($5/bulan)

---

## 🗄️ Step 2: Setup MySQL Database di Railway

### 2.1 Buat Database Service
1. Di Railway dashboard, klik **"New Project"**
2. Pilih **"Empty Project"**
3. Klik **"+ New"** → **"Database"** → **"Add MySQL"**
4. Tunggu beberapa menit sampai MySQL service aktif

### 2.2 Catat Database Credentials
Setelah MySQL service aktif, masuk ke service tersebut dan catat:

```
🔗 Database Connection Info:
MYSQL_ROOT_PASSWORD: [auto-generated]
MYSQL_DATABASE: railway
MYSQL_USER: root
MYSQL_PASSWORD: [auto-generated]
MYSQL_HOST: [hostname].railway.app
MYSQL_PORT: [port-number]
MYSQL_URL: mysql://root:[password]@[hostname].railway.app:[port]/railway
```

### 2.3 Setup Database Schema
1. **Option A: Using Railway Web Terminal**
   - Buka MySQL service di Railway
   - Klik tab **"Query"**
   - Copy-paste SQL schema dari `database/migrations/`

2. **Option B: Using MySQL Client**
   ```bash
   # Install MySQL client jika belum ada
   brew install mysql  # macOS
   
   # Connect ke Railway MySQL
   mysql -h [hostname].railway.app -P [port] -u root -p[password] railway
   
   # Import schema
   source database/migrations/001_create_users_table.sql;
   source database/migrations/create_profile_table.sql;
   ```

---

## 🚀 Step 3: Deploy API Application

### 3.1 Connect GitHub Repository
1. Di Railway dashboard, klik **"+ New"** → **"GitHub Repo"**
2. Pilih repository **"dennymeapi"**
3. Railway akan otomatis detect Node.js dan start deployment

### 3.2 Set Environment Variables
Masuk ke deployed service, klik tab **"Variables"** dan tambahkan:

```env
NODE_ENV=production
PORT=8000

# Database - gunakan kredensial dari MySQL service Railway
DB_HOST=[mysql_host_dari_railway]
DB_USER=root
DB_PASSWORD=[mysql_password_dari_railway]
DB_NAME=railway
DB_PORT=[mysql_port_dari_railway]

# JWT Configuration
JWT_SECRET=your_super_secure_production_jwt_key_make_it_very_long_and_complex_123456789
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=*
```

**💡 Tips Environment Variables:**
- Railway auto-connect services, jadi Anda bisa gunakan reference variables:
  ```
  DB_HOST=${{MySQL.MYSQL_HOST}}
  DB_USER=${{MySQL.MYSQL_USER}}
  DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
  DB_PORT=${{MySQL.MYSQL_PORT}}
  DB_NAME=${{MySQL.MYSQL_DATABASE}}
  ```

### 3.3 Deploy
1. Railway akan otomatis deploy setelah environment variables diset
2. Monitor deployment di tab **"Deployments"**
3. Check logs untuk memastikan tidak ada error

---

## 🔗 Step 4: Setup Domain & SSL

### 4.1 Railway Generated Domain
Railway otomatis memberikan domain seperti:
```
https://dennymeapi-production.up.railway.app
```

### 4.2 Custom Domain (Optional)
1. Di service settings, klik **"Networking"**
2. Klik **"Custom Domain"**
3. Tambahkan domain Anda (butuh DNS configuration)

---

## 🧪 Step 5: Testing API

### 5.1 Health Check
```bash
curl https://dennymeapi-production.up.railway.app/api/health
```

Response yang diharapkan:
```json
{
  "status": "OK",
  "message": "API is running",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "production"
}
```

### 5.2 Test Database Connection
```bash
curl -X POST https://dennymeapi-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Railway Dashboard Features
- **📈 Metrics**: CPU, Memory, Network usage
- **📝 Logs**: Real-time application logs
- **🔄 Deployments**: History dan rollback
- **💰 Usage**: Credits dan billing

### 6.2 Database Management
- **📊 Metrics**: Connection count, queries
- **🔍 Query Tool**: Run SQL queries langsung
- **💾 Backups**: Automatic backups (Pro plan)

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:**
- Check database environment variables
- Pastikan MySQL service sudah running
- Verify network connectivity antara services

### Issue 2: Port Issues
```
Error: listen EADDRINUSE :::8000
```
**Solution:**
- Railway akan auto-assign PORT, pastikan menggunakan `process.env.PORT`
- Jangan hardcode port di application

### Issue 3: Build Failures
```
Error: Cannot find module 'xyz'
```
**Solution:**
- Check `package.json` dependencies
- Pastikan tidak ada missing dependencies
- Check Node.js version compatibility

### Issue 4: Database Schema Missing
```
Error: Table 'users' doesn't exist
```
**Solution:**
- Import database schema ke MySQL service
- Run migrations manually via Railway Query tool

---

## 💡 Railway Best Practices

### 1. **Resource Optimization**
```javascript
// connection pooling di database.js
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  acquireTimeout: 60000,
  timeout: 60000
});
```

### 2. **Environment Management**
- Gunakan Railway reference variables untuk auto-connection
- Set different environments untuk staging/production
- Never commit sensitive data

### 3. **Monitoring**
- Setup health check endpoints
- Monitor resource usage di Railway dashboard
- Set up alerts untuk critical issues

### 4. **Deployment Strategy**
- Use feature branches untuk development
- Auto-deploy dari main branch
- Test thoroughly sebelum merge

---

## 💰 Railway Pricing

### Free Tier (Hobby Plan)
- $5 credit per month
- Shared CPU & Memory
- 1GB storage
- Community support

### Pro Plan ($20/month)
- Priority build queue
- More resources
- Database backups
- Priority support

---

## 📋 Deployment Checklist

**Pre-deployment:**
- [ ] Code pushed ke GitHub repository "dennymeapi"
- [ ] Environment variables prepared
- [ ] Database schema ready

**Railway Setup:**
- [ ] Railway account created & verified
- [ ] MySQL service created
- [ ] Database schema imported
- [ ] GitHub repository connected
- [ ] Environment variables configured

**Post-deployment:**
- [ ] Health check passed
- [ ] Database connection verified
- [ ] API endpoints tested
- [ ] Logs checked for errors
- [ ] Domain configured (if custom)

**Monitoring:**
- [ ] Metrics dashboard reviewed
- [ ] Log monitoring setup
- [ ] Backup strategy confirmed
- [ ] Usage tracking enabled

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Railway GitHub Integration](https://docs.railway.app/deploy/github)
- [Railway MySQL Guide](https://docs.railway.app/databases/mysql)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Custom Domains](https://docs.railway.app/deploy/custom-domains) 