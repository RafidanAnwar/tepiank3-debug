import React, { useState, useEffect, useContext } from "react";
import {
    Trash2,
    Plus,
    Microscope,
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
import { jenisPengujianService } from '../../services/jenisPengujianService';
import { clusterService } from '../../services/clusterService';

const JenisPengujianPage = () => {
    const { user } = useContext(ContextApi);
    const [clusters, setClusters] = useState([]);
    const [pengujian, setPengujian] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCluster, setSelectedCluster] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // State untuk inline edit
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newData, setNewData] = useState({ name: '', description: '', clusterId: '' });

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        loadJenisPengujian();
        loadClusters();
    }, []);

    const loadClusters = async () => {
        try {
            const data = await clusterService.getAllClusters();
            setClusters(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading clusters:', error);
        }
    };

    const loadJenisPengujian = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await jenisPengujianService.getAllJenisPengujian();
            setPengujian(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading jenis pengujian:', err);
            if (err.response?.status === 403) {
                setError('Akses ditolak. Anda tidak memiliki izin.');
            } else {
                setError('Gagal memuat data jenis pengujian');
            }
        } finally {
            setLoading(false);
        }
    };

    // ======== Search, Filter & Pagination ========
    const filteredPengujian = pengujian.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCluster = !selectedCluster || item.clusterId === parseInt(selectedCluster);
        return matchesSearch && matchesCluster;
    });

    const totalPages = Math.max(1, Math.ceil(filteredPengujian.length / perPage));
    const currentPengujian = filteredPengujian.slice((page - 1) * perPage, page * perPage);

    // Reset page when search/filter changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCluster]);

    // ========================= HANDLER =========================
    const handleDoubleClick = (item, field) => {
        if (!isAdmin) return;
        setEditingId(item.id);
        setEditField(field);
        setEditValue(item[field] || '');
    };

    const handleSaveEdit = async (itemId) => {
        if (!isAdmin || !editingId || !editField) return;

        // Untuk field teks, jangan biarkan kosong
        if (editField !== 'clusterId' && !editValue.trim()) {
            alert('Field tidak boleh kosong');
            return;
        }

        try {
            const payload = {
                [editField]: editField === 'clusterId' ? parseInt(editValue) : editValue.trim(),
            };

            const updated = await jenisPengujianService.updateJenisPengujian(itemId, payload);
            setPengujian(prev => prev.map(item =>
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
            alert('Nama jenis pengujian wajib diisi');
            return;
        }
        if (!newData.clusterId) {
            alert('Cluster wajib dipilih');
            return;
        }

        try {
            const created = await jenisPengujianService.createJenisPengujian({
                name: newData.name.trim(),
                description: newData.description.trim() || null,
                clusterId: parseInt(newData.clusterId)
            });
            setPengujian(prev => [created, ...prev]);
            setNewData({ name: '', description: '', clusterId: '' });
            setIsAddingNew(false);
        } catch (err) {
            console.error('Error:', err);
            alert('Gagal menambah data');
        }
    };

    const handleDelete = async (id, name) => {
        if (!isAdmin) return;
        if (!window.confirm(`Yakin hapus "${name}"?`)) return;

        try {
            await jenisPengujianService.deleteJenisPengujian(id);
            setPengujian(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menghapus data');
        }
    };

    // ========================= RENDER UI =========================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* NAVBAR */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar />
            </header>

            {/* BODY */}
            <div className="flex">
                {/* SIDEBAR */}
                <aside
                    className="w-25 bg-gradient-to-tr from-blue-200 to-blue-600 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar />
                </aside>

                {/* MAIN CONTENT */}
                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <Microscope className="w-8 h-8" />
                            <span>Daftar Jenis Pengujian</span>
                        </h2>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={loadJenisPengujian}
                                disabled={loading}
                                className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50"
                                title="Refresh data"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari jenis pengujian..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedCluster}
                                onChange={(e) => setSelectedCluster(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="">Semua Cluster</option>
                                {clusters.map(cluster => (
                                    <option key={cluster.id} value={cluster.id}>
                                        {cluster.name}
                                    </option>
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
                            <button onClick={loadJenisPengujian} className="ml-2 text-blue-600 underline">
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
                                            <th className="px-4 py-3 text-left">Jenis Pengujian</th>
                                            <th className="px-4 py-3 text-left">Cluster</th>
                                            <th className="px-4 py-3 text-left">Deskripsi</th>
                                            <th className="px-4 py-3 text-center w-20">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPengujian.length > 0 ? currentPengujian.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center">{(page - 1) * perPage + index + 1}</td>
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
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(item, 'clusterId')}>
                                                    {editingId === item.id && editField === 'clusterId' ? (
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            >
                                                                {clusters.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                                ))}
                                                            </select>
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
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                            {item.cluster?.name || 'N/A'}
                                                        </span>
                                                    )}
                                                </td>
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
                                                        <span className="truncate block max-w-xs" title={item.description || ''}>
                                                            {item.description || '-'}
                                                        </span>
                                                    )}
                                                </td>
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
                                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                                    <Microscope className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p>{searchTerm || selectedCluster ? 'Tidak ada data yang sesuai filter' : 'Belum ada data jenis pengujian'}</p>
                                                </td>
                                            </tr>
                                        )}

                                        {isAddingNew && (
                                            <tr className="border-b border-gray-200 bg-blue-50">
                                                <td className="px-3 py-2 text-center">+</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.name}
                                                        onChange={(e) => setNewData({ ...newData, name: e.target.value })}
                                                        placeholder="Nama jenis pengujian"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                        autoFocus
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={newData.clusterId}
                                                        onChange={(e) => setNewData({ ...newData, clusterId: e.target.value })}
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                    >
                                                        <option value="">Pilih Cluster</option>
                                                        {clusters.map(cluster => (
                                                            <option key={cluster.id} value={cluster.id}>
                                                                {cluster.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <textarea
                                                        value={newData.description}
                                                        onChange={(e) => setNewData({ ...newData, description: e.target.value })}
                                                        placeholder="Deskripsi"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-sm"
                                                        rows="2"
                                                    />
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
                                                            setNewData({ name: '', description: '', clusterId: '' });
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

            {/* Chat Button */}
            {/* <button className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
                <MessageSquare className="w-6 h-6" />
            </button> */}
        </div>
    );
};

export default JenisPengujianPage;
