const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');

// Get all worksheets (with pagination and filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, pengujianId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === 'USER') {
      where.userId = req.user.id;
    }
    if (status) where.status = status;
    if (pengujianId) where.pengujianId = parseInt(pengujianId);

    const total = await prisma.worksheet.count({ where });
    const worksheets = await prisma.worksheet.findMany({
      where,
      include: {
        pengujian: {
          include: {
            jenisPengujian: true,
            pengujianItems: {
              include: { parameter: true }
            }
          }
        },
        user: { select: { id: true, fullname: true, email: true } },
        worksheetItems: {
          include: { parameter: true }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: worksheets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching worksheets:', error);
    res.status(500).json({ error: 'Gagal memuat worksheet' });
  }
});

// Update worksheet item (nilai, satuan, keterangan) - HARUS SEBELUM GET /:id
router.put('/item/:id', authenticate, async (req, res) => {
  try {
    const { nilai, satuan, keterangan } = req.body;

    const item = await prisma.worksheetItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { worksheet: true }
    });

    if (!item) {
      return res.status(404).json({ error: 'Worksheet item tidak ditemukan' });
    }

    // Check authorization
    const worksheet = item.worksheet;
    if (worksheet.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    const updated = await prisma.worksheetItem.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(nilai !== undefined && { nilai: nilai ? parseFloat(nilai) : null }),
        ...(satuan !== undefined && { satuan }),
        ...(keterangan !== undefined && { keterangan })
      },
      include: { parameter: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating worksheet item:', error);
    res.status(500).json({ error: 'Gagal mengupdate item' });
  }
});

// Get single worksheet
router.get('/:id', authenticate, async (req, res) => {
  try {
    const worksheet = await prisma.worksheet.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        pengujian: {
          include: {
            jenisPengujian: true,
            pengujianItems: {
              include: { parameter: true }
            }
          }
        },
        user: { select: { id: true, fullname: true, email: true } },
        worksheetItems: {
          include: { parameter: true }
        }
      }
    });

    if (!worksheet) {
      return res.status(404).json({ error: 'Worksheet tidak ditemukan' });
    }

    // Check authorization
    if (req.user.role === 'USER' && worksheet.userId !== req.user.id) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    res.json(worksheet);
  } catch (error) {
    console.error('Error fetching worksheet:', error);
    res.status(500).json({ error: 'Gagal memuat worksheet' });
  }
});

// Create worksheet from pengujian
router.post('/', authenticate, async (req, res) => {
  try {
    const { pengujianId, pegawaiUtama, pegawaiPendamping } = req.body;

    if (!pengujianId) {
      return res.status(400).json({ error: 'pengujianId wajib diisi' });
    }

    // Verify pengujian exists and belongs to user
    const pengujian = await prisma.pengujian.findUnique({
      where: { id: parseInt(pengujianId) },
      include: { pengujianItems: true }
    });

    if (!pengujian) {
      return res.status(404).json({ error: 'Pengujian tidak ditemukan' });
    }

    if (pengujian.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    // Generate nomor worksheet
    const latestWorksheet = await prisma.worksheet.findFirst({
      orderBy: { id: 'desc' }
    });
    const nomorWorksheet = `WS-${Date.now()}`;

    // Create worksheet
    const worksheet = await prisma.worksheet.create({
      data: {
        nomorWorksheet,
        pengujianId: parseInt(pengujianId),
        userId: req.user.id,
        pegawaiUtama: pegawaiUtama ? parseInt(pegawaiUtama) : null,
        pegawaiPendamping: pegawaiPendamping ? parseInt(pegawaiPendamping) : null,
        status: 'DRAFT',
        worksheetItems: {
          create: pengujian.pengujianItems.map(item => ({
            parameterId: item.parameterId,
            satuan: null,
            nilai: null,
            keterangan: ''
          }))
        }
      },
      include: {
        pengujian: {
          include: {
            jenisPengujian: true,
            pengujianItems: {
              include: { parameter: true }
            }
          }
        },
        worksheetItems: {
          include: { parameter: true }
        }
      }
    });

    res.status(201).json(worksheet);
  } catch (error) {
    console.error('Error creating worksheet:', error);
    res.status(500).json({ error: 'Gagal membuat worksheet' });
  }
});

// Update worksheet
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, tanggalMulai, tanggalSelesai, pegawaiUtama, pegawaiPendamping, hasil, catatan, peralatanDigunakan } = req.body;

    const worksheet = await prisma.worksheet.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!worksheet) {
      return res.status(404).json({ error: 'Worksheet tidak ditemukan' });
    }

    if (worksheet.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    const updated = await prisma.worksheet.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(status && { status }),
        ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
        ...(tanggalSelesai && { tanggalSelesai: new Date(tanggalSelesai) }),
        ...(pegawaiUtama && { pegawaiUtama: parseInt(pegawaiUtama) }),
        ...(pegawaiPendamping && { pegawaiPendamping: parseInt(pegawaiPendamping) }),
        ...(hasil !== undefined && { hasil }),
        ...(catatan !== undefined && { catatan }),
        ...(peralatanDigunakan !== undefined && { peralatanDigunakan })
      },
      include: {
        pengujian: {
          include: {
            jenisPengujian: true,
            pengujianItems: {
              include: { parameter: true }
            }
          }
        },
        worksheetItems: {
          include: { parameter: true }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating worksheet:', error);
    res.status(500).json({ error: 'Gagal mengupdate worksheet' });
  }
});

// Delete worksheet
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const worksheet = await prisma.worksheet.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!worksheet) {
      return res.status(404).json({ error: 'Worksheet tidak ditemukan' });
    }

    await prisma.worksheet.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Worksheet berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Worksheet tidak ditemukan' });
    }
    console.error('Error deleting worksheet:', error);
    res.status(500).json({ error: 'Gagal menghapus worksheet' });
  }
});

module.exports = router;
