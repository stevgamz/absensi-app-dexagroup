const db = require('../config/database');
const fs = require('fs');
const path = require('path');

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

  static async checkIn(employee_id, notes = '', photoBase64 = '', location = '') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const existing = await this.findByEmployeeAndDate(employee_id, today);
    if (existing && existing.check_in) {
      throw new Error('Sudah melakukan check in hari ini');
    }

    // Determine status based on time (8:00 AM)
    const checkInHour = now.getHours();
    const status = checkInHour > 8 ? 'terlambat' : 'hadir';

    let photoPath = null;
    if (photoBase64) {
      try {
        photoPath = await this.savePhoto(employee_id, photoBase64, 'checkin');
      } catch (error) {
        console.error('Error saving photo:', error);
      }
    }

    const [result] = await db.execute(`
      INSERT INTO attendance (employee_id, check_in, date, status, notes, check_in_photo, location) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        check_in = VALUES(check_in), 
        status = VALUES(status), 
        notes = VALUES(notes),
        check_in_photo = VALUES(check_in_photo),
        location = VALUES(location)
    `, [employee_id, now, today, status, notes, photoPath, location]);

    return result.insertId || result.affectedRows;
  }

  static async checkOut(employee_id, notes = '', photoBase64 = '', location = '') {
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

    // Save photo if provided
    let photoPath = null;
    if (photoBase64) {
      try {
        photoPath = await this.savePhoto(employee_id, photoBase64, 'checkout');
      } catch (error) {
        console.error('Error saving photo:', error);
      }
    }

    const [result] = await db.execute(`
      UPDATE attendance 
      SET 
        check_out = ?, 
        notes = CONCAT(IFNULL(notes, ''), IF(notes IS NOT NULL AND notes != '', ' | ', ''), ?), 
        check_out_photo = ?, 
        location = CONCAT(IFNULL(location, ''), IF(location IS NOT NULL AND location != '', ' | ', ''), ?)
      WHERE employee_id = ? AND date = ?
    `, [now, notes, photoPath, location, employee_id, today]);

    return result.affectedRows;
  }

  static async savePhoto(employee_id, base64Data, type) {
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${employee_id}_${type}_${timestamp}.jpg`;
    const uploadsDir = path.join(__dirname, '../uploads/photos');
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, base64Image, 'base64');
    
    return `/uploads/photos/${filename}`;
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

  static async getAllAttendance(startDate, endDate, limit = 100) {
    let query = `
      SELECT a.*, e.name as employee_name, e.department 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.employee_id
    `;
    let params = [];
    
    if (startDate && endDate) {
      query += ' WHERE a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' WHERE a.date >= ?';
      params.push(startDate);
    }
    
    query += ' ORDER BY a.date DESC, a.check_in DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = Attendance;
