const express = require('express');
const { authenticate: authenticateToken, requireAdmin } = require('../middleware/auth');
const peralatanController = require('../controllers/peralatanController');

const router = express.Router();

// Get all peralatan
router.get('/', peralatanController.getAllPeralatan);

// Get peralatan by ID
router.get('/:id', peralatanController.getPeralatanById);

// Create peralatan (Admin only)
router.post('/', authenticateToken, requireAdmin, peralatanController.createPeralatan);

// Update peralatan (Admin only) - Support partial update
router.put('/:id', authenticateToken, requireAdmin, peralatanController.updatePeralatan);

// Delete peralatan (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, peralatanController.deletePeralatan);

module.exports = router;