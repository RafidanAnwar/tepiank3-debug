const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all parameters with search and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      jenisPengujianId, 
      clusterId, 
      search
    } = req.query;

    // Build where clause
    const where = {};
    
    if (jenisPengujianId) {
      where.jenisPengujianId = parseInt(jenisPengujianId);
    }
    
    if (clusterId) {
      where.jenisPengujian = {
        clusterId: parseInt(clusterId)
      };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { satuan: { contains: search, mode: 'insensitive' } },
        { acuan: { contains: search, mode: 'insensitive' } }
      ];
    }

    const parameters = await prisma.parameter.findMany({
      where,
      include: {
        jenisPengujian: {
          include: { cluster: true }
        },
        parameterPeralatans: {
          include: { peralatan: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(parameters);
  } catch (error) {
    console.error('Get parameters error:', error);
    res.status(500).json({ error: 'Failed to fetch parameters' });
  }
});

// Get parameter by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parameter = await prisma.parameter.findUnique({
      where: { id: parseInt(id) },
      include: {
        jenisPengujian: {
          include: { cluster: true }
        },
        parameterPeralatans: {
          include: { peralatan: true }
        }
      }
    });

    if (!parameter) {
      return res.status(404).json({ error: 'Parameter not found' });
    }

    res.json(parameter);
  } catch (error) {
    console.error('Get parameter error:', error);
    res.status(500).json({ error: 'Failed to fetch parameter' });
  }
});

// Create parameter (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Creating parameter by admin:', req.user.email);
    const { name, satuan, acuan, harga, jenisPengujianId } = req.body;

    // Enhanced validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nama parameter harus diisi' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Nama parameter maksimal 100 karakter' });
    }

    if (!harga || isNaN(parseFloat(harga)) || parseFloat(harga) <= 0) {
      return res.status(400).json({ error: 'Harga harus diisi dan lebih dari 0' });
    }

    if (!jenisPengujianId || isNaN(parseInt(jenisPengujianId))) {
      return res.status(400).json({ error: 'Jenis pengujian harus dipilih' });
    }

    if (satuan && satuan.length > 50) {
      return res.status(400).json({ error: 'Satuan maksimal 50 karakter' });
    }

    if (acuan && acuan.length > 200) {
      return res.status(400).json({ error: 'Acuan maksimal 200 karakter' });
    }

    // Check if jenis pengujian exists
    const jenisPengujian = await prisma.jenisPengujian.findUnique({
      where: { id: parseInt(jenisPengujianId) }
    });

    if (!jenisPengujian) {
      return res.status(400).json({ error: 'Jenis pengujian tidak ditemukan' });
    }

    // If peralatan array provided, validate existence and availability first
    if (Array.isArray(req.body.peralatan) && req.body.peralatan.length > 0) {
      const ids = req.body.peralatan.map(i => parseInt(i.peralatanId)).filter(i => !isNaN(i));
      if (ids.length === 0) {
        return res.status(400).json({ error: 'Peralatan tidak valid' });
      }

      const found = await prisma.peralatan.findMany({ where: { id: { in: ids } }, select: { id: true, status: true, name: true } });
      const foundIds = found.map(f => f.id);
      const missing = ids.filter(i => !foundIds.includes(i));
      if (missing.length > 0) {
        return res.status(400).json({ error: `Peralatan dengan id ${missing.join(', ')} tidak ditemukan` });
      }

      // Check availability
      const notAvailable = found.filter(f => f.status !== 'AVAILABLE');
      if (notAvailable.length > 0) {
        const details = notAvailable.map(f => `${f.id}(${f.name}:${f.status})`).join(', ');
        return res.status(400).json({ error: `Beberapa peralatan tidak tersedia: ${details}` });
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const p = await tx.parameter.create({
        data: {
          name: name.trim(),
          satuan: satuan?.trim() || null,
          acuan: acuan?.trim() || null,
          harga: parseFloat(harga),
          jenisPengujianId: parseInt(jenisPengujianId)
        },
        include: {
          jenisPengujian: { include: { cluster: true } }
        }
      });

      // Handle peralatan associations if provided (existence already validated)
      if (Array.isArray(req.body.peralatan) && req.body.peralatan.length > 0) {
        for (const item of req.body.peralatan) {
          const peralatanId = parseInt(item.peralatanId);
          const quantity = parseInt(item.quantity) || 1;
          if (!isNaN(peralatanId) && quantity > 0) {
            await tx.parameterPeralatan.create({
              data: {
                parameterId: p.id,
                peralatanId,
                quantity
              }
            });
          }
        }
      }

      return p;
    });

    console.log('Parameter created successfully:', created.id);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create parameter error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nama parameter sudah ada dalam jenis pengujian ini' });
    }
    res.status(500).json({ error: 'Gagal membuat parameter' });
  }
});

// Update parameter (Admin only) - Support partial update
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Updating parameter by admin:', req.user.email, 'ID:', req.params.id);
    const { id } = req.params;
    const { name, satuan, acuan, harga, jenisPengujianId } = req.body;

    const updateData = {};

    // Validate and add name if provided
    if (name !== undefined && name !== null) {
      if (name.trim().length === 0) {
        return res.status(400).json({ error: 'Nama parameter harus diisi' });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({ error: 'Nama parameter maksimal 100 karakter' });
      }
      updateData.name = name.trim();
    }

    // Validate and add satuan if provided
    if (satuan !== undefined) {
      if (satuan && satuan.length > 50) {
        return res.status(400).json({ error: 'Satuan maksimal 50 karakter' });
      }
      updateData.satuan = satuan?.trim() || null;
    }

    // Validate and add acuan if provided
    if (acuan !== undefined) {
      if (acuan && acuan.length > 200) {
        return res.status(400).json({ error: 'Acuan maksimal 200 karakter' });
      }
      updateData.acuan = acuan?.trim() || null;
    }

    // Validate and add harga if provided
    if (harga !== undefined && harga !== null) {
      if (isNaN(parseFloat(harga)) || parseFloat(harga) <= 0) {
        return res.status(400).json({ error: 'Harga harus lebih dari 0' });
      }
      updateData.harga = parseFloat(harga);
    }

    // Validate and add jenisPengujianId if provided
    if (jenisPengujianId !== undefined && jenisPengujianId !== null) {
      // Check if jenis pengujian exists
      const jenisPengujian = await prisma.jenisPengujian.findUnique({
        where: { id: parseInt(jenisPengujianId) }
      });

      if (!jenisPengujian) {
        return res.status(400).json({ error: 'Jenis pengujian tidak ditemukan' });
      }
      updateData.jenisPengujianId = parseInt(jenisPengujianId);
    }

    // If peralatan array provided on update, validate existence and availability first (this can be updated without changing parameter fields)
    const hasPeralatanUpdate = Array.isArray(req.body.peralatan);
    if (hasPeralatanUpdate) {
      const ids = req.body.peralatan.map(i => parseInt(i.peralatanId)).filter(i => !isNaN(i));
      if (ids.length > 0) {
        const found = await prisma.peralatan.findMany({ where: { id: { in: ids } }, select: { id: true, status: true, name: true } });
        const foundIds = found.map(f => f.id);
        const missing = ids.filter(i => !foundIds.includes(i));
        if (missing.length > 0) {
          return res.status(400).json({ error: `Peralatan dengan id ${missing.join(', ')} tidak ditemukan` });
        }

        const notAvailable = found.filter(f => f.status !== 'AVAILABLE');
        if (notAvailable.length > 0) {
          const details = notAvailable.map(f => `${f.id}(${f.name}:${f.status})`).join(', ');
          return res.status(400).json({ error: `Beberapa peralatan tidak tersedia: ${details}` });
        }
      }
    }

    // Validate that either parameter fields or peralatan are being updated
    if (Object.keys(updateData).length === 0 && !hasPeralatanUpdate) {
      return res.status(400).json({ error: 'Tidak ada data yang diubah' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      let p;
      
      // Only update if there are parameter field changes
      if (Object.keys(updateData).length > 0) {
        p = await tx.parameter.update({
          where: { id: parseInt(id) },
          data: updateData,
          include: { 
            jenisPengujian: { include: { cluster: true } },
            parameterPeralatans: { include: { peralatan: true } }
          }
        });
      } else {
        // If only updating peralatan, just fetch the parameter
        p = await tx.parameter.findUnique({
          where: { id: parseInt(id) },
          include: { 
            jenisPengujian: { include: { cluster: true } },
            parameterPeralatans: { include: { peralatan: true } }
          }
        });
      }

      // If peralatan provided, replace associations
      if (Array.isArray(req.body.peralatan)) {
        // delete existing
        await tx.parameterPeralatan.deleteMany({ where: { parameterId: p.id } });

        for (const item of req.body.peralatan) {
          const peralatanId = parseInt(item.peralatanId);
          const quantity = parseInt(item.quantity) || 1;
          if (!isNaN(peralatanId) && quantity > 0) {
            await tx.parameterPeralatan.create({
              data: {
                parameterId: p.id,
                peralatanId,
                quantity
              }
            });
          }
        }

        // Re-fetch to get updated peralatan list
        p = await tx.parameter.findUnique({
          where: { id: p.id },
          include: { 
            jenisPengujian: { include: { cluster: true } },
            parameterPeralatans: { include: { peralatan: true } }
          }
        });
      }

      return p;
    });

    console.log('Parameter updated successfully:', updated.id);
    res.json(updated);
  } catch (error) {
    console.error('Update parameter error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Nama parameter sudah ada dalam jenis pengujian ini' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Parameter tidak ditemukan' });
    }
    res.status(500).json({ error: 'Gagal memperbarui parameter' });
  }
});

// Delete parameter (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if parameter is used in any orders
    const parameterWithOrders = await prisma.parameter.findUnique({
      where: { id: parseInt(id) },
      include: { orderItems: true }
    });

    if (!parameterWithOrders) {
      return res.status(404).json({ error: 'Parameter not found' });
    }

    if (parameterWithOrders.orderItems.length > 0) {
      return res.status(400).json({ 
        error: 'Tidak dapat menghapus parameter yang sudah digunakan dalam pesanan' 
      });
    }

    console.log('Deleting parameter by admin:', req.user.email, 'ID:', id);
    
    await prisma.parameter.delete({
      where: { id: parseInt(id) }
    });

    console.log('Parameter deleted successfully:', id);
    res.json({ message: 'Parameter berhasil dihapus' });
  } catch (error) {
    console.error('Delete parameter error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Parameter tidak ditemukan' });
    }
    res.status(500).json({ error: 'Gagal menghapus parameter' });
  }
});

// Bulk create parameters (Admin only)
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { parameters } = req.body;

    if (!Array.isArray(parameters) || parameters.length === 0) {
      return res.status(400).json({ error: 'Parameters array is required' });
    }

    // Validate each parameter
    for (const param of parameters) {
      if (!param.name || !param.harga || !param.jenisPengujianId) {
        return res.status(400).json({ 
          error: 'Each parameter must have name, harga, and jenisPengujianId' 
        });
      }
    }

    const createdParameters = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const param of parameters) {
        const created = await tx.parameter.create({
          data: {
            name: param.name.trim(),
            satuan: param.satuan?.trim(),
            acuan: param.acuan?.trim(),
            harga: parseFloat(param.harga),
            jenisPengujianId: parseInt(param.jenisPengujianId)
          },
          include: {
            jenisPengujian: {
              include: { cluster: true }
            }
          }
        });
        results.push(created);
      }
      
      return results;
    });

    res.status(201).json({
      message: `${createdParameters.length} parameters created successfully`,
      data: createdParameters
    });
  } catch (error) {
    console.error('Bulk create parameters error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Duplicate parameter name in jenis pengujian' });
    }
    res.status(500).json({ error: 'Failed to create parameters' });
  }
});

// Bulk update parameter prices (Admin only)
router.put('/bulk-price', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, harga }]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const updatedParameters = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const update of updates) {
        if (!update.id || !update.harga || parseFloat(update.harga) <= 0) {
          throw new Error('Each update must have valid id and harga > 0');
        }
        
        const updated = await tx.parameter.update({
          where: { id: parseInt(update.id) },
          data: { harga: parseFloat(update.harga) },
          include: {
            jenisPengujian: {
              include: { cluster: true }
            }
          }
        });
        results.push(updated);
      }
      
      return results;
    });

    res.json({
      message: `${updatedParameters.length} parameters updated successfully`,
      data: updatedParameters
    });
  } catch (error) {
    console.error('Bulk update parameters error:', error);
    if (error.message.includes('valid id and harga')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update parameters' });
  }
});

// Get parameters by jenis pengujian (optimized for pengujian form)
router.get('/by-jenis/:jenisPengujianId', async (req, res) => {
  try {
    const { jenisPengujianId } = req.params;
    
    const parameters = await prisma.parameter.findMany({
      where: {
        jenisPengujianId: parseInt(jenisPengujianId),
        isActive: true
      },
      select: {
        id: true,
        name: true,
        satuan: true,
        acuan: true,
        harga: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(parameters);
  } catch (error) {
    console.error('Get parameters by jenis error:', error);
    res.status(500).json({ error: 'Failed to fetch parameters' });
  }
});

// Get parameter statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [total, byJenis, priceStats] = await Promise.all([
      prisma.parameter.count({ where: { isActive: true } }),
      prisma.parameter.groupBy({
        by: ['jenisPengujianId'],
        _count: { id: true },
        where: { isActive: true }
      }),
      prisma.parameter.aggregate({
        _avg: { harga: true },
        _min: { harga: true },
        _max: { harga: true },
        where: { isActive: true }
      })
    ]);

    res.json({
      total,
      byJenis: byJenis.length,
      avgPrice: priceStats._avg.harga,
      minPrice: priceStats._min.harga,
      maxPrice: priceStats._max.harga
    });
  } catch (error) {
    console.error('Get parameter stats error:', error);
    res.status(500).json({ error: 'Failed to fetch parameter statistics' });
  }
});

module.exports = router;