// File: ParameterForm.jsx
import React, {useState, useEffect} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {Atom, ArrowLeft, Save} from "lucide-react";

const ParameterForm = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const existingData = location.state;

    const [formData, setFormData] = useState(
        {namaParameter: "", acuan: "", biaya: "", jenisCluster: "", jenisPengujian: ""}
    );

    useEffect(() => {
        if (existingData) {
            setFormData(existingData);
        }
    }, [existingData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (id) {
            alert("Data parameter berhasil diperbarui!");
        } else {
            alert("Data parameter berhasil ditambahkan!");
        }
        navigate("/Parameter");
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-blue-600">
            <div className="h-screen flex items-center justify-center">
                {/* Tombol Kembali */}
                <div className="absolute top-6 left-6">
                    <button
                        onClick={() => navigate("/Parameter")}
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
                                <Atom className="w-12 h-12 text-white"/>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mt-3">
                                {
                                    id
                                        ? "Edit Parameter"
                                        : "Input Data Parameter"
                                }
                            </h1>
                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-lg rounded-xl p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Nama Parameter */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Nama Parameter
                                    </label>
                                    <input
                                        type="text"
                                        name="namaParameter"
                                        value={formData.namaParameter}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama parameter"
                                        required="required"
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] "/>
                                </div>

                                {/* Acuan */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Acuan
                                    </label>
                                    <input
                                        type="text"
                                        name="acuan"
                                        value={formData.acuan}
                                        onChange={handleChange}
                                        placeholder="Masukkan acuan"
                                        required="required"
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] "/>
                                </div>

                                {/* Biaya */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Biaya
                                    </label>
                                    <input
                                        type="number"
                                        name="biaya"
                                        value={formData.biaya}
                                        onChange={handleChange}
                                        placeholder="Masukkan biaya"
                                        required="required"
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] "/>
                                </div>

                                {/* Jenis Cluster */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Jenis Cluster
                                    </label>
                                    <select
                                        name="jenisCluster"
                                        value={formData.jenisCluster}
                                        onChange={handleChange}
                                        required="required"
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] ">
                                        <option value="">-- Pilih Jenis Cluster --</option>
                                        <option value="Lingkungan">Lingkungan</option>
                                        <option value="K3">K3</option>
                                        <option value="Mutu">Mutu</option>
                                    </select>
                                </div>

                                {/* Jenis Pengujian */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Jenis Pengujian
                                    </label>
                                    <select
                                        name="jenisPengujian"
                                        value={formData.jenisPengujian}
                                        onChange={handleChange}
                                        required="required"
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] ">
                                        <option value="">-- Pilih Jenis Pengujian --</option>
                                        <option value="Air">Air</option>
                                        <option value="Udara">Udara</option>
                                        <option value="Makanan">Makanan</option>
                                        <option value="Tanah">Tanah</option>
                                    </select>
                                </div>

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
                </main>
            </div>
        </div>
    );
};

export default ParameterForm;
