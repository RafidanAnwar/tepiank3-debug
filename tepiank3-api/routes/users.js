const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate: authenticateToken, requireAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get current user profile
router.get('/profile', authenticateToken, userController.getProfile);

// Update current user profile
router.put('/profile', authenticateToken, userController.updateProfile);

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);

// Update avatar URL
router.put('/avatar', authenticateToken, userController.updateAvatarUrl);

// Update last login
router.put('/last-login', authenticateToken, userController.updateLastLogin);

// Create new user (Admin only)
router.post('/', authenticateToken, requireAdmin, userController.createUser);

// Update user data (Admin only)
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);

// Update user role (Admin only)
router.put('/:id/role', authenticateToken, requireAdmin, userController.updateUserRole);

// Toggle user active status (Admin only)
router.put('/:id/toggle-status', authenticateToken, requireAdmin, userController.toggleUserStatus);

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;