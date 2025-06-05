# 🔐 Railway Environment Variables Security Setup

## 📋 Daftar Environment Variables yang Perlu Diset di Railway Dashboard

Untuk keamanan, **JANGAN PERNAH** commit credential ke repository. Set semua environment variables berikut melalui Railway Dashboard:

### **1. Database Configuration**
```
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=JGuGJCtLROAPHWJZyrxrFqkuwdgWpLtZ
DB_NAME=railway
DB_PORT=3306
```

### **2. JWT Configuration**
```
JWT_SECRET=your_super_secure_production_jwt_key_make_it_very_long_and_complex
JWT_EXPIRES_IN=24h
```

### **3. Application Configuration**
```
NODE_ENV=production
PORT=8000
```

### **4. CORS Configuration**
```
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🛠️ Cara Set Environment Variables di Railway

### **Method 1: Railway Dashboard (Recommended)**

1. **Login ke Railway Dashboard**
   ```
   https://railway.app/dashboard
   ```

2. **Pilih Project** `dennymeapi`

3. **Go to Variables Tab**
   - Klik project Anda
   - Pilih tab "Variables"

4. **Add Environment Variables**
   - Klik "New Variable"
   - Masukkan `Key` dan `Value`
   - Ulangi untuk semua variables di atas

### **Method 2: Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set variables
railway variables set DB_HOST=mysql.railway.internal
railway variables set DB_USER=root
railway variables set DB_PASSWORD=JGuGJCtLROAPHWJZyrxrFqkuwdgWpLtZ
railway variables set DB_NAME=railway
railway variables set DB_PORT=3306
railway variables set JWT_SECRET=your_super_secure_production_jwt_key_make_it_very_long_and_complex
railway variables set JWT_EXPIRES_IN=24h
railway variables set NODE_ENV=production
railway variables set PORT=8000
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
```

## ✅ Verification

Setelah set environment variables, verify dengan:

```bash
# Check if variables are set
railway variables

# Test deployment
railway logs
```

## 🚨 Security Best Practices

1. ✅ **File `env.production` sudah di `.gitignore**
2. ✅ **Credential tidak tersimpan di repository**
3. ✅ **Environment variables hanya di Railway Dashboard**
4. ✅ **File template `env.production.example` tanpa credential**

## 🔄 Auto-Deploy After Setting Variables

Railway akan otomatis redeploy setelah Anda set environment variables. Monitor deployment di:
```
https://railway.app/project/your-project-id/deployments
``` 