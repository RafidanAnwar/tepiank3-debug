const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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

exports.getAllPengujian = async (req, res) => {
    try {
        const pengujian = await prisma.pengujian.findMany({
            where: { userId: req.user.id },
            include: {
                jenisPengujian: true,
                pengujianItems: true,
                orders: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pengujian);
    } catch (error) {
        console.error('Get pengujian error:', error);
        res.status(500).json({ error: 'Failed to fetch pengujian' });
    }
};

exports.getAdminAllPengajuan = async (req, res) => {
    try {
        console.log('Admin all-pengajuan endpoint called, user role:', req.user?.role);

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const pengajuan = await prisma.pengujian.findMany({
            include: {
                user: true,
                jenisPengujian: true,
                orders: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('Found pengajuan count:', pengajuan.length);
        res.json(pengajuan);
    } catch (error) {
        console.error('Get all pengajuan error:', error);
        res.status(500).json({ error: 'Failed to fetch pengajuan' });
    }
};

exports.getAdminUsers = async (req, res) => {
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
};

exports.getPengujianById = async (req, res) => {
    try {
        const { id } = req.params;
        const pengujian = await prisma.pengujian.findUnique({
            where: { id: parseInt(id) },
            include: {
                jenisPengujian: true,
                pengujianItems: true,
                user: true,
                orders: true
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
};

exports.createPengujian = async (req, res) => {
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
            clientUserId,
            logo // Base64 string
        } = req.body;

        // Admin can create for any user, regular user only for themselves
        const targetUserId = req.user.role === 'ADMIN' && clientUserId ?
            parseInt(clientUserId) : req.user.id;

        // Handle Logo Upload if provided
        let companyLogoPath = null;
        if (logo) {
            try {
                // Remove header if present (e.g., "data:image/png;base64,")
                const base64Data = logo.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');

                const fileName = `company-logo-${targetUserId}-${Date.now()}.png`;
                const uploadDir = path.join(__dirname, '../uploads/avatars');

                // Ensure directory exists
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const filePath = path.join(uploadDir, fileName);

                fs.writeFileSync(filePath, buffer);
                companyLogoPath = `/uploads/avatars/${fileName}`;

            } catch (uploadError) {
                console.error('Error uploading logo:', uploadError);
                // Continue even if logo upload fails
            }
        }

        // Calculate total amount
        let totalAmount = 0;
        const pengujianItems = [];
        const orderItems = [];

        if (items && items.length > 0) {
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
                    pengujianItems: pengujianItems.length > 0 ? {
                        create: pengujianItems
                    } : undefined
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
                    companyLogo: companyLogoPath,
                    address,
                    contactPerson,
                    phone,
                    orderItems: orderItems.length > 0 ? {
                        create: orderItems
                    } : undefined
                }
            });

            return { pengujian, order };
        });

        // Get complete data
        const pengujian = await prisma.pengujian.findUnique({
            where: { id: result.pengujian.id },
            include: {
                jenisPengujian: true,
                pengujianItems: true,
                orders: true
            }
        });

        res.status(201).json({
            pengujian,
            order: result.order
        });
    } catch (error) {
        console.error('Create pengujian error:', error);
        res.status(500).json({ error: 'Failed to create pengujian' });
    }
};

exports.updatePengujianStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const pengujian = await prisma.pengujian.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                jenisPengujian: true,
                pengujianItems: true
            }
        });

        res.json(pengujian);
    } catch (error) {
        console.error('Update pengujian status error:', error);
        res.status(500).json({ error: 'Failed to update pengujian status' });
    }
};

exports.updatePengujianResults = async (req, res) => {
    try {
        const { id } = req.params;
        const { results } = req.body;

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
                pengujianItems: true
            }
        });

        res.json(pengujian);
    } catch (error) {
        console.error('Update pengujian results error:', error);
        res.status(500).json({ error: 'Failed to update pengujian results' });
    }
};

exports.deletePengujian = async (req, res) => {
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
};
