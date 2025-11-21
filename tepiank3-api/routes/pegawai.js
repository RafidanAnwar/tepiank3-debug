const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all pegawai
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { jabatan: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    const [pegawai, total] = await Promise.all([
      prisma.pegawai.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.pegawai.count({ where })
    ]);

    // Jika tidak ada parameter pagination, kembalikan array langsung
    if (!req.query.page && !req.query.limit) {
      res.json(pegawai);
    } else {
      res.json({
        data: pegawai,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    }
  } catch (error) {
    console.error('Get pegawai error:', error);
    res.status(500).json({ error: 'Failed to fetch pegawai' });
  }
});

// Get single pegawai
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pegawai = await prisma.pegawai.findUnique({
      where: { id: parseInt(id) }
    });

    if (!pegawai) {
      return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    }

    res.json(pegawai);
  } catch (error) {
    console.error('Get pegawai detail error:', error);
    res.status(500).json({ error: 'Failed to fetch pegawai' });
  }
});

// Create pegawai (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nama, jabatan, status = 'SIAP' } = req.body;

    // Validation
    if (!nama || !nama.trim()) {
      return res.status(400).json({ error: 'Nama pegawai wajib diisi' });
    }
    if (!jabatan || !jabatan.trim()) {
      return res.status(400).json({ error: 'Jabatan wajib diisi' });
    }
    if (!['SIAP', 'SPT', 'STANDBY', 'CUTI'].includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }

    // Check if nama already exists
    const existing = await prisma.pegawai.findUnique({
      where: { nama: nama.trim() }
    });

    if (existing) {
      return res.status(400).json({ error: 'Nama pegawai sudah terdaftar' });
    }

    const pegawai = await prisma.pegawai.create({
      data: {
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        status: status.toUpperCase()
      }
    });

    res.status(201).json({ data: pegawai });
  } catch (error) {
    console.error('Create pegawai error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Nama pegawai sudah terdaftar' });
    } else {
      res.status(500).json({ error: 'Gagal membuat pegawai baru' });
    }
  }
});

// Update pegawai (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, jabatan, status } = req.body;
    const pegawaiId = parseInt(id);

    // Validation
    if (nama !== undefined && !nama.trim()) {
      return res.status(400).json({ error: 'Nama pegawai tidak boleh kosong' });
    }
    if (jabatan !== undefined && !jabatan.trim()) {
      return res.status(400).json({ error: 'Jabatan tidak boleh kosong' });
    }
    if (status !== undefined && !['SIAP', 'SPT', 'STANDBY', 'CUTI'].includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }

    // Check if pegawai exists
    const pegawai = await prisma.pegawai.findUnique({
      where: { id: pegawaiId }
    });

    if (!pegawai) {
      return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    }

    // Check if new nama is already taken by another pegawai
    if (nama && nama.trim() !== pegawai.nama) {
      const existingNama = await prisma.pegawai.findUnique({
        where: { nama: nama.trim() }
      });

      if (existingNama) {
        return res.status(400).json({ error: 'Nama pegawai sudah digunakan' });
      }
    }

    // Build update data
    const updateData = {};
    if (nama !== undefined) updateData.nama = nama.trim();
    if (jabatan !== undefined) updateData.jabatan = jabatan.trim();
    if (status !== undefined) updateData.status = status.toUpperCase();

    const updated = await prisma.pegawai.update({
      where: { id: pegawaiId },
      data: updateData
    });

    res.json({ data: updated });
  } catch (error) {
    console.error('Update pegawai error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Nama pegawai sudah digunakan' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    } else {
      res.status(500).json({ error: 'Gagal memperbarui pegawai' });
    }
  }
});

// Delete pegawai (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pegawaiId = parseInt(id);

    // Check if pegawai exists
    const pegawai = await prisma.pegawai.findUnique({
      where: { id: pegawaiId }
    });

    if (!pegawai) {
      return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    }

    await prisma.pegawai.delete({
      where: { id: pegawaiId }
    });

    res.json({ message: 'Pegawai berhasil dihapus' });
  } catch (error) {
    console.error('Delete pegawai error:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    } else {
      res.status(500).json({ error: 'Gagal menghapus pegawai' });
    }
  }
});

module.exports = router;
