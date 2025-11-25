const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);

// Get navbar stats (notifications, etc)
router.get('/navbar-stats', authenticateToken, dashboardController.getNavbarStats);

// Get popular parameters (Admin only)
router.get('/popular-parameters', authenticateToken, requireAdmin, dashboardController.getPopularParameters);

module.exports = router;