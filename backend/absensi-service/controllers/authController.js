const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username dan password harus diisi'
        });
      }

      const employee = await Employee.findByUsername(username);
      if (!employee) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }

      const isValidPassword = await bcrypt.compare(password, employee.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          employee_id: employee.employee_id,
          username: employee.username 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token: token,
          employee: {
            employee_id: employee.employee_id,
            name: employee.name,
            username: employee.username,
            position: employee.position,
            department: employee.department,
            email: employee.email
          }
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async profile(req, res) {
    try {
      if (!req.session.employee) {
        return res.status(401).json({
          success: false,
          message: 'Belum login'
        });
      }

      res.json({
        success: true,
        data: {
          employee: req.session.employee
        }
      });
    } catch (error) {
      console.error('Profile Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async logout(req, res) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Gagal logout'
        });
      }
      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logout berhasil'
      });
    });
  }
}

module.exports = AuthController;
