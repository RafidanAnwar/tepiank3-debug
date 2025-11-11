// File: HomePage.jsx
import React, {useState, useEffec} from "react";
import {useNavigate} from "react-router-dom";
import {
    Edit,
    Trash2,
    Atom,
    Plus,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";

const ClusterPage = () => {
    const navigate = useNavigate();

    // ========================= DATA PENGAJUAN =========================

    const [clusters, setClusters] = useState([
        {
            id: 1,
            jenisCluster: "Lingkungan"
        }, {
            id: 2,
            jenisCluster: "K3"
        }, {
            id: 3,
            jenisCluster: "Mutu"
        }, {
            id: 4,
            jenisCluster: "Lingkungan"
        }, {
            id: 5,
            jenisCluster: "K3"
        }, {
            id: 6,
            jenisCluster: "Mutu"
        }, {
            id: 7,
            jenisCluster: "Lingkungan"
        }, {
            id: 8,
            jenisCluster: "K3"
        }, {
            id: 9,
            jenisCluster: "Mutu"
        }, {
            id: 10,
            jenisCluster: "Mutu"
        }
    ]);

    // ======== Pagination ========
    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(clusters.length / perPage);
    const currentClusters = clusters.slice((page - 1) * perPage, page * perPage);

    // ========================= HANDLER ========================= Tombol menuju
    // form input baru
    const handleAdd = () => {
        navigate("/ClusterForm"); // arahkan ke form input
    };

    // Tombol edit
    const handleEdit = (cluster) => {
        navigate(`/ClusterForm/${cluster.id}`, {state: cluster}); // kirim data ke form edit
    };

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Yakin ingin menghapus data?");
        if (confirmDelete) {
            setClusters(clusters.filter((item) => item.id !== id));
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
                    className="bg-gradient-to-tr from-blue-200 to-blue-600 w-25  bg-white shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar/>
                </aside>

                {/* MAIN CONTENT */}
                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <span className="w-8 h-8 flex items-center justify-center ">
                                <Atom className="w-10 h-10"/>
                            </span>
                            <span>Daftar Cluster</span>
                        </h2>

                        <button
                            onClick={handleAdd}
                            className="bg-gradient-to-tr from-blue-400 to-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow">
                            <Plus className="w-4 h-4"/>
                            <span>Input Data</span>
                        </button>
                    </div>

                    <div className="bg-white backdrop-blur-md w-full rounded-2xl shadow-lg ">
                        {/* ======== TABEL Cluster ======== */}
                        <div className="overflow-x-auto rounded-lg bg-white-100/40">
                            <table className="w-full text-sm border-spacing-0">
                                <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                    <tr>
                                        <th className=" px-4 py-3 text-center rounded-tl-lg w-16">No</th>
                                        <th className=" px-4 py-3 text-left">Jenis Cluster</th>
                                        <th className=" px-4 py-3 text-center rounded-tr-lg w-32">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        currentClusters.map((cluster, index) => (
                                            <tr
                                                key={cluster.id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                <td className=" px-3 py-2 text-center">{index + 1}</td>
                                                <td className=" px-3 py-2">{cluster.jenisCluster}</td>
                                                <td className=" px-3 py-2 text-center ">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(cluster)}
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

export default ClusterPage;
