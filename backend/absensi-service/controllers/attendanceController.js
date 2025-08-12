const Attendance = require('../models/Attendance');

class AttendanceController {
  static async checkIn(req, res) {
    try {
      const { employee_id } = req.employee;
      const { notes } = req.body;

      await Attendance.checkIn(employee_id, notes || '');

      res.json({
        success: true,
        message: 'Check in berhasil',
        data: {
          employee_id,
          timestamp: new Date(),
          type: 'check_in'
        }
      });
    } catch (error) {
      console.error('Check In Error:', error);
      
      if (error.message.includes('Sudah melakukan')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async checkOut(req, res) {
    try {
      const { employee_id } = req.employee;
      const { notes } = req.body;

      await Attendance.checkOut(employee_id, notes || '');

      res.json({
        success: true,
        message: 'Check out berhasil',
        data: {
          employee_id,
          timestamp: new Date(),
          type: 'check_out'
        }
      });
    } catch (error) {
      console.error('Check Out Error:', error);
      
      if (error.message.includes('Belum melakukan') || error.message.includes('Sudah melakukan')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async getTodayStatus(req, res) {
    try {
      const { employee_id } = req.employee;
      const today = new Date().toISOString().split('T')[0];
      
      const attendance = await Attendance.findByEmployeeAndDate(employee_id, today);

      res.json({
        success: true,
        data: {
          attendance: attendance || null,
          can_check_in: !attendance || !attendance.check_in,
          can_check_out: attendance && attendance.check_in && !attendance.check_out
        }
      });
    } catch (error) {
      console.error('Get Today Status Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async getHistory(req, res) {
    try {
      const { employee_id } = req.employee;
      const limit = parseInt(req.query.limit) || 30;

      const history = await Attendance.getAttendanceHistory(employee_id, limit);

      res.json({
        success: true,
        message: 'Riwayat absensi berhasil diambil',
        data: history
      });
    } catch (error) {
      console.error('Get History Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async getTodayAttendance(req, res) {
    try {
      const attendance = await Attendance.getTodayAttendance();

      res.json({
        success: true,
        message: 'Data absensi hari ini berhasil diambil',
        data: attendance
      });
    } catch (error) {
      console.error('Get Today Attendance Error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}

module.exports = AttendanceController;