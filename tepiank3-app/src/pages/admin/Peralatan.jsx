import React, { useState, useEffect, useContext } from "react";
import {
    Trash2,
    Plus,
    Pipette,
    ArrowLeft,
    ArrowRight,
    Search,
    RefreshCw,
    Filter,
    Check,
    X
} from "lucide-react";
import { ContextApi } from '../../context/ContextApi';
import Sidebar from '../../components/layout/SideBar.jsx';
import Navbar from '../../components/layout/NavBar.jsx';
import { peralatanService } from '../../services/peralatanService';

const PeralatanPage = () => {
    const { user } = useContext(ContextApi);

    const [peralatan, setPeralatan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [merkFilter, setMerkFilter] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // State untuk inline edit
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newData, setNewData] = useState({
        nomorAlat: '',
        name: '',
        description: '',
        status: 'AVAILABLE',
        merk: '',
        tipe: '',
        nomorSeri: '',
        kodeBMN: '',
        nup: '',
        waktuPengadaan: '',
        lokasiPenyimpanan: '',
        tanggalKalibrasi: '',
        koreksi: ''
    });

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        loadPeralatan();
    }, []);

    const loadPeralatan = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await peralatanService.getAllPeralatan();
            setPeralatan(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading peralatan:', err);
            if (err.response?.status === 403) {
                setError('Akses ditolak. Anda tidak memiliki izin.');
            } else {
                setError('Gagal memuat data peralatan');
            }
        } finally {
            setLoading(false);
        }
    };

    // ======== Search, Filter & Pagination ========
    const filteredPeralatan = peralatan.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.merk && item.merk.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = !statusFilter || item.status === statusFilter;
        const matchesMerk = !merkFilter || item.merk === merkFilter;

        return matchesSearch && matchesStatus && matchesMerk;
    });

    const totalPages = Math.max(1, Math.ceil(filteredPeralatan.length / perPage));
    const currentPeralatan = filteredPeralatan.slice((page - 1) * perPage, page * perPage);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, merkFilter]);

    // Get unique merks for filter
    const uniqueMerks = [...new Set(peralatan.map(item => item.merk).filter(Boolean))];

    // ========================= HANDLER =========================
    const handleDoubleClick = (item, field) => {
        if (!isAdmin) return;
        setEditingId(item.id);
        setEditField(field);
        if (field === 'waktuPengadaan' || field === 'tanggalKalibrasi') {
            // Format date for input
            const date = item[field] ? new Date(item[field]).toISOString().split('T')[0] : '';
            setEditValue(date);
        } else {
            setEditValue(item[field] || '');
        }
    };

    const handleSaveEdit = async (itemId) => {
        if (!isAdmin || !editingId || !editField) return;

        // Validation
        if (editField === 'name' && !editValue.trim()) {
            alert('Nama peralatan tidak boleh kosong');
            return;
        }

        try {
            let payload = {};
            if (editField === 'waktuPengadaan' || editField === 'tanggalKalibrasi') {
                payload[editField] = editValue ? new Date(editValue).toISOString() : null;
            } else {
                payload[editField] = editValue.trim() || null;
            }

            const updated = await peralatanService.updatePeralatan(itemId, payload);
            setPeralatan(prev => prev.map(item =>
                item.id === itemId ? { ...item, ...updated } : item
            ));
            setEditingId(null);
            setEditField(null);
            setEditValue('');
        } catch (err) {
            console.error('Error:', err);
            const errorMsg = err.response?.data?.error || 'Gagal menyimpan data';
            alert(errorMsg);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditField(null);
        setEditValue('');
    };

    const handleAddNew = async () => {
        if (!newData.name.trim()) {
            alert('Nama peralatan wajib diisi');
            return;
        }

        try {
            const created = await peralatanService.createPeralatan({
                nomorAlat: newData.nomorAlat.trim() || null,
                name: newData.name.trim(),
                description: newData.description.trim() || null,
                status: newData.status,
                merk: newData.merk.trim() || null,
                tipe: newData.tipe.trim() || null,
                nomorSeri: newData.nomorSeri.trim() || null,
                kodeBMN: newData.kodeBMN.trim() || null,
                nup: newData.nup.trim() || null,
                waktuPengadaan: newData.waktuPengadaan ? new Date(newData.waktuPengadaan).toISOString() : null,
                lokasiPenyimpanan: newData.lokasiPenyimpanan.trim() || null,
                tanggalKalibrasi: newData.tanggalKalibrasi ? new Date(newData.tanggalKalibrasi).toISOString() : null,
                koreksi: newData.koreksi.trim() || null
            });
            setPeralatan(prev => [created, ...prev]);
            setNewData({
                nomorAlat: '',
                name: '',
                description: '',
                status: 'AVAILABLE',
                merk: '',
                tipe: '',
                nomorSeri: '',
                kodeBMN: '',
                nup: '',
                waktuPengadaan: '',
                lokasiPenyimpanan: '',
                tanggalKalibrasi: '',
                koreksi: ''
            });
            setIsAddingNew(false);
        } catch (err) {
            console.error('Error:', err);
            const errorMsg = err.response?.data?.error || 'Gagal menambah data';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id, name) => {
        if (!isAdmin) return;
        if (!window.confirm(`Yakin hapus "${name}"?`)) return;

        try {
            await peralatanService.deletePeralatan(id);
            setPeralatan(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.error || 'Gagal menghapus data';
            alert(errorMsg);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (!isAdmin) return;
        try {
            const updated = await peralatanService.updatePeralatan(id, { status: newStatus });
            setPeralatan(prev => prev.map(item =>
                item.id === id ? { ...item, ...updated } : item
            ));
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal mengubah status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-800';
            case 'IN_USE': return 'bg-blue-100 text-blue-800';
            case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
            case 'DAMAGED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'Tersedia';
            case 'IN_USE': return 'Digunakan';
            case 'MAINTENANCE': return 'Maintenance';
            case 'DAMAGED': return 'Rusak';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID');
        } catch {
            return '-';
        }
    };

    // ========================= RENDER UI =========================
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar />
            </header>

            <div className="flex">
                <aside className="bg-gradient-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar />
                </aside>

                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <Pipette className="w-8 h-8" />
                            <span>Daftar Peralatan</span>
                        </h2>

                        <button
                            onClick={loadPeralatan}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari peralatan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="">Semua Status</option>
                                <option value="AVAILABLE">Tersedia</option>
                                <option value="IN_USE">Sedang Digunakan</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="DAMAGED">Rusak</option>
                            </select>
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={merkFilter}
                                onChange={(e) => setMerkFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="">Semua Merk</option>
                                {uniqueMerks.map(merk => (
                                    <option key={merk} value={merk}>{merk}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Memuat data...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                            <button onClick={loadPeralatan} className="ml-2 text-blue-600 underline">
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="bg-white rounded-2xl shadow-lg">
                            <div className="overflow-x-auto rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-16">No</th>
                                            <th className="px-4 py-3 text-left">Nomor Alat</th>
                                            <th className="px-4 py-3 text-left">Nama</th>
                                            <th className="px-4 py-3 text-left">Fungsi</th>
                                            <th className="px-4 py-3 text-left">Merk</th>
                                            <th className="px-4 py-3 text-left">Tipe</th>
                                            <th className="px-4 py-3 text-left">Nomor Seri</th>
                                            <th className="px-4 py-3 text-left">Kode BMN</th>
                                            <th className="px-4 py-3 text-left">NUP</th>
                                            <th className="px-4 py-3 text-left">Waktu Pengadaan</th>
                                            <th className="px-4 py-3 text-left">Lokasi Penyimpanan</th>
                                            <th className="px-4 py-3 text-left">Kalibrasi Terakhir</th>
                                            <th className="px-4 py-3 text-left">Koreksi</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-center w-20">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPeralatan.length > 0 ? currentPeralatan.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center">{(page - 1) * perPage + index + 1}</td>

                                                {/* Nomor Alat */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'nomorAlat')}>
                                                    {editingId === item.id && editField === 'nomorAlat' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{item.nomorAlat || '-'}</span>
                                                    )}
                                                </td>

                                                {/* Nama */}
                                                <td className="px-3 py-2 font-medium cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'name')}>
                                                    {editingId === item.id && editField === 'name' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{item.name}</span>
                                                    )}
                                                </td>

                                                {/* Fungsi/Description */}
                                                <td className="px-3 py-2 text-gray-600 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'description')}>
                                                    {editingId === item.id && editField === 'description' ? (
                                                        <div className="flex gap-2">
                                                            <textarea
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm"
                                                                rows="2"
                                                                autoFocus
                                                            />
                                                            <div className="flex flex-col gap-1 flex-shrink-0">
                                                                <button
                                                                    onClick={() => handleSaveEdit(item.id)}
                                                                    className="text-green-600 hover:text-green-800">
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="text-red-600 hover:text-red-800">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        item.description ? (
                                                            <span className="truncate block max-w-xs" title={item.description}>
                                                                {item.description}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )
                                                    )}
                                                </td>

                                                {/* Merk */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'merk')}>
                                                    {editingId === item.id && editField === 'merk' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        item.merk ? (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                                {item.merk}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )
                                                    )}
                                                </td>

                                                {/* Tipe */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'tipe')}>
                                                    {editingId === item.id && editField === 'tipe' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{item.tipe || '-'}</span>
                                                    )}
                                                </td>

                                                {/* Nomor Seri */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'nomorSeri')}>
                                                    {editingId === item.id && editField === 'nomorSeri' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{item.nomorSeri || '-'}</span>
                                                    )}
                                                </td>

                                                {/* Kode BMN */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'kodeBMN')}>
                                                    {editingId === item.id && editField === 'kodeBMN' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{item.kodeBMN || '-'}</span>
                                                    )}
                                                </td>

                                                {/* NUP */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'nup')}>
                                                    {editingId === item.id && editField === 'nup' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{item.nup || '-'}</span>
                                                    )}
                                                </td>

                                                {/* Waktu Pengadaan */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'waktuPengadaan')}>
                                                    {editingId === item.id && editField === 'waktuPengadaan' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="date"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{formatDate(item.waktuPengadaan)}</span>
                                                    )}
                                                </td>

                                                {/* Lokasi Penyimpanan */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'lokasiPenyimpanan')}>
                                                    {editingId === item.id && editField === 'lokasiPenyimpanan' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        item.lokasiPenyimpanan ? (
                                                            <span className="truncate block max-w-xs" title={item.lokasiPenyimpanan}>
                                                                {item.lokasiPenyimpanan}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )
                                                    )}
                                                </td>

                                                {/* Kalibrasi Terakhir */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'tanggalKalibrasi')}>
                                                    {editingId === item.id && editField === 'tanggalKalibrasi' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="date"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{formatDate(item.tanggalKalibrasi)}</span>
                                                    )}
                                                </td>

                                                {/* Koreksi */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'koreksi')}>
                                                    {editingId === item.id && editField === 'koreksi' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(item.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{item.koreksi || '-'}</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-2">
                                                    {isAdmin ? (
                                                        <select
                                                            value={item.status}
                                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                            className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getStatusColor(item.status)}`}
                                                        >
                                                            <option value="AVAILABLE">Tersedia</option>
                                                            <option value="IN_USE">Digunakan</option>
                                                            <option value="MAINTENANCE">Maintenance</option>
                                                            <option value="DAMAGED">Rusak</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                                            {getStatusLabel(item.status)}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-3 py-2 text-center">
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.name)}
                                                            className="text-red-600 hover:text-red-800 p-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="15" className="text-center py-8 text-gray-500">
                                                    <Pipette className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p>{searchTerm || statusFilter || merkFilter ? 'Tidak ada data yang sesuai filter' : 'Belum ada data peralatan'}</p>
                                                </td>
                                            </tr>
                                        )}

                                        {isAddingNew && (
                                            <tr className="border-b border-gray-200 bg-blue-50">
                                                <td className="px-3 py-2 text-center">+</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.nomorAlat}
                                                        onChange={(e) => setNewData({ ...newData, nomorAlat: e.target.value })}
                                                        placeholder="Nomor Alat"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.name}
                                                        onChange={(e) => setNewData({ ...newData, name: e.target.value })}
                                                        placeholder="Nama peralatan *"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                        autoFocus
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <textarea
                                                        value={newData.description}
                                                        onChange={(e) => setNewData({ ...newData, description: e.target.value })}
                                                        placeholder="Fungsi"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                        rows="2"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.merk}
                                                        onChange={(e) => setNewData({ ...newData, merk: e.target.value })}
                                                        placeholder="Merk"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.tipe}
                                                        onChange={(e) => setNewData({ ...newData, tipe: e.target.value })}
                                                        placeholder="Tipe"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.nomorSeri}
                                                        onChange={(e) => setNewData({ ...newData, nomorSeri: e.target.value })}
                                                        placeholder="Nomor Seri"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.kodeBMN}
                                                        onChange={(e) => setNewData({ ...newData, kodeBMN: e.target.value })}
                                                        placeholder="Kode BMN"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.nup}
                                                        onChange={(e) => setNewData({ ...newData, nup: e.target.value })}
                                                        placeholder="NUP"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="date"
                                                        value={newData.waktuPengadaan}
                                                        onChange={(e) => setNewData({ ...newData, waktuPengadaan: e.target.value })}
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.lokasiPenyimpanan}
                                                        onChange={(e) => setNewData({ ...newData, lokasiPenyimpanan: e.target.value })}
                                                        placeholder="Lokasi"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="date"
                                                        value={newData.tanggalKalibrasi}
                                                        onChange={(e) => setNewData({ ...newData, tanggalKalibrasi: e.target.value })}
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.koreksi}
                                                        onChange={(e) => setNewData({ ...newData, koreksi: e.target.value })}
                                                        placeholder="Koreksi"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={newData.status}
                                                        onChange={(e) => setNewData({ ...newData, status: e.target.value })}
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    >
                                                        <option value="AVAILABLE">Tersedia</option>
                                                        <option value="IN_USE">Digunakan</option>
                                                        <option value="MAINTENANCE">Maintenance</option>
                                                        <option value="DAMAGED">Rusak</option>
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2 text-center space-x-1">
                                                    <button
                                                        onClick={handleAddNew}
                                                        className="text-green-600 hover:text-green-800 p-1">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingNew(false);
                                                            setNewData({
                                                                nomorAlat: '',
                                                                name: '',
                                                                description: '',
                                                                status: 'AVAILABLE',
                                                                merk: '',
                                                                tipe: '',
                                                                nomorSeri: '',
                                                                kodeBMN: '',
                                                                nup: '',
                                                                waktuPengadaan: '',
                                                                lokasiPenyimpanan: '',
                                                                tanggalKalibrasi: '',
                                                                koreksi: ''
                                                            });
                                                        }}
                                                        className="text-red-600 hover:text-red-800 p-1">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {!isAddingNew && isAdmin && (
                                <div className="p-4 flex justify-end">
                                    <button
                                        onClick={() => setIsAddingNew(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 border-t">
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 flex items-center gap-1 rounded-md text-gray-700 hover:text-blue-500 disabled:opacity-50">
                                    <ArrowLeft className="w-4 h-4" />Sebelumnya
                                </button>

                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-8 h-8 rounded-md text-sm font-medium ${page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 flex items-center gap-1 rounded-md text-gray-700 hover:text-blue-500 disabled:opacity-50">
                                    <ArrowRight className="w-4 h-4" />Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PeralatanPage;
