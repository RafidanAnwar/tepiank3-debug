import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Edit, UserCog, Plus, ArrowLeft, ArrowRight,Trash2} from "lucide-react";
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";

const PersonalisasiPage = () => {
    const navigate = useNavigate();

    // ========================= DATA PEGAWAI =========================
    const [pegawai, setPegawai] = useState([
        {
            id: 1,
            nama: "Arif Budiman",
            jabatan: "Supervisor K3",
            status: "Siap"
        }, {
            id: 2,
            nama: "Budi Santoso",
            jabatan: "Operator",
            status: "Siap"
        }, {
            id: 3,
            nama: "Citra Ayu",
            jabatan: "Staff Mutu",
            status: "SPT"
        }, {
            id: 4,
            nama: "Dewi Lestari",
            jabatan: "Analis Lingkungan",
            status: "Cuti"
        }, {
            id: 5,
            nama: "Eko Prasetyo",
            jabatan: "Petugas K3",
            status: "Siap"
        }, {
            id: 6,
            nama: "Farhan Yusuf",
            jabatan: "Teknisi",
            status: "Standby"
        }, {
            id: 7,
            nama: "Gita Paramita",
            jabatan: "Supervisor Mutu",
            status: "Standby"
        }, {
            id: 8,
            nama: "Hendra Wijaya",
            jabatan: "Analis",
            status: "Siap"
        }, {
            id: 9,
            nama: "Intan Sari",
            jabatan: "Staf Administrasi",
            status: "Standby"
        }, {
            id: 10,
            nama: "Joko Supriadi",
            jabatan: "Petugas Lapangan",
            status: "Cuti"
        }
    ]);

    // ======== Pagination ========
    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(pegawai.length / perPage);
    const currentPegawai = pegawai.slice((page - 1) * perPage, page * perPage);

    // ========================= HANDLER =========================
    const handleAdd = () => {
        navigate("/PersonalisasiForm");
    };

    const handleEdit = (data) => {
        navigate(`/PersonalisasiForm/${data.id}`, {state: data});
    };


        const handleDelete = (id) => {
        const confirmDelete = window.confirm("Yakin ingin menghapus data?");
        if (confirmDelete) {
            setPegawai(pegawai.filter((item) => item.id !== id));
        }
    };

    // ========================= RENDER UI =========================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* NAVBAR */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            <div className="flex">
                {/* SIDEBAR */}
                <aside
                    className="bg-gradient-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar/>
                </aside>

                {/* MAIN CONTENT */}
                <main className="max-w-7xl mx-auto flex-1 p-6">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <span className="w-8 h-8 flex items-center justify-center">
                                <UserCog className="w-10 h-10"/>
                            </span>
                            <span>Data Personalisasi</span>
                        </h2>

                        <button
                            onClick={handleAdd}
                            className="bg-gradient-to-tr from-blue-400 to-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow">
                            <Plus className="w-4 h-4"/>
                            <span>Input Data</span>
                        </button>
                    </div>

                    {/* ======== TABEL PERSONALSASI ======== */}
                    <div className="bg-white backdrop-blur-md w-full rounded-2xl shadow-lg">
                        <div className="overflow-x-auto rounded-lg bg-white-100/40">
                            <table className="w-full text-sm border-spacing-0">
                                <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                    <tr>
                                        <th className="px-4 py-3 text-center rounded-tl-lg w-16">No</th>
                                        <th className="px-4 py-3 text-left">Nama Pegawai</th>
                                        <th className="px-4 py-3 text-left">Jabatan</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center rounded-tr-lg w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        currentPegawai.map((data, index) => (
                                            <tr
                                                key={data.id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                <td className="px-3 py-2 text-center">{(page - 1) * perPage + index + 1}</td>
                                                <td className="px-3 py-2">{data.nama}</td>
                                                <td className="px-3 py-2">{data.jabatan}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        data.status === "Siap" || data.status === "Standby"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"}`}>
                                                        {data.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(data)}
                                                        className="text-blue-600 hover:text-blue-800">
                                                        <Edit className="w-4 h-4"/>
                                                        {/* <span>Edit</span> */}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-800">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                    </div>
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
                                <ArrowLeft className="w-4 h-4"/>
                                Sebelumnya
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
                                <ArrowRight className="w-4 h-4"/>
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PersonalisasiPage;
