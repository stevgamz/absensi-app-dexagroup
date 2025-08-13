const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

class EmployeeController {
  static async getAllEmployees(req, res) {
    try {
      const employees = await Employee.findAll();
      
      res.json({
        success: true,
        message: 'Data karyawan berhasil diambil',
        data: employees
      });
    } catch (error) {
      console.error('Get Employees Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findByEmployeeId(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Karyawan tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      console.error('Get Employee Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async createEmployee(req, res) {
    try {
      const { name, username, password, role, position, department, email, phone } = req.body;

      // Validation
      if (!name || !username || !password || !position || !department) {
        return res.status(400).json({
          success: false,
          message: 'Nama, username, password, posisi, dan departemen harus diisi'
        });
      }

      // Generate employee ID
      const employee_id = await Employee.generateEmployeeId();

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const employeeData = {
        employee_id,
        name,
        username,
        password: hashedPassword,
        role: role || 'employee',
        position,
        department,
        email,
        phone
      };

      const insertId = await Employee.create(employeeData);

      res.status(201).json({
        success: true,
        message: 'Karyawan berhasil ditambahkan',
        data: {
          id: insertId,
          employee_id,
          name,
          username,
          role: role || 'employee',
          position,
          department,
          email,
          phone
        }
      });
    } catch (error) {
      console.error('Create Employee Error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const { name, username, position, department, email, phone, role, password } = req.body;

      // Validation
      if (!name || !username || !position || !department) {
        return res.status(400).json({
          success: false,
          message: 'Nama, username, posisi, dan departemen harus diisi'
        });
      }

      const employeeData = {
        name,
        username,
        position,
        department,
        email,
        phone,
        role: role || 'employee'
      };

      const affectedRows = await Employee.update(id, employeeData);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Karyawan tidak ditemukan'
        });
      }

      // Update password if provided
      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await Employee.updatePassword(id, hashedPassword);
      }

      res.json({
        success: true,
        message: 'Data karyawan berhasil diperbarui',
        data: { id, ...employeeData }
      });
    } catch (error) {
      console.error('Update Employee Error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Terjadi kesalahan server'
      });
    }
  }

  static async deleteEmployee(req, res) {
    try {
      const { id } = req.params;

      const employees = await Employee.findAll();
      const employee = employees.find(emp => emp.id == id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Karyawan tidak ditemukan'
        });
      }

      if (employee.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus akun admin'
        });
      }

      const affectedRows = await Employee.delete(id);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Karyawan tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Karyawan berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete Employee Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}

module.exports = EmployeeController;