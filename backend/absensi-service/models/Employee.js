const db = require('../config/database');

class Employee {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT id, employee_id, name, username, role, position, department, email, phone, is_active, created_at 
      FROM employees 
      WHERE is_active = TRUE
      ORDER BY name
    `);
    return rows;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM employees WHERE username = ? AND is_active = TRUE',
      [username]
    );
    return rows[0];
  }

  static async findByEmployeeId(employee_id) {
    const [rows] = await db.execute(
      'SELECT id, employee_id, name, username, role, position, department, email, phone FROM employees WHERE employee_id = ? AND is_active = TRUE',
      [employee_id]
    );
    return rows[0];
  }

  static async create(employeeData) {
    const { employee_id, name, username, password, role = 'employee', position, department, email, phone } = employeeData;
    
    // Check if employee_id or username already exists
    const [existing] = await db.execute(
      'SELECT id FROM employees WHERE employee_id = ? OR username = ?',
      [employee_id, username]
    );
    
    if (existing.length > 0) {
      throw new Error('Employee ID atau Username sudah digunakan');
    }
    
    const [result] = await db.execute(`
      INSERT INTO employees (employee_id, name, username, password, role, position, department, email, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employee_id, name, username, password, role, position, department, email, phone]);
    
    return result.insertId;
  }

  static async update(id, employeeData) {
    const { name, username, position, department, email, phone, role } = employeeData;
    
    const [existing] = await db.execute(
      'SELECT id FROM employees WHERE username = ? AND id != ?',
      [username, id]
    );
    
    if (existing.length > 0) {
      throw new Error('Username sudah digunakan oleh karyawan lain');
    }
    
    const [result] = await db.execute(`
      UPDATE employees 
      SET name = ?, username = ?, position = ?, department = ?, email = ?, phone = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `, [name, username, position, department, email, phone, role, id]);
    
    return result.affectedRows;
  }

  static async updatePassword(id, hashedPassword) {
    const [result] = await db.execute(
      'UPDATE employees SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_active = TRUE',
      [hashedPassword, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    // Soft delete
    const [result] = await db.execute(
      'UPDATE employees SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  static async generateEmployeeId() {
    const [rows] = await db.execute(`
      SELECT employee_id FROM employees 
      WHERE employee_id LIKE 'EMP%' 
      ORDER BY employee_id DESC 
      LIMIT 1
    `);
    
    if (rows.length === 0) {
      return 'EMP001';
    }
    
    const lastId = rows[0].employee_id;
    const lastNumber = parseInt(lastId.replace('EMP', ''));
    const newNumber = lastNumber + 1;
    
    return `EMP${newNumber.toString().padStart(3, '0')}`;
  }
}

module.exports = Employee;