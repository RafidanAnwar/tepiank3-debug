const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const pengujianController = require('../controllers/pengujianController');

const router = express.Router();

// Get all pengujian for user
router.get('/', authenticateToken, pengujianController.getAllPengujian);

// Get all pengajuan (Admin only)
router.get('/admin/all-pengajuan', authenticateToken, requireAdmin, pengujianController.getAdminAllPengajuan);

// Get users for admin selection
router.get('/admin/users', authenticateToken, requireAdmin, pengujianController.getAdminUsers);

// Get pengujian by ID
router.get('/:id', authenticateToken, pengujianController.getPengujianById);

// Create new pengujian
router.post('/', authenticateToken, pengujianController.createPengujian);

// Update pengujian status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, pengujianController.updatePengujianStatus);

// Update pengujian results (Admin only)
router.put('/:id/results', authenticateToken, requireAdmin, pengujianController.updatePengujianResults);

// Delete pengujian (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, pengujianController.deletePengujian);

module.exports = router;
