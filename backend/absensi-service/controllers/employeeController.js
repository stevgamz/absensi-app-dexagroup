const Employee = require('../models/Employee');

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
}

module.exports = EmployeeController;