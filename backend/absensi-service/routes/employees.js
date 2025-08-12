const express = require('express');
const EmployeeController = require('../controllers/employeeController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, EmployeeController.getAllEmployees);
router.get('/:id', authenticateToken, EmployeeController.getEmployeeById);

module.exports = router;