import React, { useState, useEffect, useContext } from "react";
import {
    Trash2,
    Plus,
    FlaskConical,
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
import { parameterService } from '../../services/parameterService';
import { clusterService } from '../../services/clusterService';
import { jenisPengujianService } from '../../services/jenisPengujianService';
import { peralatanService } from '../../services/peralatanService';

const ParameterPage = () => {
    const { user } = useContext(ContextApi);

    const [parameters, setParameters] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [jenisPengujian, setJenisPengujian] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCluster, setSelectedCluster] = useState('');
    const [selectedJenisPengujian, setSelectedJenisPengujian] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // State untuk inline edit
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newData, setNewData] = useState({
        name: '',
        satuan: '',
        acuan: '',
        harga: '',
        jenisPengujianId: ''
    });

    const isAdmin = user?.role === 'ADMIN';

    // Peralatan inline editor state
    const [peralatanList, setPeralatanList] = useState([]);
    const [editingPeralatanId, setEditingPeralatanId] = useState(null);
    const [editingPeralatanList, setEditingPeralatanList] = useState([]); // { peralatanId, quantity, peralatan, selected }

    useEffect(() => {
        loadParameters();
        loadClusters();
        loadAllJenisPengujian();
    }, []);

    const loadClusters = async () => {
        try {
            const data = await clusterService.getAllClusters();
            setClusters(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading clusters:', error);
        }
    };

    const loadAllJenisPengujian = async () => {
        try {
            const data = await jenisPengujianService.getAllJenisPengujian();
            setJenisPengujian(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading jenis pengujian:', error);
        }
    };

    const loadParameters = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await parameterService.getAllParameters();
            setParameters(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading parameters:', err);
            if (err.response?.status === 403) {
                setError('Akses ditolak. Anda tidak memiliki izin.');
            } else {
                setError('Gagal memuat data parameter');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadPeralatan = async () => {
        try {
            const data = await peralatanService.getAllPeralatan();
            setPeralatanList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load peralatan:', err);
        }
    };

    // ======== Search, Filter & Pagination ========
    const filteredParameters = parameters.filter(param => {
        const matchesSearch = param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (param.satuan && param.satuan.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (param.acuan && param.acuan.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCluster = !selectedCluster || param.jenisPengujian?.clusterId === parseInt(selectedCluster);
        const matchesJenisPengujian = !selectedJenisPengujian || param.jenisPengujianId === parseInt(selectedJenisPengujian);

        return matchesSearch && matchesCluster && matchesJenisPengujian;
    });

    const totalPages = Math.max(1, Math.ceil(filteredParameters.length / perPage));
    const currentParameters = filteredParameters.slice((page - 1) * perPage, page * perPage);

    // Reset page when search/filter changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCluster, selectedJenisPengujian]);

    // Filter jenis pengujian based on selected cluster
    const filteredJenisPengujian = selectedCluster
        ? jenisPengujian.filter(jp => jp.clusterId === parseInt(selectedCluster))
        : jenisPengujian;

    // ========================= HANDLER =========================
    const handleDoubleClick = (param, field) => {
        if (!isAdmin) return;
        setEditingId(param.id);
        setEditField(field);
        if (field === 'harga') {
            setEditValue(param.harga?.toString() || '');
        } else if (field === 'jenisPengujianId') {
            setEditValue(param.jenisPengujianId?.toString() || '');
        } else {
            setEditValue(param[field] || '');
        }
    };

    const handleSaveEdit = async (paramId) => {
        if (!isAdmin || !editingId || !editField) return;

        // Validation
        if (editField === 'name' && !editValue.trim()) {
            alert('Nama parameter tidak boleh kosong');
            return;
        }

        if (editField === 'harga') {
            const harga = parseFloat(editValue);
            if (isNaN(harga) || harga <= 0) {
                alert('Harga harus lebih dari 0');
                return;
            }
        }

        try {
            const payload = {};
            if (editField === 'harga') {
                payload[editField] = parseFloat(editValue);
            } else if (editField === 'jenisPengujianId') {
                payload[editField] = parseInt(editValue);
            } else {
                payload[editField] = editValue.trim();
            }

            const updated = await parameterService.updateParameter(paramId, payload);
            setParameters(prev => prev.map(item =>
                item.id === paramId ? { ...item, ...updated } : item
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
            alert('Nama parameter wajib diisi');
            return;
        }
        if (!newData.harga || parseFloat(newData.harga) <= 0) {
            alert('Harga wajib diisi dan lebih dari 0');
            return;
        }
        if (!newData.jenisPengujianId) {
            alert('Jenis pengujian wajib dipilih');
            return;
        }

        try {
            const created = await parameterService.createParameter({
                name: newData.name.trim(),
                satuan: newData.satuan.trim() || null,
                acuan: newData.acuan.trim() || null,
                harga: parseFloat(newData.harga),
                jenisPengujianId: parseInt(newData.jenisPengujianId)
            });
            setParameters(prev => [created, ...prev]);
            setNewData({ name: '', satuan: '', acuan: '', harga: '', jenisPengujianId: '' });
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
            await parameterService.deleteParameter(id);
            setParameters(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.error || 'Gagal menghapus data';
            alert(errorMsg);
        }
    };

    // ===== Peralatan inline editor handlers =====
    // Inline editor open
    const openInlinePeralatanEditor = async (param) => {
        if (peralatanList.length === 0) await loadPeralatan();
        const selMap = {};
        (param.parameterPeralatans || []).forEach(pp => { selMap[pp.peralatanId] = pp.quantity; });
        const list = peralatanList.map(p => ({
            peralatanId: p.id,
            quantity: selMap[p.id] || 1,
            peralatan: p,
            selected: !!selMap[p.id]
        }));
        setEditingPeralatanList(list);
        setEditingPeralatanId(param.id);
    };

    const toggleInlineSelect = (peralatanId) => {
        setEditingPeralatanList(prev => prev.map(x => x.peralatanId === peralatanId ? { ...x, selected: !x.selected } : x));
    };

    const setInlineQty = (peralatanId, qty) => {
        setEditingPeralatanList(prev => prev.map(x => x.peralatanId === peralatanId ? { ...x, quantity: Math.max(1, qty) } : x));
    };

    const saveInlinePeralatan = async (paramId) => {
        try {
            const peralatanPayload = editingPeralatanList.filter(x => x.selected).map(x => ({ peralatanId: x.peralatanId, quantity: x.quantity }));
            await parameterService.updateParameter(paramId, { peralatan: peralatanPayload });
            await loadParameters();
            setEditingPeralatanId(null);
            setEditingPeralatanList([]);
        } catch (err) {
            console.error('Failed to save inline peralatan:', err, err.response?.data);
            const serverMsg = err.response?.data?.error || err.response?.data?.message || null;
            alert(serverMsg ? `Gagal menyimpan peralatan: ${serverMsg}` : 'Gagal menyimpan peralatan (lihat console untuk detail)');
        }
    };

    const cancelInlinePeralatan = () => {
        setEditingPeralatanId(null);
        setEditingPeralatanList([]);
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
                            <FlaskConical className="w-8 h-8" />
                            <span>Daftar Parameter</span>
                        </h2>

                        <button
                            onClick={loadParameters}
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
                                placeholder="Cari parameter..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedCluster}
                                onChange={(e) => {
                                    setSelectedCluster(e.target.value);
                                    setSelectedJenisPengujian('');
                                }}
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

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedJenisPengujian}
                                onChange={(e) => setSelectedJenisPengujian(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="">Semua Jenis Pengujian</option>
                                {filteredJenisPengujian.map(jp => (
                                    <option key={jp.id} value={jp.id}>
                                        {jp.name}
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
                            <button onClick={loadParameters} className="ml-2 text-blue-600 underline">
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
                                            <th className="px-4 py-3 text-left">Nama Parameter</th>
                                            <th className="px-4 py-3 text-left">Satuan</th>
                                            <th className="px-4 py-3 text-left">Peralatan</th>
                                            <th className="px-4 py-3 text-left">Acuan</th>
                                            <th className="px-4 py-3 text-right">Harga</th>
                                            <th className="px-4 py-3 text-left">Jenis Pengujian</th>
                                            <th className="px-4 py-3 text-center w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentParameters.length > 0 ? currentParameters.map((param, index) => (
                                            <tr key={param.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center">{(page - 1) * perPage + index + 1}</td>
                                                <td className="px-3 py-2 font-medium cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(param, 'name')}>
                                                    {editingId === param.id && editField === 'name' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(param.id)}
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
                                                        <span>{param.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(param, 'satuan')}>
                                                    {editingId === param.id && editField === 'satuan' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(param.id)}
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
                                                        param.satuan ? (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                                {param.satuan}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-left" onDoubleClick={() => isAdmin && openInlinePeralatanEditor(param)}>
                                                    {editingPeralatanId === param.id ? (
                                                        <div className="space-y-2">
                                                            <div className="max-h-48 overflow-auto border rounded p-2 bg-gray-50">
                                                                {editingPeralatanList.map(item => (
                                                                    <div key={item.peralatanId} className="flex items-center justify-between gap-2 py-1">
                                                                        <label className="flex items-center gap-2">
                                                                            <input type="checkbox" checked={!!item.selected} onChange={() => toggleInlineSelect(item.peralatanId)} disabled={item.peralatan?.status !== 'AVAILABLE'} />
                                                                            <span className="text-sm">{item.peralatan?.name}</span>
                                                                            {item.peralatan?.status !== 'AVAILABLE' && (
                                                                                <span className="ml-2 text-xs text-red-500">({item.peralatan?.status})</span>
                                                                            )}
                                                                        </label>
                                                                        <div className="flex items-center gap-2">
                                                                            <input type="number" min="1" value={item.quantity} onChange={(e) => setInlineQty(item.peralatanId, parseInt(e.target.value || 1))} className="w-20 px-2 py-1 border rounded text-right" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => saveInlinePeralatan(param.id)} className="px-3 py-1 bg-green-600 text-white rounded">Simpan</button>
                                                                <button onClick={cancelInlinePeralatan} className="px-3 py-1 bg-gray-200 rounded">Batal</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        (param.parameterPeralatans && param.parameterPeralatans.length > 0) ? (
                                                            <div className="flex flex-col">
                                                                {param.parameterPeralatans.map(pp => (
                                                                    <div key={pp.id} className="text-sm text-gray-700">{pp.peralatan?.name} x{pp.quantity}</div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(param, 'acuan')}>
                                                    {editingId === param.id && editField === 'acuan' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(param.id)}
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
                                                        param.acuan ? (
                                                            <span className="truncate block max-w-xs" title={param.acuan}>
                                                                {param.acuan}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">-</span>
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-green-600 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(param, 'harga')}>
                                                    {editingId === param.id && editField === 'harga' ? (
                                                        <div className="flex gap-2 justify-end">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-32 px-2 py-1 border border-blue-500 rounded text-right"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(param.id)}
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
                                                        <span>Rp {Number(param.harga).toLocaleString("id-ID")}</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(param, 'jenisPengujianId')}>
                                                    {editingId === param.id && editField === 'jenisPengujianId' ? (
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            >
                                                                {filteredJenisPengujian.map(jp => (
                                                                    <option key={jp.id} value={jp.id}>
                                                                        {jp.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => handleSaveEdit(param.id)}
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
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                            {param.jenisPengujian?.name || 'N/A'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDelete(param.id, param.name)}
                                                                className="text-red-600 hover:text-red-800 p-1">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-8 text-gray-500">
                                                    <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p>{searchTerm || selectedCluster || selectedJenisPengujian ? 'Tidak ada data yang sesuai filter' : 'Belum ada data parameter'}</p>
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
                                                        placeholder="Nama parameter"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                        autoFocus
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.satuan}
                                                        onChange={(e) => setNewData({ ...newData, satuan: e.target.value })}
                                                        placeholder="Satuan"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.acuan}
                                                        onChange={(e) => setNewData({ ...newData, acuan: e.target.value })}
                                                        placeholder="Acuan"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={newData.harga}
                                                        onChange={(e) => setNewData({ ...newData, harga: e.target.value })}
                                                        placeholder="Harga"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-right"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={newData.jenisPengujianId}
                                                        onChange={(e) => setNewData({ ...newData, jenisPengujianId: e.target.value })}
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                    >
                                                        <option value="">Pilih Jenis Pengujian</option>
                                                        {filteredJenisPengujian.map(jp => (
                                                            <option key={jp.id} value={jp.id}>
                                                                {jp.name}
                                                            </option>
                                                        ))}
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
                                                            setNewData({ name: '', satuan: '', acuan: '', harga: '', jenisPengujianId: '' });
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

export default ParameterPage;
