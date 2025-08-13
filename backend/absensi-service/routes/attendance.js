const express = require('express');
const AttendanceController = require('../controllers/attendanceController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Employee routes (accessible by both admin and employee)
router.post('/checkin', authenticateToken, AttendanceController.checkIn);
router.post('/checkout', authenticateToken, AttendanceController.checkOut);
router.get('/today', authenticateToken, AttendanceController.getTodayStatus);
router.get('/history', authenticateToken, AttendanceController.getHistory);

// Admin only routes
router.get('/today-all', authenticateToken, requireAdmin, AttendanceController.getTodayAttendance);
router.get('/all', authenticateToken, requireAdmin, AttendanceController.getAllAttendance);

module.exports = router;