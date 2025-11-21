import React, { useState, useEffect, useContext } from "react";
import {
    Edit,
    Trash2,
    Atom,
    Plus,
    ArrowLeft,
    ArrowRight,
    Search,
    RefreshCw,
    Check,
    X
} from "lucide-react";
import { ContextApi } from '../Context/ContextApi';
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";
import { clusterService } from '../services/clusterService';

const ClusterPage = () => {
    const { user } = useContext(ContextApi);

    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;
    
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newData, setNewData] = useState({ name: '', description: '' });
    
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        loadClusters();
    }, []);

    const loadClusters = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await clusterService.getAllClusters();
            setClusters(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error:', err);
            setError('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const filteredClusters = clusters.filter(cluster => 
        cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cluster.description && cluster.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const totalPages = Math.ceil(filteredClusters.length / perPage);
    const currentClusters = filteredClusters.slice((page - 1) * perPage, page * perPage);
    
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleDoubleClick = (cluster, field) => {
        if (!isAdmin) return;
        setEditingId(cluster.id);
        setEditField(field);
        setEditValue(cluster[field] || '');
    };

    const handleSaveEdit = async (clusterId) => {
        try {
            const updateData = { [editField]: editValue };
            await clusterService.updateCluster(clusterId, updateData);
            setClusters(prev => prev.map(c => 
                c.id === clusterId ? {...c, [editField]: editValue} : c
            ));
            setEditingId(null);
            setEditField(null);
            setEditValue('');
        } catch (err) {
            console.error('Error:', err);
            alert('Gagal menyimpan data');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditField(null);
        setEditValue('');
    };

    const handleAddNew = async () => {
        if (!newData.name.trim()) {
            alert('Nama cluster wajib diisi');
            return;
        }

        try {
            const created = await clusterService.createCluster(newData);
            setClusters(prev => [created, ...prev]);
            setNewData({ name: '', description: '' });
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
            await clusterService.deleteCluster(id);
            setClusters(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menghapus data');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            <div className="flex">
                <aside className="bg-gradient-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar/>
                </aside>

                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <Atom className="w-8 h-8"/>
                            <span>Daftar Cluster</span>
                        </h2>
                        
                        <button
                            onClick={loadClusters}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}/>
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari cluster..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
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
                            <button onClick={loadClusters} className="ml-2 text-blue-600 underline">
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
                                            <th className="px-4 py-3 text-left">Nama Cluster</th>
                                            <th className="px-4 py-3 text-left">Deskripsi</th>
                                            <th className="px-4 py-3 text-center w-20">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentClusters.length > 0 ? currentClusters.map((cluster, index) => (
                                            <tr key={cluster.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center">{(page - 1) * perPage + index + 1}</td>
                                                <td className="px-3 py-2 font-medium cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(cluster, 'name')}>
                                                    {editingId === cluster.id && editField === 'name' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(cluster.id)}
                                                                className="text-green-600 hover:text-green-800 flex-shrink-0">
                                                                <Check className="w-4 h-4"/>
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0">
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{cluster.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(cluster, 'description')}>
                                                    {editingId === cluster.id && editField === 'description' ? (
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
                                                                    onClick={() => handleSaveEdit(cluster.id)}
                                                                    className="text-green-600 hover:text-green-800">
                                                                    <Check className="w-4 h-4"/>
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="text-red-600 hover:text-red-800">
                                                                    <X className="w-4 h-4"/>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="truncate block max-w-xs" title={cluster.description || ''}>
                                                            {cluster.description || '-'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(cluster.id, cluster.name)}
                                                            className="text-red-600 hover:text-red-800 p-1">
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-8 text-gray-500">
                                                    <Atom className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p>{searchTerm ? 'Tidak ada cluster yang sesuai' : 'Belum ada data cluster'}</p>
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
                                                        onChange={(e) => setNewData({...newData, name: e.target.value})}
                                                        placeholder="Nama cluster"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded"
                                                        autoFocus
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <textarea
                                                        value={newData.description}
                                                        onChange={(e) => setNewData({...newData, description: e.target.value})}
                                                        placeholder="Deskripsi"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-sm"
                                                        rows="2"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center space-x-1">
                                                    <button
                                                        onClick={handleAddNew}
                                                        className="text-green-600 hover:text-green-800 p-1">
                                                        <Check className="w-4 h-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingNew(false);
                                                            setNewData({ name: '', description: '' });
                                                        }}
                                                        className="text-red-600 hover:text-red-800 p-1">
                                                        <X className="w-4 h-4"/>
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
                                        <Plus className="w-4 h-4"/>
                                        
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 border-t">
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 flex items-center gap-1 rounded-md text-gray-700 hover:text-blue-500 disabled:opacity-50">
                                    <ArrowLeft className="w-4 h-4"/>Sebelumnya
                                </button>

                                <div className="flex items-center space-x-1">
                                    {Array.from({length: totalPages}).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-8 h-8 rounded-md text-sm font-medium ${
                                            page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 flex items-center gap-1 rounded-md text-gray-700 hover:text-blue-500 disabled:opacity-50">
                                    <ArrowRight className="w-4 h-4"/>Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ClusterPage;
