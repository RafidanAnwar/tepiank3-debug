import React, { useState, useEffect, useContext } from "react";
import {
    Trash2,
    Plus,
    UserCog,
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
import { pegawaiService } from '../../services/pegawaiService';

const PersonalisasiPage = () => {
    const { user } = useContext(ContextApi);

    const [pegawai, setPegawai] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk inline edit
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newData, setNewData] = useState({
        nama: '',
        jabatan: '',
        status: 'SIAP'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [page, setPage] = useState(1);
    const perPage = 10;

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        loadPegawai();
    }, []);

    const loadPegawai = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await pegawaiService.getAllPegawai();
            setPegawai(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading pegawai:', err);
            if (err.response?.status === 403) {
                setError('Akses ditolak. Anda tidak memiliki izin.');
            } else {
                setError('Gagal memuat data pegawai');
            }
        } finally {
            setLoading(false);
        }
    };

    // ======== Search, Filter & Pagination ========
    const filteredPegawai = pegawai.filter(p => {
        const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.jabatan && p.jabatan.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = !statusFilter || p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredPegawai.length / perPage));
    const currentPegawai = filteredPegawai.slice((page - 1) * perPage, page * perPage);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter]);

    // Jika bukan admin, tampilkan pesan error
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <Navbar />
                </header>
                <div className="flex">
                    <aside className="bg-linear-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                        <Sidebar />
                    </aside>
                    <main className="max-w-7xl mx-auto flex-1 p-6">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <h3 className="font-bold">Akses Ditolak</h3>
                            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // ========================= HANDLER =========================
    const handleDoubleClick = (p, field) => {
        setEditingId(p.id);
        setEditField(field);
        setEditValue(p[field] || '');
    };

    const handleSaveEdit = async (pegawaiId) => {
        if (!editingId || !editField) return;

        // Validation
        if (editField === 'nama' && !editValue.trim()) {
            alert('Nama pegawai tidak boleh kosong');
            return;
        }
        if (editField === 'jabatan' && !editValue.trim()) {
            alert('Jabatan tidak boleh kosong');
            return;
        }
        if (editField === 'status' && !['SIAP', 'SPT', 'STANDBY', 'CUTI'].includes(editValue.toUpperCase())) {
            alert('Status tidak valid');
            return;
        }

        try {
            const payload = {};
            if (editField === 'status') {
                payload[editField] = editValue.toUpperCase();
            } else {
                payload[editField] = editValue.trim();
            }

            const updated = await pegawaiService.updatePegawai(pegawaiId, payload);
            setPegawai(prev => prev.map(item =>
                item.id === pegawaiId ? { ...item, ...updated } : item
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
        if (!newData.nama.trim()) {
            alert('Nama pegawai wajib diisi');
            return;
        }
        if (!newData.jabatan.trim()) {
            alert('Jabatan wajib diisi');
            return;
        }

        try {
            const created = await pegawaiService.createPegawai({
                nama: newData.nama.trim(),
                jabatan: newData.jabatan.trim(),
                status: newData.status.toUpperCase()
            });
            setPegawai(prev => [created, ...prev]);
            setNewData({ nama: '', jabatan: '', status: 'SIAP' });
            setIsAddingNew(false);
        } catch (err) {
            console.error('Error:', err);
            const errorMsg = err.response?.data?.error || 'Gagal menambah data';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Yakin hapus "${nama}"?`)) return;

        try {
            await pegawaiService.deletePegawai(id);
            setPegawai(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.error || 'Gagal menghapus data';
            alert(errorMsg);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SIAP': return 'bg-green-100 text-green-800';
            case 'STANDBY': return 'bg-blue-100 text-blue-800';
            case 'SPT': return 'bg-orange-100 text-orange-800';
            case 'CUTI': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const statusLabel = (status) => {
        const labels = {
            'SIAP': 'Siap',
            'SPT': 'SPT',
            'STANDBY': 'Standby',
            'CUTI': 'Cuti'
        };
        return labels[status] || status;
    };

    // ========================= RENDER UI =========================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* NAVBAR */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar />
            </header>

            <div className="flex">
                {/* SIDEBAR */}
                <aside className="bg-linear-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar />
                </aside>

                {/* MAIN CONTENT */}
                <main className="max-w-7xl mx-auto flex-1 p-6">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <UserCog className="w-8 h-8" />
                            <span>Data Personalisasi</span>
                        </h2>

                        <button
                            onClick={loadPegawai}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari pegawai..."
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
                                <option value="SIAP">Siap</option>
                                <option value="SPT">SPT</option>
                                <option value="STANDBY">Standby</option>
                                <option value="CUTI">Cuti</option>
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
                            <button onClick={loadPegawai} className="ml-2 text-blue-600 underline">
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="bg-white rounded-2xl shadow-lg">
                            <div className="overflow-x-auto rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-linear-to-br from-blue-200 to-cyan-100">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-16">No</th>
                                            <th className="px-4 py-3 text-left">Nama Pegawai</th>
                                            <th className="px-4 py-3 text-left">Jabatan</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-center w-20">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPegawai.length > 0 ? currentPegawai.map((data, index) => (
                                            <tr key={data.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center">{(page - 1) * perPage + index + 1}</td>

                                                {/* Nama */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(data, 'nama')}>
                                                    {editingId === data.id && editField === 'nama' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(data.id)}
                                                                className="text-green-600 hover:text-green-800 shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{data.nama}</span>
                                                    )}
                                                </td>

                                                {/* Jabatan */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(data, 'jabatan')}>
                                                    {editingId === data.id && editField === 'jabatan' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(data.id)}
                                                                className="text-green-600 hover:text-green-800 shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{data.jabatan}</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-2 text-center cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(data, 'status')}>
                                                    {editingId === data.id && editField === 'status' ? (
                                                        <div className="flex gap-2 justify-center">
                                                            <select
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded text-xs"
                                                                autoFocus
                                                            >
                                                                <option value="SIAP">Siap</option>
                                                                <option value="SPT">SPT</option>
                                                                <option value="STANDBY">Standby</option>
                                                                <option value="CUTI">Cuti</option>
                                                            </select>
                                                            <button
                                                                onClick={() => handleSaveEdit(data.id)}
                                                                className="text-green-600 hover:text-green-800 shrink-0">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 shrink-0">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                                                            {statusLabel(data.status)}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => handleDelete(data.id, data.nama)}
                                                        className="text-red-600 hover:text-red-800 p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                                    <UserCog className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p>{searchTerm || statusFilter ? 'Tidak ada data yang sesuai filter' : 'Belum ada data pegawai'}</p>
                                                </td>
                                            </tr>
                                        )}

                                        {isAddingNew && (
                                            <tr className="border-b border-gray-200 bg-blue-50">
                                                <td className="px-3 py-2 text-center">+</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.nama}
                                                        onChange={(e) => setNewData({ ...newData, nama: e.target.value })}
                                                        placeholder="Nama pegawai"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                        autoFocus
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.jabatan}
                                                        onChange={(e) => setNewData({ ...newData, jabatan: e.target.value })}
                                                        placeholder="Jabatan"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <select
                                                        value={newData.status}
                                                        onChange={(e) => setNewData({ ...newData, status: e.target.value })}
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    >
                                                        <option value="SIAP">Siap</option>
                                                        <option value="SPT">SPT</option>
                                                        <option value="STANDBY">Standby</option>
                                                        <option value="CUTI">Cuti</option>
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
                                                            setNewData({ nama: '', jabatan: '', status: 'SIAP' });
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

                            {!isAddingNew && (
                                <div className="p-4 flex justify-end">
                                    <button
                                        onClick={() => setIsAddingNew(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* ======== PAGINATION ======== */}
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

export default PersonalisasiPage;
