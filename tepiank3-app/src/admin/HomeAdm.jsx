import React, {useState, useEffect} from "react";
import Navbar from "../pages/NavBar.jsx";
import {MessageSquare, Eye, ArrowLeft, ArrowRight, Loader} from "lucide-react";
import {useNavigate} from "react-router-dom";
import Sidebar from "../pages/SideBar.jsx";
import api from "../services/api.js";

const HomeAdm = () => {
    const navigate = useNavigate();
    const [pengajuanList, setPengajuanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(pengajuanList.length / perPage);
    const currentpengajuan = pengajuanList.slice(
        (page - 1) * perPage,
        page * perPage
    );

    useEffect(() => {
        const fetchPengajuan = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await api.get('/orders/admin/all-orders');
                setPengajuanList(response.data || []);
            } catch (err) {
                console.error('Error:', err);
                setError('Gagal memuat data pengajuan');
                setPengajuanList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPengajuan();
    }, []);

    const handleView = (orderId) => {
        navigate(`/Worksheet/${orderId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            <div className="flex">
                <aside className="w-25 bg-gradient-to-tr from-blue-200 to-blue-600 shadow-lg p-2 min-h-screen flex flex-col justify-between">
                    <Sidebar/>
                </aside>

                <main className="max-w-7xl mx-auto flex-1 p-6">
                    <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center space-x-2">
                        <span className="w-8 h-8 flex items-center justify-center">
                            <img className="w-5" src="./logo-pengajuan.svg" alt="logo"/>
                        </span>
                        <span>Daftar Pengajuan</span>
                    </h2>

                    <div className="bg-white backdrop-blur-md w-full rounded-2xl shadow-lg">
                        {error && (
                            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg m-4">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader className="w-6 h-6 animate-spin text-blue-500 mr-2"/>
                                <span>Memuat data...</span>
                            </div>
                        ) : pengajuanList.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Tidak ada pengajuan
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                            <tr>
                                                <th className="px-4 py-3 text-center">No</th>
                                                <th className="px-4 py-3 text-left">Tanggal</th>
                                                <th className="px-4 py-3 text-left">Perusahaan</th>
                                                <th className="px-4 py-3 text-left">Kontak</th>
                                                <th className="px-4 py-3 text-left">No. Order</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentpengajuan.map((p, i) => (
                                                <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-center">{(page - 1) * perPage + i + 1}</td>
                                                    <td className="px-4 py-2">{new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
                                                    <td className="px-4 py-2">{p.company || '-'}</td>
                                                    <td className="px-4 py-2">{p.phone || '-'}</td>
                                                    <td className="px-4 py-2 font-medium text-blue-600">{p.orderNumber}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                            p.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                            p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            onClick={() => handleView(p.id)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center justify-center space-x-1 mx-auto">
                                                            <Eye className="w-4 h-4"/>
                                                            <span>View</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between mt-5 p-4">
                                    <button
                                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                                                page === i + 1
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 flex items-center gap-1 rounded-md text-gray-700 hover:text-blue-500 disabled:opacity-50">
                                        <ArrowRight className="w-4 h-4"/>Selanjutnya
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            <button className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
                <MessageSquare className="w-6 h-6"/>
            </button>
        </div>
    );
};

export default HomeAdm;
