// File: ParameterPage.jsx
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    Edit,
    Trash2,
    FlaskConical,
    Plus,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";

const ParameterPage = () => {
    const navigate = useNavigate();

    // ========================= DATA PARAMETER =========================
    const [parameters, setParameters] = useState([
        {
            id: 1,
            namaParameter: "pH Air",
            acuan: "SNI 06-6989",
            biaya: 50000,
            jenisCluster: "Lingkungan",
            jenisPengujian: "Air"
        }, {
            id: 2,
            namaParameter: "CO2",
            acuan: "ISO 14175",
            biaya: 75000,
            jenisCluster: "K3",
            jenisPengujian: "Udara"
        }, {
            id: 3,
            namaParameter: "Kadar Protein",
            acuan: "AOAC 2005",
            biaya: 100000,
            jenisCluster: "Mutu",
            jenisPengujian: "Makanan"
        },
        // Tambahkan data lainnya
    ]);

    // ======== Pagination ========
    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(parameters.length / perPage);
    const currentParameters = parameters.slice(
        (page - 1) * perPage,
        page * perPage
    );

    // ========================= HANDLER =========================
    const handleAdd = () => {
        navigate("/ParameterForm"); // arahkan ke form input baru
    };

    const handleEdit = (param) => {
        navigate(`/ParameterForm/${param.id}`, {state: param}); // kirim data ke form edit
    };

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Yakin ingin menghapus data?");
        if (confirmDelete) {
            setParameters(parameters.filter((item) => item.id !== id));
        }
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
                <main className="max-w-7xl mx-auto  flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <span className="w-8 h-8 flex items-center justify-center">
                                <FlaskConical className="w-10 h-10"/>
                            </span>
                            <span>Daftar Parameter</span>
                        </h2>

                        <button
                            onClick={handleAdd}
                            className="bg-gradient-to-tr from-blue-400 to-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow">
                            <Plus className="w-4 h-4"/>
                            <span>Input Data</span>
                        </button>
                    </div>

                    <div className="bg-white backdrop-blur-md w-full rounded-2xl shadow-lg">
                        {/* ======== TABEL PARAMETER ======== */}
                        <div className="overflow-x-auto rounded-lg bg-white-100/40">
                            <table className="w-full text-sm border-spacing-0">
                                <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                    <tr>
                                        <th className="px-4 py-3 text-center rounded-tl-lg w-16">No</th>
                                        <th className="px-4 py-3 text-left">Nama Parameter</th>
                                        <th className="px-4 py-3 text-left">Acuan</th>
                                        <th className="px-4 py-3 text-left">Biaya</th>
                                        <th className="px-4 py-3 text-left">Jenis Cluster</th>
                                        <th className="px-4 py-3 text-left">Jenis Pengujian</th>
                                        <th className="px-4 py-3 text-center rounded-tr-lg w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        currentParameters.map((param, index) => (
                                            <tr
                                                key={param.id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                <td className="px-3 py-2 text-center">{index + 1 + (page - 1) * perPage}</td>
                                                <td className="px-3 py-2">{param.namaParameter}</td>
                                                <td className="px-3 py-2">{param.acuan}</td>
                                                <td className="px-3 py-2">{
                                                        param
                                                            .biaya
                                                            .toLocaleString("id-ID")
                                                    }</td>
                                                <td className="px-3 py-2">{param.jenisCluster}</td>
                                                <td className="px-3 py-2">{param.jenisPengujian}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(param)}
                                                            className="text-blue-600 hover:text-blue-800">
                                                            <Edit className="w-4 h-4"/>
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

export default ParameterPage;
