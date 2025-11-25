const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const worksheetController = require('../controllers/worksheetController');

const router = express.Router();

// Get all worksheets (with pagination and filters)
router.get('/', authenticate, worksheetController.getAllWorksheets);

// Update worksheet item (nilai, satuan, keterangan) - HARUS SEBELUM GET /:id
router.put('/item/:id', authenticate, worksheetController.updateWorksheetItem);

// Get single worksheet
router.get('/:id', authenticate, worksheetController.getWorksheetById);

// Create worksheet from pengujian
router.post('/', authenticate, worksheetController.createWorksheet);

// Submit worksheet (Create/Update and set status to IN_PROGRESS)
router.post('/submit', authenticate, worksheetController.submitWorksheet);

// Update worksheet
router.put('/:id', authenticate, worksheetController.updateWorksheet);

// Delete worksheet
router.delete('/:id', authenticate, authorize(['ADMIN']), worksheetController.deleteWorksheet);

module.exports = router;
