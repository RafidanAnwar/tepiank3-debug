const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticate: authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

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
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstname: true,
        fullname: true,
        phone: true,
        address: true,
        avatar: true,
        company: true,
        position: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Convert avatar path to URL if exists
    if (user && user.avatar) {
      user.avatar = `/uploads/avatars/${path.basename(user.avatar)}`;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstname, fullname, phone, address, company, position } = req.body;

    // Validation
    if (firstname && firstname.trim().length === 0) {
      return res.status(400).json({ error: 'First name cannot be empty' });
    }
    if (fullname && fullname.trim().length === 0) {
      return res.status(400).json({ error: 'Full name cannot be empty' });
    }
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const updateData = {};
    if (firstname !== undefined) updateData.firstname = firstname.trim();
    if (fullname !== undefined) updateData.fullname = fullname.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (company !== undefined) updateData.company = company ? company.trim() : null;
    if (position !== undefined) updateData.position = position ? position.trim() : null;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstname: true,
        fullname: true,
        phone: true,
        address: true,
        avatar: true,
        company: true,
        position: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Admin user accessing users list:', req.user.email);
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { firstname: { contains: search, mode: 'insensitive' } },
        { fullname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstname: true,
          fullname: true,
          phone: true,
          company: true,
          position: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    // Jika tidak ada parameter pagination, kembalikan array langsung
    if (!req.query.page && !req.query.limit) {
      res.json(users);
    } else {
      res.json({
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    }
  } catch (error) {
    console.error('Get users error:', error);
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Database constraint violation' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch users',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get current user to delete old avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true }
    });

    // Delete old avatar file if exists
    if (currentUser.avatar) {
      const oldAvatarPath = path.join('uploads/avatars', path.basename(currentUser.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar path
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar: req.file.path,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: `/uploads/avatars/${path.basename(req.file.path)}`
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Update avatar URL
router.put('/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar },
      select: {
        id: true,
        email: true,
        firstname: true,
        fullname: true,
        avatar: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Update last login
router.put('/last-login', authenticateToken, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastLogin: new Date() }
    });

    res.json({ message: 'Last login updated' });
  } catch (error) {
    console.error('Update last login error:', error);
    res.status(500).json({ error: 'Failed to update last login' });
  }
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, firstname, fullname, password, role = 'USER', phone, address, company, position } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email adalah wajib' });
    }
    if (!fullname || !fullname.trim()) {
      return res.status(400).json({ error: 'Nama lengkap adalah wajib' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Password adalah wajib' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        firstname: firstname ? firstname.trim() : fullname.split(' ')[0].trim(),
        fullname: fullname.trim(),
        password: hashedPassword,
        role,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        company: company ? company.trim() : null,
        position: position ? position.trim() : null,
        isActive: true,
        createdAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        fullname: true,
        phone: true,
        address: true,
        company: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({ data: user });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email sudah terdaftar' });
    } else {
      res.status(500).json({ error: 'Gagal membuat user baru' });
    }
  }
});

// Update user data (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { email, firstname, fullname, phone, address, company, position, role } = req.body;

    // Validation
    if (email && !email.trim()) {
      return res.status(400).json({ error: 'Email tidak boleh kosong' });
    }
    if (fullname && !fullname.trim()) {
      return res.status(400).json({ error: 'Nama lengkap tidak boleh kosong' });
    }
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Format nomor telepon tidak valid' });
    }
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Check if email is already taken by another user
    if (email && email.toLowerCase().trim() !== userExists.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email sudah digunakan oleh user lain' });
      }
    }

    // Build update data
    const updateData = {};
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (firstname !== undefined) updateData.firstname = firstname ? firstname.trim() : null;
    if (fullname !== undefined) updateData.fullname = fullname ? fullname.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (company !== undefined) updateData.company = company ? company.trim() : null;
    if (position !== undefined) updateData.position = position ? position.trim() : null;
    if (role !== undefined) updateData.role = role;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstname: true,
        fullname: true,
        phone: true,
        address: true,
        company: true,
        position: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email sudah digunakan oleh user lain' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'User tidak ditemukan' });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui user' });
    }
  }
});

// Update user role (Admin only)
router.put('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        email: true,
        firstname: true,
        fullname: true,
        phone: true,
        company: true,
        position: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Toggle user active status (Admin only)
router.put('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { isActive: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !currentUser.isActive },
      select: {
        id: true,
        email: true,
        firstname: true,
        fullname: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullname: true, role: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    // Check if user has orders
    const orderCount = await prisma.order.count({
      where: { userId: userId }
    });
    
    if (orderCount > 0) {
      return res.status(400).json({ 
        error: 'Tidak dapat menghapus user yang memiliki riwayat pesanan' 
      });
    }
    
    console.log('Deleting user by admin:', req.user.email, 'Target:', user.email);
    
    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });
    
    console.log('User deleted successfully:', user.email);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
});

module.exports = router;