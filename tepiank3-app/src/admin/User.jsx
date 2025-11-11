import React, {useState, useEffect} from "react";
import {ArrowLeft, ArrowRight, UserRoundPen} from "lucide-react";
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";
import {Trash2, Edit, Check, X} from "lucide-react";

const DataUser = () => {
    // ======== Data Dummy User ========
    const [users, setUsers] = useState(Array.from({
        length: 37
    }, (_, i) => ({
        id: i + 1,
        nama: `User ${i + 1}`,
        tanggal: `2025-10-${String((i % 30) + 1).padStart(2, "0")}`,
        role: i % 3 === 0
            ? "Admin"
            : "Pengguna"
    })));

    // ======== Pagination ========
    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(users.length / perPage);
    const currentUsers = users.slice((page - 1) * perPage, page * perPage);

    // ======== Edit Role State ========
    const [editId, setEditId] = useState(null);
    const [newRole, setNewRole] = useState("");

    // ======== Handle Simpan Role ========
    const handleSave = (id) => {
        setUsers((prev) => prev.map(
            (user) => user.id === id
                ? {
                    ...user,
                    role: newRole || user.role
                }
                : user
        ));
        setEditId(null);
        setNewRole("");
    };

        const handleDelete = (id) => {
        const confirmDelete = window.confirm("Yakin ingin menghapus data?");
        if (confirmDelete) {
            setUsers(users.filter((item) => item.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 ">
            {/* NAVBAR */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            {/* === BODY === */}
            <div className="flex">
                {/* SIDEBAR */}
                <aside
                    className="w-25 bg-gradient-to-tr from-blue-200 to-blue-600 shadow-lg p-2 min-h-screen flex flex-col justify-between ">
                    <Sidebar/>
                </aside>
                {/* MAIN CONTENT */}
                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <h2
                        className="text-xl font-bold text-blue-600 mb-4 flex items-center space-x-2">
                        <span className="w-8 h-8 flex items-center justify-center ">
                            <UserRoundPen className="w-10 h-10" />
                        </span>
                        <span>Data User</span>
                    </h2>
                    <div className="bg-white backdrop-blur-md w-full rounded-2xl shadow-lg ">
                        {/* ======== TABEL ======== */}
                        <div className="overflow-x-auto rounded-lg  bg-white-100/40">
                            <table className="w-full text-sm border-spacing-0">
                                <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                    <tr>
                                        <th className="px-4 py-3 text-center w-16">No</th>
                                        <th className="px-4 py-3 text-left">Nama User</th>
                                        <th className="px-4 py-3 text-left">Tanggal Akun Dibuat</th>
                                        <th className="px-4 py-3 text-left">Role</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
                                    {
                                        currentUsers.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-gray-200 hover:bg-blue-50 transition duration-150">
                                                <td className="text-center py-2">
                                                    {(page - 1) * perPage + index + 1}
                                                </td>

                                                <td className="py-2 px-3 font-medium">{user.nama}</td>

                                                <td className="py-2 px-3">{user.tanggal}</td>

                                                <td className="py-2 px-3">
                                                    {
                                                        editId === user.id
                                                            ? (
                                                                <select
                                                                    value={newRole || user.role}
                                                                    onChange={(e) => setNewRole(e.target.value)}
                                                                    className="border border-gray-00 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400">
                                                                    <option value="Pengguna">Pengguna</option>
                                                                    <option value="Admin">Admin</option>
                                                                </select>
                                                            )
                                                            : (
                                                                <span className='px-3 py-1 rounded-full text-xs font-semibold'>
                                                                    {user.role}
                                                                </span>
                                                            )
                                                    }
                                                </td>

                                                <td className="py-2 px-3 text-center">
                                                    {
                                                        editId === user.id
                                                            ? (
                                                                <div className="flex justify-center gap-2">
                                                                    <button
                                                                        onClick={() => handleSave(user.id)}
                                                                        className="text-green-600 hover:text-green-800">
                                                                        <Check className="w-4 h-4"/>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditId(null)}
                                                                        className="text-red-500 hover:text-red-700">
                                                                        <X className="w-4 h-4"/>
                                                                    </button>
                                                                </div>
                                                            )
                                                            : (
                                                                <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditId(user.id);
                                                                        setNewRole(user.role);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-800">
                                                                    <Edit className="w-4 h-4 inline-block mr-1"/>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="text-red-600 hover:text-red-800">
                                                                    <Trash2 className="w-4 h-4"/>
                                                                </button>
                                                                </div>
                                                            )
                                                    }
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>

                        {/* ======== PAGINATION ======== */}
                        <div className="flex items-center justify-between mt-5">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="px-4 py-2 flex items-center gap-1 rounded-md text-gray-700 hover:text-blue-500 disabled:opacity-50">
                                <ArrowLeft className="w-4 h-4"/>Sebelumnya
                            </button>

                            <div className="flex items-center space-x-1">
                                {
                                    Array
                                        .from({length: totalPages})
                                        .map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-8 h-8 rounded-md text-sm font-medium ${
                                                page === i + 1
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                                                {i + 1}
                                            </button>
                                        ))
                                }
                            </div>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-4 py-2 flex items-center gap-1 rounded-md text-gray-700 hover:text-blue-500 disabled:opacity-50">
                                <ArrowRight className="w-4 h-4"/>Selanjutnya
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Chat Button */}
            {/* <button className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
        <MessageSquare className="w-6 h-6" />
      </button> */
            }
        </div>
    );
};

export default DataUser;
