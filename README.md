# 🕐 Absensi App DexaGroup

Aplikasi sistem absensi karyawan berbasis web dengan arsitektur **monorepo** menggunakan Node.js + Express untuk backend dan React (Create React App) untuk frontend.

## Fitur Utama

### **Untuk Karyawan (Employee):**
- Login dengan username/password
- Dashboard absensi dengan waktu real-time
- Check In/Check Out dengan timestamp
- Upload foto saat absensi (opsional) # untuk kedepan bisa disesuaikan
- Tambah catatan pada absensi
- Riwayat absensi personal (7 hari terakhir)
- Status absensi (Hadir/Terlambat) # waktu absen jam 08:00 selebihnya diitung terlambat

### **Untuk Admin:**
- Semua fitur karyawan +
- **CRUD Karyawan** (Create, Read, Update, Delete)
- Generate Employee ID otomatis
- Monitoring absensi semua karyawan
- Lihat foto absensi karyawan
- Statistik absensi harian
- Search & filter karyawan

## Tech Stack

**Backend:**
- Node.js + Express.js
- MySQL Database
- JWT Authentication # secara functionality tidak maksimal, hanya sebagai contoh implementasi saja
- bcrypt untuk password hashing
- File upload untuk foto absensi

**Frontend:**
- React.js (Create React App)
- React Router DOM
- Tailwind CSS
- Axios untuk HTTP client
- Lucide React untuk icons

## 📁 Struktur Project

```
absensi-app-dexagroup/
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── app.js
│   ├── uploads/photos/          # Upload foto absensi
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── attendanceController.js
│   ├── models/
│   │   ├── Employee.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   └── attendance.js
│   └── middleware/
│       └── auth.js
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── index.css
        ├── components/
        │   ├── Layout.js
        │   └── Navbar.js
        ├── pages/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   └── Employees.js
        └── services/
            └── api.js
```

## Instalasi & Setup

### Prerequisites
- Node.js (v16 atau lebih tinggi)
- MySQL Server (v8.0 atau lebih tinggi)
- npm atau yarn

### 1. Clone/Download Project
```bash
git clone <repository-url>
# atau download dan extract
cd absensi-app-dexagroup
```

### 2. Setup Database
```sql
-- Login ke MySQL
mysql -u root -p

-- Buat database
CREATE DATABASE absensi_db;

-- Keluar dari MySQL (tables akan dibuat otomatis)
exit
```

### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit file .env dengan konfigurasi database Anda:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=absensi_db
# JWT_SECRET=your_strong_jwt_secret_here
# PORT=3001
```

### 4. Setup Frontend
```bash
cd ../frontend

# Jika belum ada, buat dengan Create React App:
# npx create-react-app .

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom axios lucide-react

# Setup Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 5. Konfigurasi Package.json Frontend
Pastikan ada `"proxy": "http://localhost:3001"` di package.json frontend untuk menghindari CORS issues.

## Menjalankan Aplikasi

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend akan berjalan di: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend akan berjalan di: `http://localhost:3000`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/login` | Login karyawan | Public |
| GET | `/api/auth/profile` | Get profile user | Authenticated |

### Employee Endpoints (Admin Only)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/employees` | Get semua karyawan | - |
| GET | `/api/employees/:id` | Get karyawan by ID | - |
| POST | `/api/employees` | Buat karyawan baru | `{name, username, password, role, position, department, email, phone}` |
| PUT | `/api/employees/:id` | Update karyawan | `{name, username, password, role, position, department, email, phone}` |
| DELETE | `/api/employees/:id` | Hapus karyawan | - |

### Attendance Endpoints

| Method | Endpoint | Description | Access | Body |
|--------|----------|-------------|---------|------|
| POST | `/api/attendance/checkin` | Check in absensi | Employee/Admin | `{notes, photo, location}` |
| POST | `/api/attendance/checkout` | Check out absensi | Employee/Admin | `{notes, photo, location}` |
| GET | `/api/attendance/today` | Status absensi hari ini | Employee/Admin | - |
| GET | `/api/attendance/history` | Riwayat absensi personal | Employee/Admin | `?limit=30` |
| GET | `/api/attendance/today-all` | Absensi semua karyawan hari ini | Admin | - |
| GET | `/api/attendance/all` | Semua data absensi | Admin | `?start_date&end_date&limit` |

## 🔑 User Roles & Permissions

### 👨‍💼 **Admin (Role: admin)**
- ✅ Akses semua halaman
- ✅ CRUD karyawan (Create, Read, Update, Delete)
- ✅ Monitoring absensi semua karyawan
- ✅ Lihat foto absensi karyawan
- ✅ Dashboard dan statistik
- ✅ Dapat melakukan absensi sendiri

### 👤 **Employee (Role: employee)**
- ✅ Akses dashboard absensi saja
- ✅ Check in/Check out dengan foto
- ✅ Lihat riwayat absensi sendiri
- ❌ Tidak bisa akses management
