# 🏠 Panduan Deploy API ke Shared Hosting

## 🤔 Apakah Shared Hosting Cocok untuk Node.js API?

**Tantangan:**
- Sebagian besar shared hosting dirancang untuk PHP/HTML
- Node.js memerlukan server yang bisa menjalankan aplikasi persistent
- Akses port terbatas
- Environment variables mungkin tidak tersedia
- Restart otomatis saat server down

**Solusi:**
- Pilih shared hosting yang mendukung Node.js
- Gunakan cPanel dengan Node.js selector
- Setup proxy dari subdomain ke aplikasi Node.js

---

## 🎯 Shared Hosting yang Mendukung Node.js

### 1. **Hostinger (Recommended)**
- ✅ Node.js support
- ✅ MySQL database
- ✅ cPanel dengan Node.js Manager
- ✅ Harga terjangkau (~$2-5/bulan)

### 2. **Namecheap**
- ✅ Node.js support di plan shared hosting
- ✅ cPanel interface
- ✅ MySQL database included

### 3. **A2 Hosting**
- ✅ Node.js support
- ✅ SSH access
- ✅ cPanel dengan Node.js selector

### 4. **InMotion Hosting**
- ✅ Node.js support
- ✅ MySQL database
- ✅ cPanel interface

---

## 🚀 Langkah Deploy ke Shared Hosting

### Step 1: Persiapan File untuk Shared Hosting

#### 1.1 Buat file konfigurasi khusus shared hosting:
```javascript
// server-shared.js
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

// Port untuk shared hosting (biasanya environment variable)
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    const server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
```

#### 1.2 Update package.json untuk shared hosting:
```json
{
  "scripts": {
    "start": "node server.js",
    "start:shared": "node server-shared.js",
    "dev": "nodemon",
    "dev:watch": "nodemon --watch src --watch server.js"
  }
}
```

#### 1.3 Buat file .htaccess untuk proxy (jika diperlukan):
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

---

### Step 2: Setup di cPanel

#### 2.1 Login ke cPanel hosting Anda

#### 2.2 Buka "Node.js Selector" atau "Node.js Manager"

#### 2.3 Create New Application:
- **Node.js Version**: Pilih versi terbaru (18.x atau 20.x)
- **Application Mode**: Production
- **Application Root**: `public_html/api` (atau folder yang diinginkan)
- **Application URL**: `yourdomain.com/api` atau subdomain
- **Application Startup File**: `server-shared.js`

#### 2.4 Set Environment Variables:
```
NODE_ENV=production
DB_HOST=localhost
DB_USER=[your_cpanel_db_user]
DB_PASSWORD=[your_cpanel_db_password]
DB_NAME=[your_database_name]
DB_PORT=3306
JWT_SECRET=[your_strong_secret_key]
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
```

---

### Step 3: Upload dan Setup Database

#### 3.1 Upload Files:
- Zip semua file project
- Upload via File Manager cPanel
- Extract ke folder aplikasi Node.js

#### 3.2 Install Dependencies:
```bash
# Masuk ke terminal/SSH (jika tersedia)
cd public_html/api
npm install --production
```

#### 3.3 Setup Database:
- Buat database MySQL di cPanel
- Import struktur database
- Update environment variables dengan kredensial database

---

### Step 4: Testing dan Monitoring

#### 4.1 Test API:
```
GET https://yourdomain.com/api/health
```

#### 4.2 Monitor Logs:
- Check error logs di cPanel
- Monitor resource usage

---

## 🔧 Konfigurasi Khusus Shared Hosting

### File: `ecosystem.config.js` (untuk PM2 jika tersedia)
```javascript
module.exports = {
  apps: [{
    name: 'api-cms-dennyme',
    script: 'server-shared.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### File: `web.config` (untuk Windows shared hosting)
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server-shared.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server-shared.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server-shared.js"/>
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

## ⚠️ Limitasi Shared Hosting

### 1. **Resource Limits:**
- CPU usage terbatas
- Memory limit (biasanya 512MB-1GB)
- Concurrent connections terbatas

### 2. **Network Restrictions:**
- Port access terbatas
- Outbound connections mungkin dibatasi
- SSL certificate handling

### 3. **Process Management:**
- Aplikasi mungkin di-restart otomatis
- No persistent background processes
- Limited cron job access

---

## 🌟 Alternatif yang Lebih Baik

Jika shared hosting tidak memadai, pertimbangkan:

### 1. **VPS Murah:**
- DigitalOcean ($4/month)
- Vultr ($2.50/month)
- Linode ($5/month)

### 2. **Platform-as-a-Service:**
- Railway (Free tier)
- Heroku ($7/month)
- Vercel (Free untuk usage rendah)

### 3. **Dedicated Node.js Hosting:**
- NodeChef
- Heroku
- Platform.sh

---

## 🔍 Troubleshooting Shared Hosting

### Common Issues:

1. **Port tidak bisa diakses:**
   - Gunakan port yang disediakan hosting
   - Setup proxy via .htaccess

2. **Database connection error:**
   - Pastikan menggunakan 'localhost' sebagai host
   - Check user privileges database

3. **Module tidak ditemukan:**
   - Pastikan semua dependencies ter-install
   - Check Node.js version compatibility

4. **Application tidak start:**
   - Check startup file path di cPanel
   - Verify environment variables

---

## 📋 Checklist Deployment

- [ ] Pilih shared hosting yang support Node.js
- [ ] Setup Node.js application di cPanel
- [ ] Upload dan extract files
- [ ] Install dependencies
- [ ] Setup database dan import schema
- [ ] Configure environment variables
- [ ] Test API endpoints
- [ ] Setup domain/subdomain
- [ ] Monitor logs dan performance

---

## 💡 Tips untuk Shared Hosting

1. **Optimize untuk low resource:**
   - Minimalkan dependencies
   - Use connection pooling
   - Implement caching

2. **Monitoring:**
   - Setup basic health checks
   - Monitor resource usage
   - Log important events

3. **Security:**
   - Use strong JWT secrets
   - Implement rate limiting
   - Validate all inputs

4. **Backup:**
   - Regular database backups
   - Code repository backup
   - Environment variables backup 