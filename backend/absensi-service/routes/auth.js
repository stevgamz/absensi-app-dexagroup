const express = require('express');
const AuthController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/profile', authenticateToken, AuthController.profile);

module.exports = router;