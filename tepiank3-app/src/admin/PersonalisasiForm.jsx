import React, {useState, useEffect} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {UserCog, ArrowLeft, Save} from "lucide-react";

const PersonalisasiForm = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const existingData = location.state;

    const [formData, setFormData] = useState({nama: "", jabatan: "", status: ""});

    // Jika ada data dari tombol edit, isi otomatis
    useEffect(() => {
        if (existingData) {
            setFormData({
                nama: existingData.nama || "",
                jabatan: existingData.jabatan || "",
                status: existingData.status || ""
            });
        }
    }, [existingData]);

    // Handle input teks
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle simpan
    const handleSubmit = (e) => {
        e.preventDefault();
        if (id) {
            alert("Data pegawai berhasil diperbarui!");
        } else {
            alert("Data pegawai berhasil ditambahkan!");
        }
        navigate("/Personalisasi");
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-blue-500">
            {/* NAVBAR */}
            {/* <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img className="max-w-40" src="./Tepian-K3-Logo-1.svg" alt="logo" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full"></div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Arif Budiman
                </p>
                <p className="text-xs text-gray-500">Kaji Ulang</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </header> */
            }

            {/* === BODY === */}
            <div className="min-h-screen bg-gradient-to-tr from-blue-600">
                <div className="h-screen flex items-center justify-center ">
                    {/* Tombol Kembali */}
                    <div className="absolute top-6 left-6">
                        <button
                            onClick={() => navigate("/Personalisasi")}
                            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
                            <ArrowLeft className="w-4 h-4"/>
                            <span>Kembali</span>
                        </button>
                    </div>
                    <main className="flex items-center justify-center w-full px-4">
                        <div
                            className="backdrop-blur-md w-full max-w-[820px] p-8 transition-all hover:shadow-blue-200 rounded-xl">
                            {/* Judul */}
                            <div className="flex flex-col items-center mb-8">
                                <div
                                    className="bg-gradient-to-tr from-blue-500 to-cyan-500 p-5 rounded-full shadow-lg">
                                    <UserCog className="w-12 h-12 text-white"/>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800 mt-3">
                                    {
                                        id
                                            ? "Edit Data Pegawai"
                                            : "Input Data Pegawai"
                                    }
                                </h1>
                            </div>

                            {/* FORM */}
                            <div className="flex items-center justify-center">
                                <form
                                    onSubmit={handleSubmit}
                                    className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-lg rounded-xl p-6 space-y-6 w-100">
                                    {/* Nama Pegawai */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Nama Pegawai
                                        </label>
                                        <input
                                            type="text"
                                            name="nama"
                                            value={formData.nama}
                                            onChange={handleChange}
                                            placeholder="Masukkan nama pegawai"
                                            required="required"
                                            className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] "/>
                                    </div>

                                    {/* Jabatan */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Jabatan
                                        </label>
                                        <input
                                            type="text"
                                            name="jabatan"
                                            value={formData.jabatan}
                                            onChange={handleChange}
                                            placeholder="Masukkan jabatan pegawai"
                                            required="required"
                                            className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] "/>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            required="required"
                                            className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] ">
                                            <option value="">-- Pilih Status Pegawai --</option>
                                            <option value="Siap">Siap</option>
                                            <option value="SPT">SPT</option>
                                            <option value="Standby">Standby</option>
                                            <option value="Cuti">Cuti</option>
                                        </select>
                                    </div>

                                    {/* Tombol Simpan */}
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="bg-white/70 text-blue-700 font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow hover:text-blue-900 hover:scale-[1.03] transition-all">
                                            <Save className="w-4 h-4"/>
                                            <span>{
                                                    id
                                                        ? "Update"
                                                        : "Simpan"
                                                }</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PersonalisasiForm;
