# 🗄️ Import Database ke Railway - Alternatif Methods

## 🚨 **Jika Tab "Query" Tidak Ada di Railway**

### **Method 1: Gunakan MySQL Client dari Terminal**

#### 1.1 Install MySQL Client (jika belum ada)
```bash
# macOS
brew install mysql

# Ubuntu/Debian
sudo apt-get install mysql-client

# Windows (gunakan MySQL installer)
```

#### 1.2 Get Database Connection String dari Railway
1. Click **MySQL service** di Railway
2. Cari tab **"Connect"** atau **"Variables"**
3. Copy connection details:
   ```
   MYSQL_HOST: [host].railway.app
   MYSQL_PORT: [port]
   MYSQL_USER: root
   MYSQL_PASSWORD: [password]
   MYSQL_DATABASE: railway
   ```

#### 1.3 Connect dan Import Database
```bash
# Connect ke Railway MySQL
mysql -h [MYSQL_HOST] -P [MYSQL_PORT] -u root -p[MYSQL_PASSWORD] railway

# Setelah connected, import database
mysql -h [MYSQL_HOST] -P [MYSQL_PORT] -u root -p[MYSQL_PASSWORD] railway < database/run_migrations.sql
```

**Contoh lengkap:**
```bash
mysql -h viaduct-fra1-db.railway.app -P 5432 -u root -pmypassword123 railway < database/run_migrations.sql
```

---

### **Method 2: Gunakan Railway CLI**

#### 2.1 Install Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to project
railway link
```

#### 2.2 Import Database via CLI
```bash
# Connect to MySQL
railway connect MySQL

# Atau import langsung
cat database/run_migrations.sql | railway connect MySQL
```

---

### **Method 3: Copy-Paste Manual (Jika Ada Console/Terminal)**

#### 3.1 Cari Tab Console/Terminal
- Look for **"Console"**, **"Terminal"**, atau **"Shell"** tab
- Atau ada icon terminal/command line

#### 3.2 Manual Execute Commands
Jika ada console, jalankan perintah MySQL:
```sql
-- Copy dan paste section by section dari run_migrations.sql

-- 1. Create users table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert admin user
INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_active`) VALUES 
('Administrator', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'admin', 1);

-- Continue dengan table lainnya...
```

---

### **Method 4: Gunakan phpMyAdmin Alternative**

#### 4.1 Gunakan MySQL Workbench
1. Download **MySQL Workbench**
2. Create new connection dengan Railway credentials
3. Open `database/run_migrations.sql`
4. Execute script

#### 4.2 Gunakan Online MySQL Client
- **Adminer** (adminer.org)
- **phpMyAdmin online**
- Connect dengan Railway credentials

---

### **Method 5: Screenshot & Check Railway Interface**

Bisa Anda screenshot interface Railway MySQL service? Mungkin ada tab yang:
- **"Execute SQL"**
- **"Run Query"** 
- **"SQL Editor"**
- **"Command"**

---

## 🧪 **Verify Database Import**

Setelah berhasil import, verify dengan:

```sql
-- Check tables
SHOW TABLES;

-- Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM cms_m_category;
SELECT COUNT(*) FROM cms_m_skills;
SELECT COUNT(*) FROM cms_profile;
```

Expected results:
- 8 tables created
- 1 user in users table  
- 4 categories
- 11 skills
- 2 profiles with complete data

---

## 💡 **Rekomendasi Tercepat**

**Gunakan Method 1 (MySQL Client)** - paling reliable:

```bash
# 1. Get connection details dari Railway
# 2. Run this command (ganti dengan details Anda):
mysql -h [HOST] -P [PORT] -u root -p[PASSWORD] railway < database/run_migrations.sql
```

Ini akan import semua tables + sample data sekaligus dalam 1 command. 