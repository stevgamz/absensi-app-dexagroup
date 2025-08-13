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

      const token = jwt.sign(
        { 
          employee_id: employee.employee_id,
          username: employee.username,
          name: employee.name,
          role: employee.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          employee: {
            employee_id: employee.employee_id,
            name: employee.name,
            username: employee.username,
            role: employee.role,
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
      res.json({
        success: true,
        data: {
          employee: req.employee
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
}

module.exports = AuthController;