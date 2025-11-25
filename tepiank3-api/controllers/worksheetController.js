const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllWorksheets = async (req, res) => {
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
                        },
                        orders: true
                    }
                },
                user: { select: { id: true, fullname: true, email: true } },
                worksheetItems: {
                    include: {
                        parameter: {
                            include: {
                                jenisPengujian: {
                                    include: {
                                        cluster: true
                                    }
                                }
                            }
                        }
                    }
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
};

exports.updateWorksheetItem = async (req, res) => {
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
                ...(keterangan !== undefined && { keterangan }),
                ...(req.body.isReady !== undefined && { isReady: req.body.isReady })
            },
            include: { parameter: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating worksheet item:', error);
        res.status(500).json({ error: 'Gagal mengupdate item' });
    }
};

exports.getWorksheetById = async (req, res) => {
    try {
        const worksheet = await prisma.worksheet.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                pengujian: {
                    include: {
                        jenisPengujian: true,
                        pengujianItems: {
                            include: { parameter: true }
                        },
                        orders: true
                    }
                },
                user: { select: { id: true, fullname: true, email: true } },
                worksheetItems: {
                    include: {
                        parameter: {
                            include: {
                                jenisPengujian: {
                                    include: {
                                        cluster: true
                                    }
                                }
                            }
                        }
                    }
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
};

exports.createWorksheet = async (req, res) => {
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
                        },
                        orders: true
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
};

exports.submitWorksheet = async (req, res) => {
    try {
        const {
            pengujianId,
            pegawaiUtama,
            pegawaiPendamping,
            jumlahHari,
            jumlahPersonel,
            catatan,
            bahanHabis,
            peralatanDigunakan
        } = req.body;

        if (!pengujianId) {
            return res.status(400).json({ error: 'pengujianId wajib diisi' });
        }

        // Check if worksheet exists
        let worksheet = await prisma.worksheet.findFirst({
            where: { pengujianId: parseInt(pengujianId) }
        });

        const worksheetData = {
            pengujianId: parseInt(pengujianId),
            userId: req.user.id,
            pegawaiUtama: pegawaiUtama ? parseInt(pegawaiUtama) : null,
            pegawaiPendamping: pegawaiPendamping ? parseInt(pegawaiPendamping) : null,
            status: 'IN_PROGRESS', // Set status to IN_PROGRESS
            catatan: catatan,
            peralatanDigunakan: peralatanDigunakan,
            // Store other fields in catatan or specific fields if schema allows. 
            // Schema has 'catatan', 'peralatanDigunakan'. 
            // 'bahanHabis' and 'jumlahHari/Personel' might need to be appended to notes or stored if fields exist.
            // For now, appending to notes if they don't exist in schema.
            // Schema: catatan, peralatanDigunakan.
            // We'll append extra info to catatan for now.
            catatan: `Catatan: ${catatan || '-'}\nBahan Habis: ${bahanHabis || '-'}\nJumlah Hari: ${jumlahHari || '-'}\nJumlah Personel: ${jumlahPersonel || '-'}`
        };

        if (worksheet) {
            // Update existing
            worksheet = await prisma.worksheet.update({
                where: { id: worksheet.id },
                data: worksheetData
            });
        } else {
            // Create new
            const nomorWorksheet = `WS-${Date.now()}`;

            // Get pengujian items for worksheet items
            const pengujian = await prisma.pengujian.findUnique({
                where: { id: parseInt(pengujianId) },
                include: { pengujianItems: true }
            });

            worksheet = await prisma.worksheet.create({
                data: {
                    ...worksheetData,
                    nomorWorksheet,
                    worksheetItems: {
                        create: pengujian.pengujianItems.map(item => ({
                            parameterId: item.parameterId,
                            satuan: null,
                            nilai: null,
                            keterangan: ''
                        }))
                    }
                }
            });
        }

        // Update Order Status to IN_PROGRESS
        // Find order by pengujianId
        const order = await prisma.order.findFirst({
            where: { pengujianId: parseInt(pengujianId) }
        });

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'IN_PROGRESS' }
            });
        }

        res.json({ message: 'Worksheet submitted successfully', worksheet });
    } catch (error) {
        console.error('Error submitting worksheet:', error);
        res.status(500).json({ error: 'Gagal mensubmit worksheet' });
    }
};

exports.updateWorksheet = async (req, res) => {
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
};

exports.deleteWorksheet = async (req, res) => {
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
};
