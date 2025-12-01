const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const worksheetController = require('../controllers/worksheetController');

const router = express.Router();

// Get all worksheets
router.get('/', authenticateToken, worksheetController.getAllWorksheets);

// Export worksheet
router.get('/:id/export', authenticateToken, worksheetController.exportWorksheet);

// Get worksheet by ID
router.get('/:id', authenticateToken, worksheetController.getWorksheetById);

// Create new worksheet (Admin only)
router.post('/', authenticateToken, requireAdmin, worksheetController.createWorksheet);

// Submit worksheet (User/Admin)
router.post('/submit', authenticateToken, worksheetController.submitWorksheet);

// Update worksheet item
router.put('/item/:id', authenticateToken, worksheetController.updateWorksheetItem);

// Update worksheet details
router.put('/:id', authenticateToken, worksheetController.updateWorksheet);

// Delete worksheet (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, worksheetController.deleteWorksheet);

module.exports = router;
