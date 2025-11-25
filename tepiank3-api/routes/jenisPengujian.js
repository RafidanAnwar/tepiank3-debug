const express = require('express');
const { authenticate: authenticateToken, requireAdmin } = require('../middleware/auth');
const jenisPengujianController = require('../controllers/jenisPengujianController');

const router = express.Router();

// Get all jenis pengujian
router.get('/', jenisPengujianController.getAllJenisPengujian);

// Get jenis pengujian by ID
router.get('/:id', jenisPengujianController.getJenisPengujianById);

// Create jenis pengujian (Admin only)
router.post('/', authenticateToken, requireAdmin, jenisPengujianController.createJenisPengujian);

// Update jenis pengujian (Admin only) - Support partial update
router.put('/:id', authenticateToken, requireAdmin, jenisPengujianController.updateJenisPengujian);

// Delete jenis pengujian (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, jenisPengujianController.deleteJenisPengujian);

module.exports = router;
