const express = require('express');
const { authRateLimit } = require('../middleware/security');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', authRateLimit, authController.register);

// Login
router.post('/login', authRateLimit, authController.login);

// Request password reset
router.post('/forgot-password', authRateLimit, authController.forgotPassword);

// Reset password with token
router.post('/reset-password', authRateLimit, authController.resetPassword);

// Change password (authenticated user)
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
