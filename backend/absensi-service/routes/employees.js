const express = require('express');
const EmployeeController = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin only routes
router.get('/', authenticateToken, requireAdmin, EmployeeController.getAllEmployees);
router.post('/', authenticateToken, requireAdmin, EmployeeController.createEmployee);
router.put('/:id', authenticateToken, requireAdmin, EmployeeController.updateEmployee);
router.delete('/:id', authenticateToken, requireAdmin, EmployeeController.deleteEmployee);
router.get('/:id', authenticateToken, requireAdmin, EmployeeController.getEmployeeById);

module.exports = router;