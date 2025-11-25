const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const pegawaiController = require('../controllers/pegawaiController');

const router = express.Router();

// Get all pegawai
router.get('/', authenticateToken, pegawaiController.getAllPegawai);

// Get single pegawai
router.get('/:id', authenticateToken, pegawaiController.getPegawaiById);

// Create pegawai (Admin only)
router.post('/', authenticateToken, requireAdmin, pegawaiController.createPegawai);

// Update pegawai (Admin only)
router.put('/:id', authenticateToken, requireAdmin, pegawaiController.updatePegawai);

// Delete pegawai (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, pegawaiController.deletePegawai);

module.exports = router;
