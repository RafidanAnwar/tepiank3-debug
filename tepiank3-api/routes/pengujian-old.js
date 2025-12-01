const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate nomor pengujian
const generateNomorPengujian = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PGJ-${year}${month}${day}-${random}`;
};

// Get all pengujian for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pengujian = await prisma.pengujian.findMany({
      where: { userId: req.user.id },
      include: {
        jenisPengujian: {
          include: { cluster: true }
        },
        pengujianItems: {
          include: { parameter: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pengujian);
  } catch (error) {
    console.error('Get pengujian error:', error);
    res.status(500).json({ error: 'Failed to fetch pengujian' });
  }
});

// Get pengujian by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pengujian = await prisma.pengujian.findUnique({
      where: { id: parseInt(id) },
      include: {
        jenisPengujian: {
          include: { cluster: true }
        },
        pengujianItems: {
          include: { parameter: true }
        },
        user: {
          select: { id: true, firstname: true, email: true }
        }
      }
    });

    if (!pengujian) {
      return res.status(404).json({ error: 'Pengujian not found' });
    }

    res.json(pengujian);
  } catch (error) {
    console.error('Get pengujian error:', error);
    res.status(500).json({ error: 'Failed to fetch pengujian' });
  }
});

// Create new pengujian and order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      jenisPengujianId, 
      items, 
      tanggalPengujian, 
      lokasi, 
      catatan,
      company,
      address,
      contactPerson,
      phone,
      clientUserId
    } = req.body;

    // Admin can create for any user, regular user only for themselves
    const targetUserId = req.user.role === 'ADMIN' && clientUserId ? 
      parseInt(clientUserId) : req.user.id;

    // Calculate total amount
    let totalAmount = 0;
    const pengujianItems = [];
    const orderItems = [];

    for (const item of items) {
      const parameter = await prisma.parameter.findUnique({
        where: { id: item.parameterId }
      });
      
      if (!parameter) {
        return res.status(400).json({ error: `Parameter with ID ${item.parameterId} not found` });
      }

      const subtotal = parameter.harga * (item.quantity || 1);
      totalAmount += subtotal;

      pengujianItems.push({
        parameterId: item.parameterId,
        quantity: item.quantity || 1,
        price: parameter.harga,
        subtotal: subtotal
      });

      orderItems.push({
        parameterId: item.parameterId,
        quantity: item.quantity || 1,
        price: parameter.harga,
        subtotal: subtotal
      });
    }

    // Create pengujian and order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create pengujian
      const pengujian = await tx.pengujian.create({
        data: {
          nomorPengujian: generateNomorPengujian(),
          userId: targetUserId,
          jenisPengujianId: parseInt(jenisPengujianId),
          totalAmount: totalAmount,
          tanggalPengujian: tanggalPengujian ? new Date(tanggalPengujian) : null,
          lokasi,
          catatan,
          pengujianItems: {
            create: pengujianItems
          }
        }
      });

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          userId: targetUserId,
          pengujianId: pengujian.id,
          totalAmount: totalAmount,
          company,
          address,
          contactPerson,
          phone,
          orderItems: {
            create: orderItems
          }
        }
      });

      return { pengujian, order };
    });

    // Get complete data
    const pengujian = await prisma.pengujian.findUnique({
      where: { id: result.pengujian.id },
      include: {
        jenisPengujian: true,
        pengujianItems: {
          include: { parameter: true }
        },
        orders: true
      }
    });

    res.status(201).json(pengujian);
  } catch (error) {
    console.error('Create pengujian error:', error);
    res.status(500).json({ error: 'Failed to create pengujian' });
  }
});

// Update pengujian status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pengujian = await prisma.pengujian.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        jenisPengujian: true,
        pengujianItems: {
          include: { parameter: true }
        }
      }
    });

    res.json(pengujian);
  } catch (error) {
    console.error('Update pengujian status error:', error);
    res.status(500).json({ error: 'Failed to update pengujian status' });
  }
});

// Update pengujian results (admin only)
router.patch('/:id/results', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { results } = req.body; // Array of { itemId, hasil, keterangan }

    // Update each pengujian item with results
    for (const result of results) {
      await prisma.pengujianItem.update({
        where: { id: result.itemId },
        data: {
          hasil: result.hasil,
          keterangan: result.keterangan
        }
      });
    }

    const pengujian = await prisma.pengujian.findUnique({
      where: { id: parseInt(id) },
      include: {
        jenisPengujian: true,
        pengujianItems: {
          include: { parameter: true }
        }
      }
    });

    res.json(pengujian);
  } catch (error) {
    console.error('Update pengujian results error:', error);
    res.status(500).json({ error: 'Failed to update pengujian results' });
  }
});

// Delete pengujian
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.pengujian.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Pengujian deleted successfully' });
  } catch (error) {
    console.error('Delete pengujian error:', error);
    res.status(500).json({ error: 'Failed to delete pengujian' });
  }
});

// Get users for admin (to select client)
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstname: true,
        fullname: true,
        email: true,
        company: true,
        phone: true
      },
      orderBy: { firstname: 'asc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;