const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

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
                                },
                                parameterPeralatans: {
                                    include: {
                                        peralatan: true
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
                                },
                                parameterPeralatans: {
                                    include: {
                                        peralatan: true
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

        // Get ALL pengujians for this order to include all items
        const allPengujians = await prisma.pengujian.findMany({
            where: { orderId: pengujian.orderId },
            include: { pengujianItems: true }
        });

        // Flatten items from all pengujians
        const allPengujianItems = allPengujians.flatMap(p => p.pengujianItems);

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
                    create: allPengujianItems.map(item => ({
                        parameterId: item.parameterId,
                        location: item.location,
                        quantity: item.quantity,
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
                    include: {
                        parameter: {
                            include: {
                                jenisPengujian: {
                                    include: {
                                        cluster: true
                                    }
                                },
                                parameterPeralatans: {
                                    include: {
                                        peralatan: true
                                    }
                                }
                            }
                        }
                    }
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
            peralatanDigunakan,
            status // Allow status override
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
            status: status || 'IN_PROGRESS', // Use provided status or default to IN_PROGRESS
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

            // Get pengujian to find orderId
            const primaryPengujian = await prisma.pengujian.findUnique({
                where: { id: parseInt(pengujianId) }
            });

            // Get ALL pengujians for this order
            const allPengujians = await prisma.pengujian.findMany({
                where: { orderId: primaryPengujian.orderId },
                include: { pengujianItems: true }
            });

            const allPengujianItems = allPengujians.flatMap(p => p.pengujianItems);

            worksheet = await prisma.worksheet.create({
                data: {
                    ...worksheetData,
                    nomorWorksheet,
                    worksheetItems: {
                        create: allPengujianItems.map(item => ({
                            parameterId: item.parameterId,
                            location: item.location,
                            quantity: item.quantity,
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
                    include: {
                        parameter: {
                            include: {
                                jenisPengujian: {
                                    include: {
                                        cluster: true
                                    }
                                },
                                parameterPeralatans: {
                                    include: {
                                        peralatan: true
                                    }
                                }
                            }
                        }
                    }
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

exports.exportWorksheet = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Exporting worksheet ${id}`);

        const worksheet = await prisma.worksheet.findUnique({
            where: { id: parseInt(id) },
            include: {
                pengujian: {
                    include: {
                        orders: true
                    }
                },
                worksheetItems: {
                    include: {
                        parameter: {
                            include: {
                                jenisPengujian: {
                                    include: {
                                        cluster: true
                                    }
                                },
                                parameterPeralatans: {
                                    include: {
                                        peralatan: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!worksheet) {
            return res.status(404).json({ error: 'Worksheet not found' });
        }

        // Parse details from catatan
        let jumlahHari = '-';
        let jumlahPersonel = '-';
        if (worksheet.catatan) {
            const hariMatch = worksheet.catatan.match(/Jumlah Hari: (.*?)(\n|$)/);
            if (hariMatch) jumlahHari = hariMatch[1].trim();

            const personelMatch = worksheet.catatan.match(/Jumlah Personel: (.*?)(\n|$)/);
            if (personelMatch) jumlahPersonel = personelMatch[1].trim();
        }

        // Get Company Details
        const order = worksheet.pengujian.orders?.[0];
        const companyName = order?.company || worksheet.pengujian.namaPerusahaan || '-';
        const companyAddress = order?.address || worksheet.pengujian.alamatPerusahaan || '-';

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Worksheet');

        // Set column widths manually
        sheet.getColumn('A').width = 15; // Location
        sheet.getColumn('B').width = 20; // Cluster
        sheet.getColumn('C').width = 25; // Jenis Pengujian
        sheet.getColumn('D').width = 30; // Parameter
        sheet.getColumn('E').width = 10; // Jumlah Param
        sheet.getColumn('F').width = 20; // Acuan
        sheet.getColumn('G').width = 30; // Peralatan
        sheet.getColumn('H').width = 10; // Jumlah Alat
        sheet.getColumn('I').width = 30; // Catatan (Global)
        sheet.getColumn('J').width = 30; // Bahan Habis (Global)
        sheet.getColumn('K').width = 30; // Ketersediaan Alat (Global)

        // --- Header Section ---
        // Title
        sheet.mergeCells('A1:K1'); // Merge across all columns
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'WORKSHEET PENGUJIAN';
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Logo Logic (Right Side: E2:I7)
        let logoPath = 'd:\\project\\k3-debug\\tepiank3\\tepiank3-app\\public\\logo_parameter.png'; // Default logo

        if (order?.companyLogo) {
            const cleanLogoPath = order.companyLogo.startsWith('/') ? order.companyLogo.substring(1) : order.companyLogo;
            const possiblePath1 = path.join(__dirname, '..', cleanLogoPath);
            const possiblePath2 = path.join(__dirname, '..', 'uploads', cleanLogoPath);

            if (fs.existsSync(possiblePath1)) {
                logoPath = possiblePath1;
            } else if (fs.existsSync(possiblePath2)) {
                logoPath = possiblePath2;
            }
        }

        try {
            if (fs.existsSync(logoPath)) {
                const logoId = workbook.addImage({
                    filename: logoPath,
                    extension: path.extname(logoPath).substring(1) || 'png',
                });

                // Merge cells for logo
                // Positioned in Column A, Rows 2-4 (above Company Name)
                sheet.mergeCells('A2:A4');
                sheet.addImage(logoId, {
                    tl: { col: 0, row: 1 }, // A2
                    br: { col: 1, row: 4 }, // Bottom of A4 (Start of B5)
                    editAs: 'oneCell'
                });
            }
        } catch (err) {
            console.error('Error adding logo:', err);
        }

        // Info Rows (Start at Row 5, below Logo)
        let currentRow = 5;

        const addInfoRow = (label, value) => {
            sheet.getCell(`A${currentRow}`).value = label;
            sheet.getCell(`A${currentRow}`).font = { bold: true };

            // Merge B:K for full width value
            sheet.mergeCells(`B${currentRow}:K${currentRow}`);

            sheet.getCell(`B${currentRow}`).value = `: ${value}`;
            sheet.getCell(`B${currentRow}`).alignment = { wrapText: true, vertical: 'top' };
            currentRow++;
        };

        addInfoRow('Nama Perusahaan', companyName);
        addInfoRow('Alamat', companyAddress);
        addInfoRow('Kota/Kabupaten', worksheet.pengujian.kota || '-');
        addInfoRow('Kecamatan', worksheet.pengujian.kecamatan || '-');
        addInfoRow('Provinsi', worksheet.pengujian.provinsi || '-');
        addInfoRow('No. Worksheet', worksheet.nomorWorksheet);
        addInfoRow('Tanggal', new Date(worksheet.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        addInfoRow('Jumlah Hari', jumlahHari);
        addInfoRow('Jumlah Personel', jumlahPersonel);

        // currentRow = 8; // Removed to allow dynamic row positioning
        currentRow++; // Add a gap row before table

        // --- Table Header ---
        const headerRowIndex = currentRow;
        const headerRow = sheet.getRow(headerRowIndex);
        headerRow.values = ['Lokasi', 'Cluster', 'Jenis Pengujian', 'Parameter', 'Jumlah', 'Acuan', 'Peralatan', 'Jumlah', 'Catatan', 'Bahan Habis', 'Ketersediaan Alat'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Add background color to header
        for (let i = 1; i <= 11; i++) {
            const cell = headerRow.getCell(i);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' } // Blue header
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }

        currentRow++;

        // --- Prepare Global Data ---
        let bahanHabisText = '-';
        let catatanText = '-';
        let peralatanText = '-';

        if (worksheet.catatan) {
            const bahanMatch = worksheet.catatan.match(/Bahan Habis: (.*?)(\n|$)/);
            if (bahanMatch) bahanHabisText = bahanMatch[1].trim();

            const catatanMatch = worksheet.catatan.match(/Catatan: (.*?)(\n|$)/);
            if (catatanMatch) catatanText = catatanMatch[1].trim();
        }

        if (worksheet.peralatanDigunakan) {
            try {
                const parsedAlat = JSON.parse(worksheet.peralatanDigunakan);
                const list = Object.entries(parsedAlat).map(([name, isReady]) =>
                    `- ${name}: ${isReady ? 'Tersedia' : 'Tidak Tersedia'}`
                );
                if (list.length > 0) peralatanText = list.join('\n');
            } catch (e) {
                console.error("Error parsing peralatanDigunakan for export", e);
            }
        }

        // --- Table Data ---
        // Group items
        const items = worksheet.worksheetItems.map(item => ({
            location: item.location || 'Unknown',
            cluster: item.parameter?.jenisPengujian?.cluster?.name || 'Uncategorized',
            jenis: item.parameter?.jenisPengujian?.name || 'Uncategorized',
            parameter: item.parameter?.name,
            qty_param: item.quantity || 1,
            acuan: item.parameter?.acuan || '-',
            peralatan: item.parameter?.parameterPeralatans?.map(p => p.peralatan?.name).join(', ') || '-',
            qty_alat: item.parameter?.parameterPeralatans?.length > 0 ? (item.quantity || 1) : '-',
            // Global columns will be merged later, but we set value for first row
            catatan: catatanText,
            bahanHabis: bahanHabisText,
            ketersediaanAlat: peralatanText
        }));

        // Sort items
        items.sort((a, b) => {
            if (a.location !== b.location) return a.location.localeCompare(b.location);
            if (a.cluster !== b.cluster) return a.cluster.localeCompare(b.cluster);
            return a.jenis.localeCompare(b.jenis);
        });

        // Add rows
        items.forEach(item => {
            const row = sheet.getRow(currentRow);
            row.values = [
                item.location,
                item.cluster,
                item.jenis,
                item.parameter,
                item.qty_param,
                item.acuan,
                item.peralatan,
                item.qty_alat,
                item.catatan,
                item.bahanHabis,
                item.ketersediaanAlat
            ];

            // Add borders
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'top', wrapText: true };
            });

            currentRow++;
        });

        // --- Merging Logic ---
        // We need to merge based on the data rows, which start at headerRowIndex + 1
        const dataStartRow = headerRowIndex + 1;
        const dataEndRow = currentRow - 1;

        let locStart = dataStartRow;
        let clusterStart = dataStartRow;
        let jenisStart = dataStartRow;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const nextItem = items[i + 1];
            const rowIndex = dataStartRow + i;

            // Merge Location
            if (!nextItem || nextItem.location !== item.location) {
                if (rowIndex > locStart) {
                    sheet.mergeCells(`A${locStart}:A${rowIndex}`);
                }
                sheet.getCell(`A${locStart}`).alignment = { vertical: 'top', horizontal: 'left' };
                locStart = rowIndex + 1;
            }

            // Merge Cluster
            if (!nextItem || nextItem.cluster !== item.cluster || nextItem.location !== item.location) {
                if (rowIndex > clusterStart) {
                    sheet.mergeCells(`B${clusterStart}:B${rowIndex}`);
                }
                sheet.getCell(`B${clusterStart}`).alignment = { vertical: 'top', horizontal: 'left' };
                clusterStart = rowIndex + 1;
            }

            // Merge Jenis
            if (!nextItem || nextItem.jenis !== item.jenis || nextItem.cluster !== item.cluster || nextItem.location !== item.location) {
                if (rowIndex > jenisStart) {
                    sheet.mergeCells(`C${jenisStart}:C${rowIndex}`);
                }
                sheet.getCell(`C${jenisStart}`).alignment = { vertical: 'top', horizontal: 'left' };
                jenisStart = rowIndex + 1;
            }

            // Center align quantities
            sheet.getCell(`E${rowIndex}`).alignment = { vertical: 'top', horizontal: 'center' };
            sheet.getCell(`H${rowIndex}`).alignment = { vertical: 'top', horizontal: 'center' };
        }

        // Merge Global Columns (I, J, K) for the entire table height
        if (dataEndRow >= dataStartRow) {
            // Catatan
            sheet.mergeCells(`I${dataStartRow}:I${dataEndRow}`);
            sheet.getCell(`I${dataStartRow}`).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

            // Bahan Habis
            sheet.mergeCells(`J${dataStartRow}:J${dataEndRow}`);
            sheet.getCell(`J${dataStartRow}`).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

            // Ketersediaan Alat
            sheet.mergeCells(`K${dataStartRow}:K${dataEndRow}`);
            sheet.getCell(`K${dataStartRow}`).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Worksheet-${worksheet.nomorWorksheet || id}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export worksheet error:', error);
        res.status(500).json({ error: 'Failed to export worksheet' });
    }
};
