import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/NavBar';
import SideBar from '../../components/layout/SideBar';
import api from '../../services/api';
import { worksheetService } from '../../services/worksheetService';
import { Check, Save, MessageSquare, ArrowLeft, Edit2, X, Phone, Mail, MapPin, Download, ChevronLeft, ChevronRight } from 'lucide-react';

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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

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

            // Auto-approve persetujuan if it's still pending
            if (order && order.persetujuanStatus === 'PENDING') {
                try {
                    await api.post(`/orders/${order.id}/approve-persetujuan`);
                    // Update local order state silently
                    setOrder(prev => ({ ...prev, persetujuanStatus: 'APPROVED' }));
                } catch (err) {
                    console.error('Failed to auto-approve persetujuan:', err);
                }
            }

            let targetItemId = itemId;

            // If worksheet doesn't exist, create it first
            if (!worksheet) {
                const payload = {
                    pengujianId: order.pengujian.id,
                    pegawaiUtama: null,
                    pegawaiPendamping: null,
                    jumlahHari: 0,
                    jumlahPersonel: 0,
                    catatan: '',
                    bahanHabis: '',
                    peralatanDigunakan: JSON.stringify({}),
                    status: 'DRAFT'
                };

                const response = await api.post('/worksheets/submit', payload);
                const newWorksheet = response.data.worksheet;
                setWorksheet(newWorksheet);

                // Find the correct item ID in the new worksheet
                // The itemId passed here might be from the order items if worksheet didn't exist
                // We need to match it with the new worksheet items
                const clickedItem = allGroupedItems.find(item => item.id === itemId);
                if (clickedItem) {
                    const matchingWsItem = newWorksheet.worksheetItems.find(wsItem =>
                        wsItem.parameterId === clickedItem.parameterId &&
                        wsItem.location === clickedItem.location
                    );
                    if (matchingWsItem) {
                        targetItemId = matchingWsItem.id;
                    }
                }
            }

            // Update via API
            await worksheetService.updateWorksheetItem(targetItemId, null, null, null, isReady);
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

    const [isReuploadingSuratTugas, setIsReuploadingSuratTugas] = useState(false);

    // Handle Surat Tugas upload
    const handleSuratTugasUpload = async (e) => {
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
                    await api.post(`/orders/${order.id}/upload-surat-tugas`, {
                        file: base64
                    });
                    alert('Surat Tugas berhasil diupload');
                    setIsReuploadingSuratTugas(false);
                    fetchOrderDetails(); // Refresh data
                } catch (err) {
                    console.error('Error uploading Surat Tugas:', err);
                    alert('Gagal mengupload Surat Tugas');
                }
                setUploadingDoc(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Error reading file:', err);
            setUploadingDoc(false);
        }
    };

    const [selectedLocation, setSelectedLocation] = useState('');

    // Helper to group items
    const getGroupedItems = () => {
        let items = [];
        // Aggregate items from all pengujians if worksheet doesn't exist yet
        const sourceItems = worksheet?.worksheetItems ||
            (order?.pengujians?.flatMap(p => p.pengujianItems) || []) ||
            [];

        items = sourceItems.map(item => ({
            ...item,
            location: item.location || 'Unknown', // Add location
            clusterName: item.parameter?.jenisPengujian?.cluster?.name || 'Uncategorized',
            jenisPengujianName: item.parameter?.jenisPengujian?.name || 'Uncategorized',
            parameterName: item.parameter?.name,
            acuan: item.parameter?.acuan,
            peralatan: item.parameter?.parameterPeralatans || [],
            quantity: item.quantity || 1
        }));

        // Sort by Location -> Cluster -> Jenis
        items.sort((a, b) => {
            if (a.location !== b.location) return a.location.localeCompare(b.location);
            if (a.clusterName !== b.clusterName) return a.clusterName.localeCompare(b.clusterName);
            return a.jenisPengujianName.localeCompare(b.jenisPengujianName);
        });

        return items;
    };

    const allGroupedItems = getGroupedItems();

    // Get unique locations
    const uniqueLocations = [...new Set(allGroupedItems.map(item => item.location))];

    // Set default location if not set
    useEffect(() => {
        if (uniqueLocations.length > 0 && !selectedLocation) {
            setSelectedLocation(uniqueLocations[0]);
        }
    }, [uniqueLocations, selectedLocation]);

    // Filter items based on selected location
    const groupedItems = allGroupedItems.filter(item => item.location === selectedLocation);

    // Pagination Logic
    const totalPages = Math.ceil(groupedItems.length / ITEMS_PER_PAGE);

    // Reset page when location changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedLocation]);

    const paginatedItems = groupedItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    // RowSpan Logic (Updated for Pagination)
    const calculateSpans = (items) => {
        const spans = [];
        let clusterStart = 0;
        let jenisStart = 0;

        for (let i = 0; i < items.length; i++) {
            spans[i] = { cluster: 0, jenis: 0 };

            // Cluster Span
            if (i === 0 || items[i].clusterName !== items[i - 1].clusterName) {
                if (i > 0) spans[clusterStart].cluster = i - clusterStart;
                clusterStart = i;
            }

            // Jenis Span (reset if cluster changes)
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

    const handleDownloadExcel = async () => {
        try {
            let targetWorksheetId = worksheet?.id;

            // Prepare payload with current state
            const payload = {
                pengujianId: order.pengujian.id,
                pegawaiUtama: null,
                pegawaiPendamping: null,
                jumlahHari: parseInt(jumlahHari) || 0,
                jumlahPersonel: parseInt(jumlahPersonel) || 0,
                catatan: catatan,
                bahanHabis: bahanHabis,
                peralatanDigunakan: JSON.stringify(ketersediaanAlat),
                status: worksheet?.status || 'DRAFT'
            };

            // If no worksheet exists, create it
            if (!targetWorksheetId) {
                const response = await api.post('/worksheets/submit', payload);
                const newWorksheet = response.data.worksheet;
                setWorksheet(newWorksheet);
                targetWorksheetId = newWorksheet.id;
            } else {
                // Update existing worksheet to ensure latest data is saved
                await api.post('/worksheets/submit', payload);
            }

            console.log('Downloading Excel for worksheet:', targetWorksheetId);
            const response = await api.get(`/worksheets/${targetWorksheetId}/export`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Worksheet-${targetWorksheetId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading excel:', error);
            alert('Gagal mengunduh excel');
        }
    };

    const itemSpans = calculateSpans(paginatedItems);
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

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto gap-6">
                        {/* Left Sidebar - Company Info */}
                        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
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
                                        <div className="flex flex-col gap-2">
                                            {order.phone && (
                                                <a href={`tel:${order.phone}`} className="flex items-center gap-3 p-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition group">
                                                    <div className="bg-white p-1.5 rounded-md shadow-sm group-hover:shadow-md transition">
                                                        <Phone className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">{order.phone}</span>
                                                </a>
                                            )}
                                            {order.user?.email && (
                                                <a href={`mailto:${order.user.email}`} className="flex items-center gap-3 p-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition group">
                                                    <div className="bg-white p-1.5 rounded-md shadow-sm group-hover:shadow-md transition">
                                                        <Mail className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm break-all">{order.user.email}</span>
                                                </a>
                                            )}
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
                                        <div className="mt-2">
                                            <label className="block">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={async (e) => {
                                                        await handlePenawaranUpload(e);
                                                        setIsReuploadingPenawaran(false);
                                                    }}
                                                    disabled={uploadingDoc || worksheet?.status !== 'APPROVED'}
                                                    className="hidden"
                                                    id="penawaran-upload"
                                                />
                                                <label
                                                    htmlFor="penawaran-upload"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${uploadingDoc || worksheet?.status !== 'APPROVED'
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                                        }`}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {uploadingDoc ? 'Uploading...' : 'Upload PDF'}
                                                </label>
                                            </label>
                                            {worksheet?.status !== 'APPROVED' && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    *Worksheet harus disetujui (APPROVED) sebelum upload penawaran.
                                                </p>
                                            )}
                                        </div>
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
                                            {order.status === 'IN_PROGRESS' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        disabled={order.persetujuanStatus === 'APPROVED'}
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
                                                        className={`px-3 py-1 rounded-lg text-xs transition ${order.persetujuanStatus === 'APPROVED'
                                                            ? 'bg-green-200 text-green-800 cursor-not-allowed'
                                                            : 'bg-green-500 text-white hover:bg-green-600'
                                                            }`}
                                                    >
                                                        {order.persetujuanStatus === 'APPROVED' ? '✓ Sudah Disetujui' : '✓ Setujui'}
                                                    </button>

                                                    {order.persetujuanStatus === 'PENDING' && (
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
                                                    )}
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
                                                disabled={order.persetujuanStatus !== 'APPROVED'}
                                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${order.persetujuanStatus !== 'APPROVED' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            />
                                            <label className="block">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleInvoiceUpload}
                                                    disabled={uploadingDoc || !invoiceNumber || order.persetujuanStatus !== 'APPROVED'}
                                                    className="hidden"
                                                    id="invoice-upload"
                                                />
                                                <label
                                                    htmlFor="invoice-upload"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${uploadingDoc || !invoiceNumber || order.persetujuanStatus !== 'APPROVED'
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                                                        }`}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {uploadingDoc ? 'Uploading...' : 'Upload Invoice'}
                                                </label>
                                            </label>
                                            {order.persetujuanStatus !== 'APPROVED' && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    *Surat Persetujuan harus disetujui admin sebelum upload invoice.
                                                </p>
                                            )}
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

                                {/* Surat Tugas Upload */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Upload Surat Tugas</p>
                                    {order.suratTugasFile ? (
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-4">
                                                <a
                                                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${order.suratTugasFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Lihat Surat Tugas
                                                </a>
                                                <button
                                                    onClick={() => setIsReuploadingSuratTugas(!isReuploadingSuratTugas)}
                                                    className="text-xs text-gray-500 underline hover:text-gray-700"
                                                >
                                                    {isReuploadingSuratTugas ? 'Batal Upload Ulang' : 'Upload Ulang'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {(!order.suratTugasFile || isReuploadingSuratTugas) && (
                                        <div className="space-y-2">
                                            <label className="block">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleSuratTugasUpload}
                                                    disabled={uploadingDoc || order.paymentStatus !== 'PAID'}
                                                    className="hidden"
                                                    id="surat-tugas-upload"
                                                />
                                                <label
                                                    htmlFor="surat-tugas-upload"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${uploadingDoc || order.paymentStatus !== 'PAID'
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-purple-500 text-white hover:bg-purple-600 cursor-pointer'
                                                        }`}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {uploadingDoc ? 'Uploading...' : 'Upload Surat Tugas'}
                                                </label>
                                            </label>
                                            {order.paymentStatus !== 'PAID' && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    *Pembayaran harus diverifikasi (PAID) sebelum upload Surat Tugas.
                                                </p>
                                            )}
                                        </div>
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
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <img src="/icon-parameter.svg" alt="" className="w-6 h-6" />
                                    <h2 className="text-xl font-bold">Rincian Parameter</h2>
                                </div>
                                {/* Location Filter Dropdown */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDownloadExcel}
                                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm text-sm font-medium"
                                        title="Download Excel"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Excel</span>
                                    </button>
                                    <div className="h-8 w-px bg-gray-200 mx-2"></div>
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
                                    >
                                        {uniqueLocations.map((loc) => (
                                            <option key={loc} value={loc}>
                                                {loc}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Parameter Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-blue-50/50 text-gray-700 font-bold border-b border-gray-100">
                                            <tr>
                                                <th className="p-4 text-left border-l border-gray-100">Cluster</th>
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
                                            {paginatedItems.map((item, index) => (
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
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${(itemReadiness[item.id] ?? item.isReady) === true
                                                                    ? 'border-green-500 bg-green-50 text-green-500'
                                                                    : 'border-gray-300 text-gray-300'
                                                                    } ${worksheet?.status === 'APPROVED' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-green-400 hover:text-green-400'}`}
                                                                onClick={() => worksheet?.status !== 'APPROVED' && handleReadinessChange(item.id, true)}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex justify-center">
                                                            <div
                                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${(itemReadiness[item.id] ?? item.isReady) === false
                                                                    ? 'border-red-500 bg-red-50 text-red-500'
                                                                    : 'border-gray-300 text-gray-300'
                                                                    } ${worksheet?.status === 'APPROVED' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-red-400 hover:text-red-400'}`}
                                                                onClick={() => worksheet?.status !== 'APPROVED' && handleReadinessChange(item.id, false)}
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
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span className="text-sm font-medium">Previous</span>
                                        </button>
                                        <span className="text-sm font-medium text-gray-600">
                                            Halaman {currentPage} dari {totalPages}
                                        </span>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                                        >
                                            <span className="text-sm font-medium">Next</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                                    <button
                                        onClick={() => handleSubmit('APPROVED')}
                                        disabled={worksheet?.status === 'APPROVED'}
                                        className={`px-8 py-3 font-bold rounded-xl flex items-center gap-2 shadow-lg transition transform ${worksheet?.status === 'APPROVED'
                                            ? 'bg-green-200 text-green-800 cursor-not-allowed shadow-none scale-100'
                                            : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 hover:scale-105'
                                            }`}
                                    >
                                        <Save className="w-5 h-5" />
                                        {worksheet?.status === 'APPROVED' ? 'Disetujui' : 'Setujui & Simpan'}
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
