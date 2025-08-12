const express = require('express');
const AttendanceController = require('../controllers/attendanceController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/checkin', authenticateToken, AttendanceController.checkIn);
router.post('/checkout', authenticateToken, AttendanceController.checkOut);
router.get('/today', authenticateToken, AttendanceController.getTodayStatus);
router.get('/history', authenticateToken, AttendanceController.getHistory);
router.get('/today-all', authenticateToken, AttendanceController.getTodayAttendance);

module.exports = router;