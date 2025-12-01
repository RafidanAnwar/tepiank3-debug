const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.getAdminAllOrders = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
                pengujian: {
                    include: {
                        jenisPengujian: {
                            include: {
                                cluster: true
                            }
                        },
                        pengujianItems: {
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
                },
                pengujians: {
                    include: {
                        jenisPengujian: {
                            include: {
                                cluster: true
                            }
                        },
                        pengujianItems: {
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
                },
                orderItems: {
                    include: {
                        parameter: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { items, totalAmount, company, address, contactPerson, phone, companyLogo } = req.body;

        // Verify ownership
        const existingOrder = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (existingOrder.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Transaction to update order and replace items
        const updatedOrder = await prisma.$transaction(async (prisma) => {
            // 1. Update Order Details
            const order = await prisma.order.update({
                where: { id: parseInt(id) },
                data: {
                    totalAmount,
                    company,
                    address,
                    contactPerson,
                    phone,
                    companyLogo,
                    status: 'PENDING', // Reset to PENDING after revision
                    notes: null // Clear revision notes
                }
            });

            // 2. Delete existing items
            await prisma.orderItem.deleteMany({
                where: { orderId: parseInt(id) }
            });

            // 3. Create new items
            for (const item of items) {
                await prisma.orderItem.create({
                    data: {
                        orderId: order.id,
                        parameterId: item.parameterId,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.subtotal,
                        location: item.location
                    }
                });
            }

            return order;
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
};

exports.reviseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                status: 'PENDING', // Set back to PENDING for revision
                notes: note
            }
        });

        res.json(order);
    } catch (error) {
        console.error('Revise order error:', error);
        res.status(500).json({ error: 'Failed to revise order' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.order.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
};

exports.uploadPenawaran = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { file } = req.body; // base64 encoded file

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        // Decode base64 and save file
        const uploadsDir = path.join(__dirname, '../uploads/documents');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `penawaran_${id}_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        const base64Data = file.replace(/^data:application\/pdf;base64,/, '');

        fs.writeFileSync(filePath, base64Data, 'base64');

        // Update order
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                penawaranFile: `/uploads/documents/${fileName}`,
                status: 'IN_PROGRESS' // Auto-update status
            }
        });

        res.json({ message: 'Penawaran uploaded successfully', order });
    } catch (error) {
        console.error('Upload penawaran error:', error);
        res.status(500).json({ error: 'Failed to upload penawaran' });
    }
};

exports.uploadPersetujuan = async (req, res) => {
    try {
        const { id } = req.params;
        const { file } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const uploadsDir = path.join(__dirname, '../uploads/documents');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Detect file type from base64 prefix
        let fileExtension = 'pdf';
        let base64Data = file;

        if (file.startsWith('data:application/pdf')) {
            fileExtension = 'pdf';
            base64Data = file.replace(/^data:application\/pdf;base64,/, '');
        } else if (file.startsWith('data:image/jpeg') || file.startsWith('data:image/jpg')) {
            fileExtension = 'jpg';
            base64Data = file.replace(/^data:image\/jpe?g;base64,/, '');
        } else if (file.startsWith('data:image/png')) {
            fileExtension = 'png';
            base64Data = file.replace(/^data:image\/png;base64,/, '');
        } else {
            // Fallback: try to remove any data URL prefix
            base64Data = file.replace(/^data:.*?;base64,/, '');
        }

        const fileName = `persetujuan_${id}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                suratPersetujuanFile: `/uploads/documents/${fileName}`,
                persetujuanStatus: 'PENDING', // Reset status on re-upload
                persetujuanRejectionReason: null // Clear previous rejection reason
            }
        });

        res.json({ message: 'Surat persetujuan uploaded successfully', order });
    } catch (error) {
        console.error('Upload persetujuan error:', error);
        res.status(500).json({ error: 'Failed to upload surat persetujuan' });
    }
};

exports.uploadSuratTugas = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { file } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const uploadsDir = path.join(__dirname, '../uploads/documents');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `surat_tugas_${id}_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        const base64Data = file.replace(/^data:application\/pdf;base64,/, '');

        fs.writeFileSync(filePath, base64Data, 'base64');

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                suratTugasFile: `/uploads/documents/${fileName}`
            }
        });

        res.json({ message: 'Surat Tugas uploaded successfully', order });
    } catch (error) {
        console.error('Upload Surat Tugas error:', error);
        res.status(500).json({ error: 'Failed to upload Surat Tugas' });
    }
};

exports.uploadInvoice = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { file, invoiceNumber } = req.body;

        if (!file || !invoiceNumber) {
            return res.status(400).json({ error: 'File and invoice number are required' });
        }

        const uploadsDir = path.join(__dirname, '../uploads/documents');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `invoice_${id}_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        const base64Data = file.replace(/^data:application\/pdf;base64,/, '');

        fs.writeFileSync(filePath, base64Data, 'base64');

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                invoiceFile: `/uploads/documents/${fileName}`,
                invoiceNumber: invoiceNumber,
                status: 'COMPLETED' // Auto-update status
            }
        });

        res.json({ message: 'Invoice uploaded successfully', order });
    } catch (error) {
        console.error('Upload invoice error:', error);
        res.status(500).json({ error: 'Failed to upload invoice' });
    }
};

exports.approvePersetujuan = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                persetujuanStatus: 'APPROVED'
            }
        });

        res.json({ message: 'Persetujuan approved successfully', order });
    } catch (error) {
        console.error('Approve persetujuan error:', error);
        res.status(500).json({ error: 'Failed to approve persetujuan' });
    }
};

exports.rejectPersetujuan = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { reason } = req.body;

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                persetujuanStatus: 'REJECTED',
                persetujuanRejectionReason: reason || 'Tidak memenuhi syarat',
                suratPersetujuanFile: null // Clear the file so user can re-upload
            }
        });

        res.json({ message: 'Persetujuan rejected successfully', order });
    } catch (error) {
        console.error('Reject persetujuan error:', error);
        res.status(500).json({ error: 'Failed to reject persetujuan' });
    }
};

exports.uploadBuktiBayar = async (req, res) => {
    try {
        const { id } = req.params;
        const { file } = req.body; // Base64 string

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const uploadsDir = path.join(__dirname, '../uploads/documents');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `bukti_bayar_${id}_${Date.now()}.jpg`; // Assuming image, but could be PDF
        const filePath = path.join(uploadsDir, fileName);

        // Handle base64 data (remove prefix if present)
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');

        fs.writeFileSync(filePath, base64Data, 'base64');

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                buktiBayarFile: `/uploads/documents/${fileName}`,
                paymentStatus: 'PENDING_VERIFICATION'
            }
        });

        res.json({ message: 'Bukti bayar uploaded successfully', order });
    } catch (error) {
        console.error('Upload bukti bayar error:', error);
        res.status(500).json({ error: 'Failed to upload bukti bayar' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                paymentStatus: 'PAID'
            }
        });

        res.json({ message: 'Payment verified successfully', order });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

exports.rejectPayment = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { reason } = req.body;

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                paymentStatus: 'REJECTED',
                paymentRejectionReason: reason || 'Bukti pembayaran tidak valid',
                buktiBayarFile: null // Clear file to allow re-upload
            }
        });

        res.json({ message: 'Payment rejected successfully', order });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({ error: 'Failed to reject payment' });
    }
};
