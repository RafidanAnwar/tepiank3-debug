import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowLeft,ArrowRight, Pipette, PlusCircle, Edit, Trash2} from "lucide-react";
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";

const Peralatan = () => {
    const navigate = useNavigate();

    // Data dummy — nanti bisa diganti dari API/backend
    const [dataPeralatan, setDataPeralatan] = useState([
        {
            id: 1,
            nomorAlat: "AL-001",
            nama: "Sound Level Meter",
            fungsi: "Mengukur kebisingan",
            merk: "Extech",
            tipe: "SL130",
            nomorSeri: "SN2023-001",
            kodeBMN: "03.11.02.01",
            nup: "001",
            waktuPengadaan: "2022-05-12",
            lokasi: "Lab K3",
            kalibrasiTerakhir: "2024-05-12",
            koreksi: "0.2 dB"
        }, {
            id: 2,
            nomorAlat: "AL-002",
            nama: "Personal Dust Sampler",
            fungsi: "Sampling debu total",
            merk: "Casella",
            tipe: "Apex2",
            nomorSeri: "SN2023-045",
            kodeBMN: "03.11.02.02",
            nup: "002",
            waktuPengadaan: "2023-03-20",
            lokasi: "Gudang",
            kalibrasiTerakhir: "2024-03-10",
            koreksi: "0.1 mg/m3"
        }
    ]);

    // ======== Pagination ========
    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(dataPeralatan.length / perPage);
    const currentPeralatan = dataPeralatan.slice((page - 1) * perPage, page * perPage);

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Yakin ingin menghapus data?");
        if (confirmDelete) {
            setDataPeralatan(dataPeralatan.filter((item) => item.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <Navbar/>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className="bg-gradient-to-tr from-blue-200 to-blue-600 w-25 p-2 min-h-screen">
                    <Sidebar/>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
                            <span className="w-8 h-8 flex items-center justify-center">
                                <Pipette className="w-10 h-10"/>
                            </span>
                            <span>Daftar Peralatan</span>
                        </h2>
                        <button
                            onClick={() => navigate("/PeralatanForm")}
                            className="bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            <PlusCircle className="w-4 h-4"/>
                            Tambah Data
                        </button>
                    </div>

                    <div className="bg-white backdrop-blur-md w-full rounded-2xl shadow-lg">
                        {/* ======== TABEL Peralatan ======== */}
                        <div className="overflow-x-auto rounded-lg bg-white-100/40">
                        <table className="w-full text-sm border-spacing-0 ">
                            <thead className="bg-gradient-to-br from-blue-200 to-cyan-100">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg w-32">No</th>
                                    <th className="px-4 py-3">Nomor Alat</th>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Fungsi</th>
                                    <th className="px-4 py-3">Merk</th>
                                    <th className="px-4 py-3">Tipe</th>
                                    <th className="px-4 py-3">Nomor Seri</th>
                                    <th className="px-4 py-3">Kode BMN</th>
                                    <th className="px-4 py-3">NUP</th>
                                    <th className="px-4 py-3">Waktu Pengadaan</th>
                                    <th className="px-4 py-3">Lokasi Penyimpanan</th>
                                    <th className="px-4 py-3">Kalibrasi Terakhir</th>
                                    <th className="px-4 py-3">Koreksi</th>
                                    <th className="px-4 py-3 rounded-tr-lg w-16">Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    currentPeralatan.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-200 hover:bg-gray-50 transition">
                                            <td className="px-4 py-2 text-center">{index + 1}</td>
                                            <td className="px-4 py-2">{item.nomorAlat}</td>
                                            <td className="px-4 py-2">{item.nama}</td>
                                            <td className="px-4 py-2">{item.fungsi}</td>
                                            <td className="px-4 py-2">{item.merk}</td>
                                            <td className="px-4 py-2">{item.tipe}</td>
                                            <td className="px-4 py-2">{item.nomorSeri}</td>
                                            <td className="px-4 py-2">{item.kodeBMN}</td>
                                            <td className="px-4 py-2">{item.nup}</td>
                                            <td className="px-4 py-2">
                                                {item.waktuPengadaan}
                                            </td>
                                            <td className="px-4 py-2">{item.lokasi}</td>
                                            <td className="px-4 py-2">
                                                {item.kalibrasiTerakhir}
                                            </td>
                                            <td className="px-4 py-2">{item.koreksi}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/PeralatanForm?id=${item.id}`)}
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

                        {
                            dataPeralatan.length === 0 && (
                                <div className="text-center text-gray-500 py-6">
                                    Belum ada data peralatan
                                </div>
                            )
                        }
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
                    <div/>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Peralatan;
