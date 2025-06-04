# 🚀 Panduan Deployment API CMS DennyMe

## 📋 Platform Hosting yang Direkomendasikan

### 1. Railway (Recommended - Free Tier Available)

#### Langkah Deploy ke Railway:

1. **Persiapan:**
   - Pastikan semua file sudah di commit ke Git repository
   - Push ke GitHub/GitLab

2. **Setup Railway:**
   - Buka [railway.app](https://railway.app)
   - Login dengan GitHub
   - Klik "New Project" → "Deploy from GitHub repo"
   - Pilih repository API Anda

3. **Setup Database:**
   - Di Railway dashboard, klik "Add Service" → "Database" → "MySQL"
   - Catat kredensial database yang diberikan

4. **Setup Environment Variables:**
   ```
   NODE_ENV=production
   PORT=8000
   DB_HOST=[dari Railway MySQL service]
   DB_USER=[dari Railway MySQL service]
   DB_PASSWORD=[dari Railway MySQL service]
   DB_NAME=api_cms_dennyme
   DB_PORT=3306
   JWT_SECRET=[buat secret yang kuat]
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=*
   ```

5. **Deploy:**
   - Railway akan otomatis deploy setelah environment variables diset
   - Tunggu proses build selesai
   - API akan tersedia di URL yang diberikan Railway

---

### 2. Heroku (Berbayar - Mudah)

#### Langkah Deploy ke Heroku:

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login dan Setup:**
   ```bash
   heroku login
   heroku create nama-api-anda
   ```

3. **Setup Database:**
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-key
   heroku config:set JWT_EXPIRES_IN=24h
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

---

### 3. Vercel (Serverless - Free)

#### Langkah Deploy ke Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Setup Vercel:**
   ```bash
   vercel
   ```

3. **Set Environment Variables di Vercel Dashboard**

4. **Deploy:**
   ```bash
   vercel --prod
   ```

---

### 4. DigitalOcean App Platform

#### Langkah Deploy ke DigitalOcean:

1. Buka [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Klik "Create App"
3. Connect GitHub repository
4. Set environment variables
5. Deploy

---

## 🔧 Persiapan Sebelum Deploy

### 1. Environment Variables:
Pastikan semua environment variables sudah diset dengan benar:
- `NODE_ENV=production`
- `PORT` (biasanya otomatis diset oleh hosting)
- Database credentials
- `JWT_SECRET` (harus kuat dan unik)

### 2. Database:
- Setup database MySQL di platform hosting
- Import schema/struktur database
- Update connection string di environment variables

### 3. CORS:
- Update `CORS_ORIGIN` sesuai domain frontend Anda
- Atau set ke `*` untuk development (tidak disarankan untuk production)

---

## 🔍 Testing Setelah Deploy

1. **Health Check:**
   ```
   GET https://your-api-domain.com/api/health
   ```

2. **Test API Endpoints:**
   - Test authentication endpoints
   - Test CRUD operations
   - Pastikan database connection berjalan

3. **Monitor Logs:**
   - Check application logs di hosting dashboard
   - Monitor untuk errors atau warnings

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Error:**
   - Periksa environment variables database
   - Pastikan database service sudah running
   - Check firewall/security groups

2. **Port Issues:**
   - Pastikan menggunakan `process.env.PORT`
   - Jangan hardcode port number

3. **Environment Variables Missing:**
   - Double check semua env vars sudah diset
   - Restart aplikasi setelah update env vars

4. **Build Failures:**
   - Check Node.js version compatibility
   - Ensure all dependencies di package.json
   - Check build logs untuk error messages

---

## 📚 Resources

- [Railway Documentation](https://docs.railway.app)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/) 