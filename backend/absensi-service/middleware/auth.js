const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token akses diperlukan' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findByEmployeeId(decoded.employee_id);
    
    if (!employee) {
      return res.status(403).json({ 
        success: false, 
        message: 'Karyawan tidak ditemukan' 
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token tidak valid atau kadaluarsa' 
    });
  }
};

// Middleware untuk admin only
const requireAdmin = async (req, res, next) => {
  if (req.employee.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang bisa mengakses.'
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };