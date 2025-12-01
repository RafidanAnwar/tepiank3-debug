import React, {useState, useEffect, useContext} from "react";
import {Trash2, Plus, UserRoundPen, ArrowLeft, ArrowRight, Search, RefreshCw, Filter, Check, X} from "lucide-react";
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";
import { userService } from '../services/userService';
import { ContextApi } from '../Context/ContextApi';

const DataUser = () => {
    const { user } = useContext(ContextApi);
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // State untuk inline edit
    const [editingId, setEditingId] = useState(null);
    const [editField, setEditField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newData, setNewData] = useState({ 
        email: '', 
        firstname: '', 
        fullname: '', 
        password: '',
        role: 'USER'
    });
    
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading users:', err);
            if (err.response?.status === 403) {
                setError('Akses ditolak. Anda tidak memiliki izin admin.');
            } else if (err.response?.status === 401) {
                setError('Sesi telah berakhir. Silakan login kembali.');
            } else {
                setError('Gagal memuat data pengguna');
            }
        } finally {
            setLoading(false);
        }
    };

    // ======== Search, Filter & Pagination ========
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.firstname && u.firstname.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRole = !roleFilter || u.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));
    const currentUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, roleFilter]);

    // Jika bukan admin, tampilkan pesan error
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <Navbar/>
                </header>
                <div className="flex">
                    <aside className="bg-linear-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                        <Sidebar/>
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
    const handleDoubleClick = (u, field) => {
        if (!isAdmin) return;
        setEditingId(u.id);
        setEditField(field);
        setEditValue(u[field] || '');
    };

    const handleSaveEdit = async (userId) => {
        if (!isAdmin || !editingId || !editField) return;

        // Validation
        if (editField === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(editValue)) {
                alert('Email tidak valid');
                return;
            }
        }

        if (editField === 'fullname' && !editValue.trim()) {
            alert('Nama lengkap tidak boleh kosong');
            return;
        }

        if (editField === 'role' && !['USER', 'ADMIN'].includes(editValue)) {
            alert('Role tidak valid');
            return;
        }

        try {
            const payload = {};
            if (editField === 'role') {
                payload[editField] = editValue;
            } else {
                payload[editField] = editValue.trim();
            }

            const updated = await userService.updateUser(userId, payload);
            setUsers(prev => prev.map(item => 
                item.id === userId ? { ...item, ...updated } : item
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
        if (!newData.email.trim()) {
            alert('Email wajib diisi');
            return;
        }
        if (!newData.fullname.trim()) {
            alert('Nama lengkap wajib diisi');
            return;
        }
        if (!newData.password.trim()) {
            alert('Password wajib diisi');
            return;
        }

        try {
            const created = await userService.createUser({
                email: newData.email.trim(),
                firstname: newData.firstname.trim() || newData.fullname.split(' ')[0],
                fullname: newData.fullname.trim(),
                password: newData.password,
                role: newData.role
            });
            setUsers(prev => [created, ...prev]);
            setNewData({ email: '', firstname: '', fullname: '', password: '', role: 'USER' });
            setIsAddingNew(false);
        } catch (err) {
            console.error('Error:', err);
            const errorMsg = err.response?.data?.error || 'Gagal menambah data';
            alert(errorMsg);
        }
    };

    const handleDelete = async (id, name) => {
        if (!isAdmin) return;
        
        // Prevent admin from deleting themselves
        if (user?.id === id) {
            alert('Anda tidak dapat menghapus akun sendiri');
            return;
        }
        
        if (!window.confirm(`Yakin hapus "${name}"?`)) return;
        
        try {
            await userService.deleteUser(id);
            setUsers(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.error || 'Gagal menghapus data';
            alert(errorMsg);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800';
            case 'USER': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            <div className="flex">
                <aside className="bg-linear-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar/>
                </aside>

                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <UserRoundPen className="w-8 h-8"/>
                            <span>Daftar User</span>
                        </h2>
                        
                        <button
                            onClick={loadUsers}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}/>
                        </button>
                    </div>
                    
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="">Semua Role</option>
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
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
                            <button onClick={loadUsers} className="ml-2 text-blue-600 underline">
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
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">Nama Lengkap</th>
                                            <th className="px-4 py-3 text-left">Role</th>
                                            <th className="px-4 py-3 text-left">Tanggal Dibuat</th>
                                            <th className="px-4 py-3 text-center w-20">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.length > 0 ? currentUsers.map((u, index) => (
                                            <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center">{(page - 1) * perPage + index + 1}</td>
                                                
                                                {/* Email */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(u, 'email')}>
                                                    {editingId === u.id && editField === 'email' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="email"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(u.id)}
                                                                className="text-green-600 hover:text-green-800 shrink-0">
                                                                <Check className="w-4 h-4"/>
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 shrink-0">
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{u.email}</span>
                                                    )}
                                                </td>
                                                
                                                {/* Nama Lengkap */}
                                                <td className="px-3 py-2 font-medium cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(u, 'fullname')}>
                                                    {editingId === u.id && editField === 'fullname' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(u.id)}
                                                                className="text-green-600 hover:text-green-800 shrink-0">
                                                                <Check className="w-4 h-4"/>
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 shrink-0">
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span>{u.fullname}</span>
                                                    )}
                                                </td>
                                                
                                                {/* Role */}
                                                <td className="px-3 py-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                                                    onDoubleClick={() => handleDoubleClick(u, 'role')}>
                                                    {editingId === u.id && editField === 'role' ? (
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="flex-1 px-2 py-1 border border-blue-500 rounded"
                                                                autoFocus
                                                            >
                                                                <option value="USER">User</option>
                                                                <option value="ADMIN">Admin</option>
                                                            </select>
                                                            <button
                                                                onClick={() => handleSaveEdit(u.id)}
                                                                className="text-green-600 hover:text-green-800 shrink-0">
                                                                <Check className="w-4 h-4"/>
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-red-600 hover:text-red-800 shrink-0">
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(u.role)}`}>
                                                            {u.role}
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                {/* Tanggal Dibuat */}
                                                <td className="px-3 py-2 text-gray-600">
                                                    {new Date(u.createdAt).toLocaleDateString('id-ID')}
                                                </td>
                                                
                                                {/* Aksi */}
                                                <td className="px-3 py-2 text-center">
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(u.id, u.fullname)}
                                                            className="text-red-600 hover:text-red-800 p-1">
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                                    <UserRoundPen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p>{searchTerm || roleFilter ? 'Tidak ada data yang sesuai filter' : 'Belum ada data user'}</p>
                                                </td>
                                            </tr>
                                        )}

                                        {isAddingNew && (
                                            <tr className="border-b border-gray-200 bg-blue-50">
                                                <td className="px-3 py-2 text-center">+</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="email"
                                                        value={newData.email}
                                                        onChange={(e) => setNewData({...newData, email: e.target.value})}
                                                        placeholder="Email"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                        autoFocus
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={newData.fullname}
                                                        onChange={(e) => setNewData({...newData, fullname: e.target.value})}
                                                        placeholder="Nama Lengkap"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="password"
                                                        value={newData.password}
                                                        onChange={(e) => setNewData({...newData, password: e.target.value})}
                                                        placeholder="Password"
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={newData.role}
                                                        onChange={(e) => setNewData({...newData, role: e.target.value})}
                                                        className="w-full px-2 py-1 border border-blue-500 rounded text-xs"
                                                    >
                                                        <option value="USER">User</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
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
                                                            setNewData({ email: '', firstname: '', fullname: '', password: '', role: 'USER' });
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

export default DataUser;
