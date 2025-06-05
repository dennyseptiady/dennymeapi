# 🔧 Railway Node.js Environment Variables Setup

## **Required Environment Variables untuk Node.js Service:**

Di Railway Node.js service, masuk ke tab **"Variables"** dan tambahkan:

### **📱 Application Settings**
```
NODE_ENV=production
PORT=3000
```

### **🔐 Security Settings**
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12
```

### **📊 Database Connection (IMPORTANT!)**
```
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=JGuGJCtLROAPHWJZyrxrFqkuwdgWpLtZ
DB_NAME=railway
```

### **📁 File Upload Settings**
```
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
```

### **🌐 CORS Settings**
```
CORS_ORIGIN=*
```

## **⚠️ IMPORTANT NOTES:**

1. **Database Host**: Gunakan `mysql.railway.internal` (bukan public URL) karena ini untuk internal Railway communication
2. **JWT_SECRET**: Ganti dengan secret key yang kuat untuk production
3. **Port**: Railway akan auto-assign port, tapi set ke 3000 sebagai default
4. **File Uploads**: Akan menggunakan Railway's ephemeral storage

## **🔄 Variable Copy-Paste Format:**

Untuk memudahkan, copy-paste variables ini ke Railway:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=dennyme-super-secret-jwt-key-2024-production
BCRYPT_ROUNDS=12
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=JGuGJCtLROAPHWJZyrxrFqkuwdgWpLtZ
DB_NAME=railway
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
CORS_ORIGIN=*
```

## **📝 Railway Setup Steps:**

1. **Create Node.js Service** dari GitHub repo
2. **Go to Variables tab** di Node.js service  
3. **Add each variable** satu per satu
4. **Deploy akan auto-restart** setelah variables di-set
5. **Check Logs** untuk memastikan connection database berhasil

## **✅ Verification:**

Setelah deploy, cek logs untuk:
- ✅ Database connection successful
- ✅ Server running on port
- ✅ No connection errors
- ✅ Tables accessible

## **🌐 Test Endpoints:**

Setelah deploy berhasil, test:
```
GET /api/health
POST /api/auth/login
GET /api/profiles
``` 