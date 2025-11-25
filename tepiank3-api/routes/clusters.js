const express = require('express');
const { authenticate: authenticateToken, requireAdmin } = require('../middleware/auth');
const clusterController = require('../controllers/clusterController');

const router = express.Router();

// Get all clusters
router.get('/', clusterController.getAllClusters);

// Get cluster by ID
router.get('/:id', clusterController.getClusterById);

// Create cluster (Admin only)
router.post('/', authenticateToken, requireAdmin, clusterController.createCluster);

// Update cluster (Admin only) - Support partial update
router.put('/:id', authenticateToken, requireAdmin, clusterController.updateCluster);

// Delete cluster (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, clusterController.deleteCluster);

module.exports = router;
