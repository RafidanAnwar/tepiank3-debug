const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const parameterController = require('../controllers/parameterController');

const router = express.Router();

// Get all parameters with search and pagination
router.get('/', parameterController.getAllParameters);

// Get parameter by ID
router.get('/:id', parameterController.getParameterById);

// Create parameter (Admin only)
router.post('/', authenticateToken, requireAdmin, parameterController.createParameter);

// Update parameter (Admin only) - Support partial update
router.put('/:id', authenticateToken, requireAdmin, parameterController.updateParameter);

// Delete parameter (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, parameterController.deleteParameter);

// Bulk create parameters (Admin only)
router.post('/bulk', authenticateToken, requireAdmin, parameterController.bulkCreateParameters);

// Bulk update parameter prices (Admin only)
router.put('/bulk-price', authenticateToken, requireAdmin, parameterController.bulkUpdatePrices);

// Get parameters by jenis pengujian (optimized for pengujian form)
router.get('/by-jenis/:jenisPengujianId', parameterController.getParametersByJenis);

// Get parameter statistics
router.get('/stats/overview', authenticateToken, requireAdmin, parameterController.getParameterStats);

module.exports = router;