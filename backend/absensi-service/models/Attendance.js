const db = require('../config/database');

class Attendance {
  static async findByEmployeeAndDate(employee_id, date) {
    const [rows] = await db.execute(`
      SELECT * FROM attendance 
      WHERE employee_id = ? AND date = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [employee_id, date]);
    return rows[0];
  }

  static async checkIn(employee_id, notes = '') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Check if already checked in today
    const existing = await this.findByEmployeeAndDate(employee_id, today);
    if (existing && existing.check_in) {
      throw new Error('Sudah melakukan check in hari ini');
    }

    // Determine status based on time (8:00 AM)
    const checkInHour = now.getHours();
    const status = checkInHour > 8 ? 'terlambat' : 'hadir';

    const [result] = await db.execute(`
      INSERT INTO attendance (employee_id, check_in, date, status, notes) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      check_in = VALUES(check_in), 
      status = VALUES(status), 
      notes = VALUES(notes)
    `, [employee_id, now, today, status, notes]);

    return result.insertId || result.affectedRows;
  }

  static async checkOut(employee_id, notes = '') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Check if checked in today
    const existing = await this.findByEmployeeAndDate(employee_id, today);
    if (!existing || !existing.check_in) {
      throw new Error('Belum melakukan check in hari ini');
    }

    if (existing.check_out) {
      throw new Error('Sudah melakukan check out hari ini');
    }

    const [result] = await db.execute(`
      UPDATE attendance 
      SET check_out = ?, notes = CONCAT(IFNULL(notes, ''), IF(notes IS NOT NULL AND notes != '', ' | ', ''), ?) 
      WHERE employee_id = ? AND date = ?
    `, [now, notes, employee_id, today]);

    return result.affectedRows;
  }

  static async getAttendanceHistory(employee_id, limit = 30) {
    const [rows] = await db.execute(`
      SELECT a.*, e.name as employee_name 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.employee_id 
      WHERE a.employee_id = ? 
      ORDER BY a.date DESC 
      LIMIT ?
    `, [employee_id, limit]);
    return rows;
  }

  static async getTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.execute(`
      SELECT a.*, e.name as employee_name 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.employee_id 
      WHERE a.date = ? 
      ORDER BY a.check_in DESC
    `, [today]);
    return rows;
  }
}

module.exports = Attendance;
