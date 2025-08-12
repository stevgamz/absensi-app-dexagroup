const db = require('../config/database');

class Employee {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT id, employee_id, name, username, position, department, email, phone, created_at 
      FROM employees 
      ORDER BY name
    `);
    return rows;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM employees WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findByEmployeeId(employee_id) {
    const [rows] = await db.execute(
      'SELECT id, employee_id, name, username, position, department, email, phone FROM employees WHERE employee_id = ?',
      [employee_id]
    );
    return rows[0];
  }

  static async create(employeeData) {
    const { employee_id, name, username, password, position, department, email, phone } = employeeData;
    const [result] = await db.execute(`
      INSERT INTO employees (employee_id, name, username, password, position, department, email, phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employee_id, name, username, password, position, department, email, phone]);
    
    return result.insertId;
  }
}

module.exports = Employee;