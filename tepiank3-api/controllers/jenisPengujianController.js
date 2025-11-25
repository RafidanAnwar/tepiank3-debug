const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllJenisPengujian = async (req, res) => {
    try {
        const { clusterId } = req.query;
        const where = clusterId ? { clusterId: parseInt(clusterId) } : {};

        const jenisPengujian = await prisma.jenisPengujian.findMany({
            where,
            include: {
                cluster: true,
                parameters: true
            },
            orderBy: { name: 'asc' }
        });

        res.json(jenisPengujian);
    } catch (error) {
        console.error('Get jenis pengujian error:', error);
        res.status(500).json({ error: 'Failed to fetch jenis pengujian' });
    }
};

exports.getJenisPengujianById = async (req, res) => {
    try {
        const { id } = req.params;
        const jenisPengujian = await prisma.jenisPengujian.findUnique({
            where: { id: parseInt(id) },
            include: {
                cluster: true,
                parameters: true
            }
        });

        if (!jenisPengujian) {
            return res.status(404).json({ error: 'Jenis pengujian not found' });
        }

        res.json(jenisPengujian);
    } catch (error) {
        console.error('Get jenis pengujian error:', error);
        res.status(500).json({ error: 'Failed to fetch jenis pengujian' });
    }
};

exports.createJenisPengujian = async (req, res) => {
    try {
        console.log('Creating jenis pengujian by admin:', req.user.email);
        const { name, description, clusterId } = req.body;

        // Enhanced validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Nama jenis pengujian harus diisi' });
        }

        if (name.trim().length > 100) {
            return res.status(400).json({ error: 'Nama maksimal 100 karakter' });
        }

        if (!clusterId) {
            return res.status(400).json({ error: 'Cluster harus dipilih' });
        }

        if (description && description.length > 500) {
            return res.status(400).json({ error: 'Deskripsi maksimal 500 karakter' });
        }

        // Check if cluster exists
        const cluster = await prisma.cluster.findUnique({
            where: { id: parseInt(clusterId) }
        });

        if (!cluster) {
            return res.status(400).json({ error: 'Cluster tidak ditemukan' });
        }

        const jenisPengujian = await prisma.jenisPengujian.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                clusterId: parseInt(clusterId)
            },
            include: { cluster: true }
        });

        console.log('Jenis pengujian created successfully:', jenisPengujian.id);
        res.status(201).json(jenisPengujian);
    } catch (error) {
        console.error('Create jenis pengujian error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Nama jenis pengujian sudah ada' });
        }
        res.status(500).json({ error: 'Gagal membuat jenis pengujian' });
    }
};

exports.updateJenisPengujian = async (req, res) => {
    try {
        console.log('Updating jenis pengujian by admin:', req.user.email, 'ID:', req.params.id);
        const { id } = req.params;
        const { name, description, clusterId } = req.body;

        const updateData = {};

        // Validate and add name if provided
        if (name !== undefined && name !== null) {
            if (name.trim().length === 0) {
                return res.status(400).json({ error: 'Nama jenis pengujian harus diisi' });
            }
            if (name.trim().length > 100) {
                return res.status(400).json({ error: 'Nama maksimal 100 karakter' });
            }
            updateData.name = name.trim();
        }

        // Validate and add description if provided
        if (description !== undefined) {
            if (description && description.length > 500) {
                return res.status(400).json({ error: 'Deskripsi maksimal 500 karakter' });
            }
            updateData.description = description?.trim() || null;
        }

        // Validate and add clusterId if provided
        if (clusterId !== undefined && clusterId !== null) {
            // Check if cluster exists
            const cluster = await prisma.cluster.findUnique({
                where: { id: parseInt(clusterId) }
            });

            if (!cluster) {
                return res.status(400).json({ error: 'Cluster tidak ditemukan' });
            }
            updateData.clusterId = parseInt(clusterId);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Tidak ada data yang diubah' });
        }

        const jenisPengujian = await prisma.jenisPengujian.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { cluster: true }
        });

        console.log('Jenis pengujian updated successfully:', jenisPengujian.id);
        res.json(jenisPengujian);
    } catch (error) {
        console.error('Update jenis pengujian error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Nama jenis pengujian sudah ada di cluster ini' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Jenis pengujian tidak ditemukan' });
        }
        res.status(500).json({ error: 'Gagal memperbarui jenis pengujian' });
    }
};

exports.deleteJenisPengujian = async (req, res) => {
    try {
        const { id } = req.params;
        const jenisPengujianId = parseInt(id);

        console.log('Deleting jenis pengujian by admin:', req.user.email, 'ID:', id);

        // Check if jenis pengujian exists and has related data
        const jenisPengujian = await prisma.jenisPengujian.findUnique({
            where: { id: jenisPengujianId },
            include: {
                parameters: {
                    include: {
                        orderItems: true
                    }
                }
            }
        });

        if (!jenisPengujian) {
            return res.status(404).json({ error: 'Jenis pengujian tidak ditemukan' });
        }

        // Check if there are any orders using parameters from this jenis pengujian
        const hasOrders = jenisPengujian.parameters.some(p => p.orderItems.length > 0);

        if (hasOrders) {
            return res.status(400).json({
                error: 'Tidak dapat menghapus jenis pengujian yang memiliki parameter yang digunakan dalam pesanan'
            });
        }

        await prisma.jenisPengujian.delete({
            where: { id: jenisPengujianId }
        });

        console.log('Jenis pengujian deleted successfully:', id);
        res.json({ message: 'Jenis pengujian berhasil dihapus' });
    } catch (error) {
        console.error('Delete jenis pengujian error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Jenis pengujian tidak ditemukan' });
        }
        res.status(500).json({ error: 'Gagal menghapus jenis pengujian' });
    }
};
