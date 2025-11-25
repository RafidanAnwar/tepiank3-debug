const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Get all orders for user
router.get('/', authenticateToken, orderController.getAllOrders);

// Get all orders (admin only) - SIMPLE VERSION
router.get('/admin/all-orders', authenticateToken, orderController.getAdminAllOrders);

// Get order by ID
router.get('/:id', authenticateToken, orderController.getOrderById);

// Revise order (Admin request revision)
router.post('/:id/revise', authenticateToken, orderController.reviseOrder);

// Update order status
router.patch('/:id/status', authenticateToken, orderController.updateOrderStatus);

// Delete order
router.delete('/:id', authenticateToken, orderController.deleteOrder);

// Upload penawaran (Admin only)
router.post('/:id/upload-penawaran', authenticateToken, orderController.uploadPenawaran);

// Upload surat persetujuan (User)
router.post('/:id/upload-persetujuan', authenticateToken, orderController.uploadPersetujuan);

// Upload invoice (Admin only)
router.post('/:id/upload-invoice', authenticateToken, orderController.uploadInvoice);

// Approve persetujuan (Admin only)
router.post('/:id/approve-persetujuan', authenticateToken, orderController.approvePersetujuan);

// Reject persetujuan (Admin only)
router.post('/:id/reject-persetujuan', authenticateToken, orderController.rejectPersetujuan);

// Upload Bukti Bayar
router.post('/:id/upload-bukti-bayar', authenticateToken, orderController.uploadBuktiBayar);

// Verify Payment (Admin only)
router.post('/:id/verify-payment', authenticateToken, orderController.verifyPayment);

// Reject Payment (Admin only)
router.post('/:id/reject-payment', authenticateToken, orderController.rejectPayment);

module.exports = router;
