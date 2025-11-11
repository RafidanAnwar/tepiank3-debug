// File: HomePage.jsx
import React, {useState, useEffect} from "react";
import Navbar from "../pages/NavBar.jsx";
import {MessageSquare, Eye, ArrowLeft, ArrowRight} from "lucide-react";
import {useNavigate} from "react-router-dom";
import Sidebar from "../pages/SideBar.jsx";

const HomeAdm = () => {
    const navigate = useNavigate();

    // ========================= DATA PENGAJUAN =========================
    const pengajuanList = [
        {
            id: 1,
            tanggal: "2025-11-01",
            perusahaan: "PT. Antareja Mahada Makmur"
        }, {
            id: 2,
            tanggal: "2025-11-03",
            perusahaan: "PT. Bara Sejahtera Mandiri"
        }
    ];

    // ======== Pagination ========
    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(pengajuanList.length / perPage);
    const currentpengajuan = pengajuanList.slice(
        (page - 1) * perPage,
        page * perPage
    );

    // Handler View
    const handleView = () => {
        navigate(`/Worksheet/`); // menuju halaman Worksheet
    };

    // ========================= RENDER UI =========================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* NAVBAR */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            {/* BODY */}
            <div className="flex">
                {/* SIDEBAR */}
                <aside
                    className="w-25 bg-gradient-to-tr from-blue-200 to-blue-600 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar/>
                </aside>

                {/* MAIN CONTENT */}
                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <h2
                        className="text-xl font-bold text-blue-600 mb-4 flex items-center space-x-2">
                        <span className="w-8 h-8 flex items-center justify-center ">
                            <img className="w-5" src="./logo-pengajuan.svg" alt="logo"/>
                        </span>
                        <span>Daftar Pengajuan</span>
                    </h2>

                    <div className="bg-white backdrop-blur-md w-full rounded-2xl shadow-lg ">
                        {/* ======== TABEL ======== */}
                        <div className="overflow-x-auto rounded-lg bg-white-100/40">
                            <table className="w-full text-sm  border-spacing-0">
                                <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                    <tr>
                                        <th className="px-4 py-3 text-center rounded-tl-lg">No</th>
                                        <th className="px-4 py-3 text-left">Tanggal Pengajuan</th>
                                        <th className="px-4 py-3 text-left">Nama Perusahaan</th>
                                        <th className="px-4 py-3 text-center rounded-tr-lg">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        currentpengajuan.map((p, i) => (
                                            <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                <td className="px-3 py-2 text-center">{i + 1}</td>
                                                <td className="px-3 py-2">{p.tanggal}</td>
                                                <td className="px-3 py-2">{p.perusahaan}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => handleView(p.id)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center justify-center space-x-1 mx-auto">
                                                        <Eye className="w-4 h-4"/>
                                                        <span>View</span>
                                                    </button>
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
            <button
                className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
                <MessageSquare className="w-6 h-6"/>
            </button>
        </div>
    );
};

export default HomeAdm;
