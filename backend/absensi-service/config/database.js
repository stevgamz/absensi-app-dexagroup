const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'absensi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const uploadsDir = path.join(__dirname, '../uploads/photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database tables
async function initDatabase() {
  try {
    await pool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await pool.query(`USE \`${dbConfig.database}\``);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'employee') DEFAULT 'employee',
        position VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(20) NOT NULL,
        check_in DATETIME,
        check_out DATETIME,
        date DATE NOT NULL,
        status ENUM('hadir', 'terlambat', 'alpha') DEFAULT 'hadir',
        notes TEXT,
        check_in_photo VARCHAR(255),
        check_out_photo VARCHAR(255),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
      )
    `);

    // Insert dummy data
    const bcrypt = require('bcryptjs');
    
    // Check if employees exist
    const [existingEmployees] = await pool.execute('SELECT COUNT(*) as count FROM employees');
    
    if (existingEmployees[0].count === 0) {
      const employees = [
        {
          employee_id: 'ADM001',
          name: 'Administrator',
          username: 'admin',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin',
          position: 'System Administrator',
          department: 'IT',
          email: 'admin@dexagroup.com',
          phone: '08123456789'
        },
        {
          employee_id: 'EMP001',
          name: 'John Doe',
          username: 'john.doe',
          password: await bcrypt.hash('password123', 10),
          role: 'employee',
          position: 'Software Developer',
          department: 'IT',
          email: 'john@dexagroup.com',
          phone: '08123456788'
        },
        {
          employee_id: 'EMP002',
          name: 'Jane Smith',
          username: 'jane.smith',
          password: await bcrypt.hash('password123', 10),
          role: 'employee',
          position: 'UI/UX Designer',
          department: 'Design',
          email: 'jane@dexagroup.com',
          phone: '08123456787'
        },
        {
          employee_id: 'EMP003',
          name: 'Michael Johnson',
          username: 'michael.j',
          password: await bcrypt.hash('password123', 10),
          role: 'employee',
          position: 'Project Manager',
          department: 'Management',
          email: 'michael@dexagroup.com',
          phone: '08123456786'
        }
      ];

      for (const emp of employees) {
        await pool.execute(`
          INSERT INTO employees (employee_id, name, username, password, role, position, department, email, phone) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [emp.employee_id, emp.name, emp.username, emp.password, emp.role, emp.position, emp.department, emp.email, emp.phone]);
      }

      console.log('✅ Dummy data berhasil ditambahkan');
    }

    console.log('✅ Database berhasil diinisialisasi');
  } catch (error) {
    console.error('❌ Error inisialisasi database:', error);
  }
}

// Initialize on startup
initDatabase();

module.exports = pool;