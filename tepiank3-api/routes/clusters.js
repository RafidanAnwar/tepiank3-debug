const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate: authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all clusters
router.get('/', async (req, res) => {
  try {
    const clusters = await prisma.cluster.findMany({
      where: {
        isActive: true
      },
      include: {
        jenisPengujian: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          include: {
            parameters: {
              where: { isActive: true },
              orderBy: { name: 'asc' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(clusters);
  } catch (error) {
    console.error('Get clusters error:', error);
    res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

// Get cluster by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cluster = await prisma.cluster.findUnique({
      where: { id: parseInt(id) },
      include: {
        jenisPengujian: {
          orderBy: { name: 'asc' },
          include: {
            parameters: {
              orderBy: { name: 'asc' }
            }
          }
        }
      }
    });

    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    res.json(cluster);
  } catch (error) {
    console.error('Get cluster error:', error);
    res.status(500).json({ error: 'Failed to fetch cluster' });
  }
});

// Create cluster (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nama cluster harus diisi' });
    }

    const cluster = await prisma.cluster.create({
      data: { 
        name: name.trim(), 
        description: description?.trim() || null, 
        icon 
      }
    });

    res.status(201).json(cluster);
  } catch (error) {
    console.error('Create cluster error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nama cluster sudah ada' });
    }
    res.status(500).json({ error: 'Gagal membuat cluster' });
  }
});

// Update cluster (Admin only) - Support partial update
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const updateData = {};

    if (name !== undefined && name !== null) {
      if (name.trim().length === 0) {
        return res.status(400).json({ error: 'Nama cluster harus diisi' });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (icon !== undefined) {
      updateData.icon = icon;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diubah' });
    }

    const cluster = await prisma.cluster.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(cluster);
  } catch (error) {
    console.error('Update cluster error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nama cluster sudah ada' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cluster tidak ditemukan' });
    }
    res.status(500).json({ error: 'Gagal memperbarui cluster' });
  }
});

// Delete cluster (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cluster.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Cluster berhasil dihapus' });
  } catch (error) {
    console.error('Delete cluster error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cluster tidak ditemukan' });
    }
    res.status(500).json({ error: 'Gagal menghapus cluster' });
  }
});

module.exports = router;
