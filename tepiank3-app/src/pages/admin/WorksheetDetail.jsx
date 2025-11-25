import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/NavBar';
import SideBar from '../../components/layout/SideBar';
import api from '../../services/api';
import { worksheetService } from '../../services/worksheetService';
import { Check, Printer, Save, MessageSquare, ArrowLeft, Edit2, X, Phone, Mail } from 'lucide-react';

const WorksheetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [worksheet, setWorksheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [jumlahHari, setJumlahHari] = useState(0);
    const [jumlahPersonel, setJumlahPersonel] = useState(0);
    const [catatan, setCatatan] = useState('');
    const [bahanHabis, setBahanHabis] = useState('');
    const [ketersediaanAlat, setKetersediaanAlat] = useState({});
    const [itemReadiness, setItemReadiness] = useState({});

    // Document management states
    const [penawaranFile, setPenawaranFile] = useState(null);
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [isReuploadingInvoice, setIsReuploadingInvoice] = useState(false);
    const [isReuploadingPenawaran, setIsReuploadingPenawaran] = useState(false);

    // Tab state (for sidebar navigation)
    const [activeTab, setActiveTab] = useState('parameter');

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);

            // Try to fetch associated worksheet
            try {
                const wsResponse = await worksheetService.getAllWorksheets(1, 100);
                const foundWs = wsResponse.data.find(ws => ws.pengujian?.orders?.some(o => o.id === parseInt(id)));

                if (foundWs) {
                    setWorksheet(foundWs);
                    setJumlahHari(foundWs.jumlahHari || 0);
                    setJumlahPersonel(foundWs.jumlahPersonel || 0);
                    setCatatan(foundWs.catatan || '');
                    setBahanHabis(foundWs.bahanHabis || '');
                    if (foundWs.peralatanDigunakan) {
                        try {
                            setKetersediaanAlat(JSON.parse(foundWs.peralatanDigunakan));
                        } catch (e) {
                            console.error("Error parsing peralatanDigunakan", e);
                        }
                    }
                }
            } catch (wsErr) {
                console.log("Worksheet not found or error fetching", wsErr);
            }

        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Gagal memuat data worksheet');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/orders/${order.id}`, { status: newStatus });
            alert(`Status berhasil diubah menjadi ${newStatus}`);
            fetchOrderDetails();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal mengubah status');
        }
    };

    const handleSubmit = async (status = 'APPROVED') => {
        try {
            setLoading(true);
            // If worksheet exists, update it. If not, create/submit it.
            // The backend endpoint /worksheets/submit seems to handle creation/update logic?
            // Or we might need to use updateWorksheet if it exists.

            const payload = {
                pengujianId: order.pengujian.id,
                pegawaiUtama: null,
                pegawaiPendamping: null,
                jumlahHari: parseInt(jumlahHari),
                jumlahPersonel: parseInt(jumlahPersonel),
                catatan,
                bahanHabis,
                peralatanDigunakan: JSON.stringify(ketersediaanAlat),
                status: status // Pass status if backend supports it, otherwise handle separately
            };

            await api.post('/worksheets/submit', payload);

            // If we need to explicitly set status (e.g. for 'APPROVED')
            if (worksheet && status !== 'IN_PROGRESS') {
                await worksheetService.updateWorksheet(worksheet.id, { status });
            }

            alert(`Worksheet berhasil disimpan dengan status: ${status}`);
            fetchOrderDetails();
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan worksheet');
        } finally {
            setLoading(false);
        }
    };

    const handleRevise = async () => {
        const note = prompt('Masukkan catatan revisi:');
        if (!note) return;

        try {
            setLoading(true);
            await api.post(`/orders/${id}/revise`, { note });
            alert('Permintaan revisi berhasil dikirim');
            navigate('/HomeAdm');
        } catch (err) {
            console.error(err);
            alert('Gagal mengirim revisi');
        } finally {
            setLoading(false);
        }
    };

    // Handle readiness change
    const handleReadinessChange = async (itemId, isReady) => {
        try {
            // Update local state immediately for better UX
            setItemReadiness(prev => ({
                ...prev,
                [itemId]: isReady
            }));

            // Update via API
            await worksheetService.updateWorksheetItem(itemId, null, null, null, isReady);
        } catch (err) {
            console.error('Error updating readiness:', err);
            alert('Gagal mengupdate status kesiapan');
            // Revert on error
            setItemReadiness(prev => {
                const newState = { ...prev };
                delete newState[itemId];
                return newState;
            });
        }
    };

    // Handle penawaran upload
    const handlePenawaranUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diperbolehkan');
            return;
        }

        try {
            setUploadingDoc(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64 = reader.result;
                    await api.post(`/orders/${order.id}/upload-penawaran`, { file: base64 });
                    alert('Penawaran berhasil diupload');
                    fetchOrderDetails(); // Refresh data
                } catch (err) {
                    console.error('Error uploading penawaran:', err);
                    alert('Gagal mengupload penawaran');
                }
                setUploadingDoc(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Error reading file:', err);
            setUploadingDoc(false);
        }
    };

    // Handle invoice upload
    const handleInvoiceUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diperbolehkan');
            return;
        }

        if (!invoiceNumber) {
            alert('Nomor invoice harus diisi');
            return;
        }

        try {
            setUploadingDoc(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64 = reader.result;
                    await api.post(`/orders/${order.id}/upload-invoice`, {
                        file: base64,
                        invoiceNumber: invoiceNumber
                    });
                    alert('Invoice berhasil diupload');
                    setInvoiceNumber('');
                    setIsReuploadingInvoice(false);
                    fetchOrderDetails(); // Refresh data
                } catch (err) {
                    console.error('Error uploading invoice:', err);
                    alert('Gagal mengupload invoice');
                }
                setUploadingDoc(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Error reading file:', err);
            setUploadingDoc(false);
        }
    };

    // Helper to group items
    const getGroupedItems = () => {
        let items = [];
        // Use worksheet items if available to get saved values (if any), otherwise order items
        // Note: The image shows "Jumlah", "Acuan", "Peralatan". These are mostly from Parameter definition.
        // "Jumlah" in table might be quantity of samples or tests.

        const sourceItems = worksheet?.worksheetItems || order?.pengujian?.pengujianItems || [];

        items = sourceItems.map(item => ({
            ...item,
            clusterName: item.parameter?.jenisPengujian?.cluster?.name || 'Uncategorized',
            jenisPengujianName: item.parameter?.jenisPengujian?.name || 'Uncategorized',
            parameterName: item.parameter?.name,
            acuan: item.parameter?.acuan,
            peralatan: item.parameter?.parameterPeralatans || [], // Array of { peralatan: { name } }
            quantity: 1 // Default quantity if not in item
        }));

        // Sort
        items.sort((a, b) => {
            if (a.clusterName !== b.clusterName) return a.clusterName.localeCompare(b.clusterName);
            return a.jenisPengujianName.localeCompare(b.jenisPengujianName);
        });

        return items;
    };

    const groupedItems = getGroupedItems();

    // RowSpan Logic
    const calculateSpans = (items) => {
        const spans = [];
        let clusterStart = 0;
        let jenisStart = 0;

        for (let i = 0; i < items.length; i++) {
            spans[i] = { cluster: 0, jenis: 0 };
            if (i === 0 || items[i].clusterName !== items[i - 1].clusterName) {
                if (i > 0) spans[clusterStart].cluster = i - clusterStart;
                clusterStart = i;
            }
            if (i === 0 || items[i].jenisPengujianName !== items[i - 1].jenisPengujianName || items[i].clusterName !== items[i - 1].clusterName) {
                if (i > 0) spans[jenisStart].jenis = i - jenisStart;
                jenisStart = i;
            }
            if (i === items.length - 1) {
                spans[clusterStart].cluster = i - clusterStart + 1;
                spans[jenisStart].jenis = i - jenisStart + 1;
            }
        }
        return spans;
    };

    const itemSpans = calculateSpans(groupedItems);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Admin Sidebar */}
            <SideBar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-40">
                    <Navbar />
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="flex max-w-[1600px] mx-auto gap-6">
                        {/* Left Sidebar - Company Info */}
                        <aside className="w-80 flex-shrink-0 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-cyan-300"></div>

                                <div className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white overflow-hidden">
                                    {/* Logo Placeholder or User Avatar */}
                                    {order.companyLogo ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${order.companyLogo.startsWith('/') ? '' : '/'}${order.companyLogo}`}
                                            alt="Company Logo"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerText = order.company?.charAt(0) || 'C';
                                            }}
                                        />
                                    ) : (
                                        <span>{order.company?.charAt(0) || 'C'}</span>
                                    )}
                                </div>

                                <div className="text-left mb-6">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Nama Perusahaan</p>
                                    <h2 className="font-bold text-gray-800 text-lg leading-tight mb-1">{order.company || 'Nama Perusahaan'}</h2>
                                    <p className="text-sm text-gray-500">Site MHU</p>
                                </div>

                                <div className="text-left space-y-4 text-sm border-t border-gray-100 pt-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Alamat</p>
                                        <p className="text-gray-600 leading-relaxed">{order.address || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Kontak Person</p>
                                        <p className="font-bold text-gray-800">{order.contactPerson || '-'}</p>
                                        <p className="text-gray-600">{order.phone || '-'}</p>
                                        <p className="text-blue-600 break-words">{order.user?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Hubungi Perusahaan</p>
                                        <div className="flex gap-3">
                                            <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition">
                                                <Phone className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                                                <Mail className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Management Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                                    <span className="text-xl">📄</span> Manajemen Dokumen
                                </h3>

                                {/* Penawaran Upload */}
                                <div className="mb-4 pb-4 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Upload Penawaran</p>
                                    {order.penawaranFile ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4">
                                                <a
                                                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${order.penawaranFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Lihat Penawaran
                                                </a>
                                                <button
                                                    onClick={() => setIsReuploadingPenawaran(!isReuploadingPenawaran)}
                                                    className="text-xs text-gray-500 underline hover:text-gray-700"
                                                >
                                                    {isReuploadingPenawaran ? 'Batal Upload Ulang' : 'Upload Ulang'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {(!order.penawaranFile || isReuploadingPenawaran) && (
                                        <label className="block mt-2">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={async (e) => {
                                                    await handlePenawaranUpload(e);
                                                    setIsReuploadingPenawaran(false);
                                                }}
                                                disabled={uploadingDoc}
                                                className="hidden"
                                                id="penawaran-upload"
                                            />
                                            <label
                                                htmlFor="penawaran-upload"
                                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                                            >
                                                <Save className="w-4 h-4" />
                                                {uploadingDoc ? 'Uploading...' : 'Upload PDF'}
                                            </label>
                                        </label>
                                    )}
                                </div>

                                {/* Surat Persetujuan View */}
                                {order.suratPersetujuanFile && (
                                    <div className="mb-4 pb-4 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Surat Persetujuan User</p>
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${order.suratPersetujuanFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:underline text-sm flex items-center gap-1"
                                            >
                                                <Save className="w-4 h-4" />
                                                Lihat Surat Persetujuan
                                            </a>

                                            {/* Status Badge */}
                                            {order.persetujuanStatus && (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${order.persetujuanStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        order.persetujuanStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.persetujuanStatus === 'APPROVED' ? '✓ Disetujui' :
                                                            order.persetujuanStatus === 'REJECTED' ? '✗ Ditolak' :
                                                                '⏳ Menunggu Review'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Approve/Reject Buttons */}
                                            {order.status === 'IN_PROGRESS' && order.persetujuanStatus === 'PENDING' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.post(`/orders/${order.id}/approve-persetujuan`);
                                                                alert('Persetujuan disetujui!');
                                                                fetchOrderDetails();
                                                            } catch (err) {
                                                                console.error('Error approving:', err);
                                                                alert('Gagal menyetujui persetujuan');
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
                                                    >
                                                        ✓ Setujui
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const reason = prompt('Alasan penolakan (opsional):');
                                                            if (reason !== null) {
                                                                try {
                                                                    await api.post(`/orders/${order.id}/reject-persetujuan`, { reason });
                                                                    alert('Persetujuan ditolak. User harus upload ulang.');
                                                                    fetchOrderDetails();
                                                                } catch (err) {
                                                                    console.error('Error rejecting:', err);
                                                                    alert('Gagal menolak persetujuan');
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
                                                    >
                                                        ✗ Tolak
                                                    </button>
                                                </div>
                                            )}

                                            {/* Rejection Reason */}
                                            {order.persetujuanStatus === 'REJECTED' && order.persetujuanRejectionReason && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    Alasan: {order.persetujuanRejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Invoice Upload */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Upload Invoice</p>
                                    {order.invoiceFile && (
                                        <div className="space-y-2 mb-4">
                                            <p className="text-xs text-gray-500">No. Invoice: <span className="font-semibold text-gray-700">{order.invoiceNumber}</span></p>
                                            <div className="flex items-center gap-4">
                                                <a
                                                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${order.invoiceFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Lihat Invoice
                                                </a>
                                                <button
                                                    onClick={() => setIsReuploadingInvoice(!isReuploadingInvoice)}
                                                    className="text-xs text-gray-500 underline hover:text-gray-700"
                                                >
                                                    {isReuploadingInvoice ? 'Batal Upload Ulang' : 'Upload Ulang'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {(!order.invoiceFile || isReuploadingInvoice) && (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Nomor Invoice"
                                                value={invoiceNumber}
                                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <label className="block">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleInvoiceUpload}
                                                    disabled={uploadingDoc || !invoiceNumber}
                                                    className="hidden"
                                                    id="invoice-upload"
                                                />
                                                <label
                                                    htmlFor="invoice-upload"
                                                    className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${uploadingDoc || !invoiceNumber
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-green-500 text-white hover:bg-green-600'
                                                        }`}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {uploadingDoc ? 'Uploading...' : 'Upload Invoice'}
                                                </label>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Verification */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Verifikasi Pembayaran</p>
                                    {order.buktiBayarFile ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${order.buktiBayarFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Lihat Bukti Bayar
                                                </a>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    order.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </div>

                                            {order.paymentStatus !== 'PAID' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Verifikasi pembayaran ini?')) {
                                                                try {
                                                                    await api.post(`/orders/${order.id}/verify-payment`);
                                                                    alert('Pembayaran diverifikasi.');
                                                                    fetchOrderDetails();
                                                                } catch (err) {
                                                                    console.error('Error verifying payment:', err);
                                                                    alert('Gagal memverifikasi pembayaran');
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
                                                    >
                                                        ✓ Verifikasi
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const reason = prompt('Alasan penolakan:');
                                                            if (reason) {
                                                                try {
                                                                    await api.post(`/orders/${order.id}/reject-payment`, { reason });
                                                                    alert('Pembayaran ditolak.');
                                                                    fetchOrderDetails();
                                                                } catch (err) {
                                                                    console.error('Error rejecting payment:', err);
                                                                    alert('Gagal menolak pembayaran');
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
                                                    >
                                                        ✗ Tolak
                                                    </button>
                                                </div>
                                            )}

                                            {order.paymentStatus === 'REJECTED' && order.paymentRejectionReason && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    Alasan: {order.paymentRejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">Belum ada bukti bayar diupload.</p>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('parameter')}
                                    className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 ${activeTab === 'parameter' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
                                >
                                    <div className={`p-1.5 rounded-lg ${activeTab === 'parameter' ? 'bg-white/20' : 'bg-blue-50'}`}>
                                        <img src="/icon-parameter.svg" alt="" className={`w-5 h-5 ${activeTab === 'parameter' ? 'brightness-0 invert' : ''}`} />
                                    </div>
                                    Parameter
                                </button>
                            </div>

                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1 space-y-6">
                            {/* Header Title */}
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <img src="/icon-parameter.svg" alt="" className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Rincian Parameter</h2>
                            </div>

                            {/* Parameter Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-blue-50/50 text-gray-700 font-bold border-b border-gray-100">
                                            <tr>
                                                <th className="p-4 text-left">Cluster</th>
                                                <th className="p-4 text-left border-l border-gray-100">Jenis Pengujian</th>
                                                <th className="p-4 text-left border-l border-gray-100">Parameter</th>
                                                <th className="p-4 text-center border-l border-gray-100 w-20">Jumlah</th>
                                                <th className="p-4 text-left border-l border-gray-100">Acuan</th>
                                                <th className="p-4 text-left border-l border-gray-100">Peralatan</th>
                                                <th className="p-4 text-center border-l border-gray-100 w-20">Jumlah</th>
                                                <th className="p-4 text-center border-l border-gray-100 w-16">Siap</th>
                                                <th className="p-4 text-center border-l border-gray-100 w-16">Tidak</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {groupedItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    {itemSpans[index].cluster > 0 && (
                                                        <td className="p-4 align-top bg-white font-medium text-gray-600 border-r border-gray-100" rowSpan={itemSpans[index].cluster}>
                                                            {item.clusterName}
                                                        </td>
                                                    )}
                                                    {itemSpans[index].jenis > 0 && (
                                                        <td className="p-4 align-top bg-white font-medium text-gray-600 border-r border-gray-100" rowSpan={itemSpans[index].jenis}>
                                                            {item.jenisPengujianName}
                                                        </td>
                                                    )}
                                                    <td className="p-4 text-gray-800 border-r border-gray-100">{item.parameterName}</td>
                                                    <td className="p-4 text-center text-gray-800 border-r border-gray-100">{item.quantity}</td>
                                                    <td className="p-4 text-gray-500 text-xs border-r border-gray-100">{item.acuan || '-'}</td>
                                                    <td className="p-4 border-r border-gray-100">
                                                        <ul className="space-y-1">
                                                            {item.peralatan.map((p, idx) => (
                                                                <li key={idx} className="text-gray-700">{p.peralatan?.name}</li>
                                                            ))}
                                                            {item.peralatan.length === 0 && <li className="text-gray-400 italic">-</li>}
                                                        </ul>
                                                    </td>
                                                    <td className="p-4 text-center text-gray-800 border-r border-gray-100">
                                                        {item.peralatan.length > 0 ? item.quantity : '-'}
                                                    </td>
                                                    <td className="p-4 text-center border-r border-gray-100">
                                                        <div className="flex justify-center">
                                                            <div
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${(itemReadiness[item.id] ?? item.isReady) === true
                                                                    ? 'border-green-500 bg-green-50 text-green-500'
                                                                    : 'border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400'
                                                                    }`}
                                                                onClick={() => handleReadinessChange(item.id, true)}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex justify-center">
                                                            <div
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${(itemReadiness[item.id] ?? item.isReady) === false
                                                                    ? 'border-red-500 bg-red-50 text-red-500'
                                                                    : 'border-gray-300 text-gray-300 hover:border-red-400 hover:text-red-400'
                                                                    }`}
                                                                onClick={() => handleReadinessChange(item.id, false)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Ketersediaan Alat */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                                        <span className="text-xl">🌡️</span> Ketersediaan Alat
                                    </h4>
                                    <div className="flex-1 bg-gray-50 rounded-xl p-3 overflow-y-auto max-h-60 border border-gray-100">
                                        {(() => {
                                            const allEquipment = new Map();
                                            groupedItems.forEach(item => {
                                                item.peralatan.forEach(p => {
                                                    if (p.peralatan) {
                                                        allEquipment.set(p.peralatan.id, p.peralatan.name);
                                                    }
                                                });
                                            });
                                            const uniqueEquipment = Array.from(allEquipment.entries());

                                            if (uniqueEquipment.length === 0) return <div className="text-gray-400 text-center italic mt-4">Tidak ada alat</div>;

                                            return uniqueEquipment.map(([id, name], i) => (
                                                <div key={id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                                                    <span className="text-sm text-gray-700 font-medium">{i + 1}. {name}</span>
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={!!ketersediaanAlat[id]}
                                                        onChange={(e) => {
                                                            setKetersediaanAlat(prev => ({
                                                                ...prev,
                                                                [id]: e.target.checked
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>

                                {/* Bahan Habis */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                                        <span className="text-xl">🧪</span> Bahan Habis
                                    </h4>
                                    <textarea
                                        className="flex-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        placeholder="1. Parameter SO2&#10;2. Parameter O3"
                                        value={bahanHabis}
                                        onChange={(e) => setBahanHabis(e.target.value)}
                                        style={{ minHeight: '200px' }}
                                    />
                                </div>

                                {/* Catatan */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                    <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                                        <span className="text-xl">📝</span> Catatan
                                    </h4>
                                    <textarea
                                        className="flex-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        placeholder="Kaji Ulang 25/12/23 : Pastikan penyimpanan charcoal pada coolbox"
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        style={{ minHeight: '200px' }}
                                    />
                                </div>
                            </div>

                            {/* Footer Controls */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex gap-8">
                                    <div className="flex items-center gap-3">
                                        <span className="text-blue-600 font-bold text-lg flex items-center gap-2">
                                            📅 Jumlah Hari
                                        </span>
                                        <input
                                            type="number"
                                            className="w-20 p-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-700 focus:border-blue-500 outline-none"
                                            value={jumlahHari}
                                            onChange={(e) => setJumlahHari(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-blue-600 font-bold text-lg flex items-center gap-2">
                                            👥 Jumlah Personel
                                        </span>
                                        <input
                                            type="number"
                                            className="w-20 p-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-700 focus:border-blue-500 outline-none"
                                            value={jumlahPersonel}
                                            onChange={(e) => setJumlahPersonel(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition">
                                        <Printer className="w-6 h-6" />
                                    </button>
                                    <button className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition">
                                        <Save className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => handleSubmit('APPROVED')}
                                        className="px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center gap-2 shadow-lg shadow-green-200 transition transform hover:scale-105"
                                    >
                                        <Check className="w-5 h-5" />
                                        SETUJU
                                    </button>
                                    <button
                                        onClick={handleRevise}
                                        className="px-8 py-3 bg-yellow-400 text-white font-bold rounded-xl hover:bg-yellow-500 flex items-center gap-2 shadow-lg shadow-yellow-200 transition transform hover:scale-105"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        REVISI
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WorksheetDetail;
