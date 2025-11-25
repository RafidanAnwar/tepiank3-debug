const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllPeralatan = async (req, res) => {
    try {
        const peralatan = await prisma.peralatan.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(peralatan);
    } catch (error) {
        console.error('Get peralatan error:', error);
        res.status(500).json({ error: 'Failed to fetch peralatan' });
    }
};

exports.getPeralatanById = async (req, res) => {
    try {
        const { id } = req.params;
        const peralatan = await prisma.peralatan.findUnique({
            where: { id: parseInt(id) }
        });

        if (!peralatan) {
            return res.status(404).json({ error: 'Peralatan not found' });
        }

        res.json(peralatan);
    } catch (error) {
        console.error('Get peralatan error:', error);
        res.status(500).json({ error: 'Failed to fetch peralatan' });
    }
};

exports.createPeralatan = async (req, res) => {
    try {
        const {
            nomorAlat,
            name,
            description,
            status,
            merk,
            tipe,
            nomorSeri,
            kodeBMN,
            nup,
            waktuPengadaan,
            lokasiPenyimpanan,
            tanggalKalibrasi,
            koreksi
        } = req.body;

        const peralatan = await prisma.peralatan.create({
            data: {
                nomorAlat,
                name,
                description,
                status: status || 'AVAILABLE',
                merk,
                tipe,
                nomorSeri,
                kodeBMN,
                nup,
                waktuPengadaan: waktuPengadaan ? new Date(waktuPengadaan) : null,
                lokasiPenyimpanan,
                tanggalKalibrasi: tanggalKalibrasi ? new Date(tanggalKalibrasi) : null,
                koreksi
            }
        });

        res.status(201).json(peralatan);
    } catch (error) {
        console.error('Create peralatan error:', error);
        res.status(500).json({ error: 'Failed to create peralatan' });
    }
};

exports.updatePeralatan = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nomorAlat,
            name,
            description,
            status,
            merk,
            tipe,
            nomorSeri,
            kodeBMN,
            nup,
            waktuPengadaan,
            lokasiPenyimpanan,
            tanggalKalibrasi,
            koreksi
        } = req.body;

        const updateData = {};

        // Validate and add fields if provided
        if (nomorAlat !== undefined) {
            updateData.nomorAlat = nomorAlat?.trim() || null;
        }

        if (name !== undefined && name !== null) {
            if (name.trim().length === 0) {
                return res.status(400).json({ error: 'Nama peralatan harus diisi' });
            }
            updateData.name = name.trim();
        }

        if (description !== undefined) {
            updateData.description = description?.trim() || null;
        }

        if (status !== undefined && status !== null) {
            const validStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Status tidak valid' });
            }
            updateData.status = status;
        }

        if (merk !== undefined) {
            updateData.merk = merk?.trim() || null;
        }

        if (tipe !== undefined) {
            updateData.tipe = tipe?.trim() || null;
        }

        if (nomorSeri !== undefined) {
            updateData.nomorSeri = nomorSeri?.trim() || null;
        }

        if (kodeBMN !== undefined) {
            updateData.kodeBMN = kodeBMN?.trim() || null;
        }

        if (nup !== undefined) {
            updateData.nup = nup?.trim() || null;
        }

        if (waktuPengadaan !== undefined) {
            updateData.waktuPengadaan = waktuPengadaan ? new Date(waktuPengadaan) : null;
        }

        if (lokasiPenyimpanan !== undefined) {
            updateData.lokasiPenyimpanan = lokasiPenyimpanan?.trim() || null;
        }

        if (tanggalKalibrasi !== undefined) {
            updateData.tanggalKalibrasi = tanggalKalibrasi ? new Date(tanggalKalibrasi) : null;
        }

        if (koreksi !== undefined) {
            updateData.koreksi = koreksi?.trim() || null;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Tidak ada data yang diubah' });
        }

        const peralatan = await prisma.peralatan.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json(peralatan);
    } catch (error) {
        console.error('Update peralatan error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Nama peralatan sudah ada' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Peralatan tidak ditemukan' });
        }
        res.status(500).json({ error: 'Gagal memperbarui peralatan' });
    }
};

exports.deletePeralatan = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.peralatan.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Peralatan deleted successfully' });
    } catch (error) {
        console.error('Delete peralatan error:', error);
        res.status(500).json({ error: 'Failed to delete peralatan' });
    }
};
