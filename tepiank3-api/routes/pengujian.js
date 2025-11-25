const express = require('express');
const { authenticate: authenticateToken } = require('../middleware/auth');
const pengujianController = require('../controllers/pengujianController');

const router = express.Router();

// Get all pengujian for user
router.get('/', authenticateToken, pengujianController.getAllPengujian);

// Get all pengajuan (admin only) - MUST BE BEFORE /:id
router.get('/admin/all-pengajuan', authenticateToken, pengujianController.getAdminAllPengajuan);

// Get users for admin (to select client)
router.get('/admin/users', authenticateToken, pengujianController.getAdminUsers);

// Get pengujian by ID
router.get('/:id', authenticateToken, pengujianController.getPengujianById);

// Create new pengujian and order
router.post('/', authenticateToken, pengujianController.createPengujian);

// Update pengujian status
router.patch('/:id/status', authenticateToken, pengujianController.updatePengujianStatus);

// Update pengujian results (admin only)
router.patch('/:id/results', authenticateToken, pengujianController.updatePengujianResults);

// Delete pengujian
router.delete('/:id', authenticateToken, pengujianController.deletePengujian);

module.exports = router;
