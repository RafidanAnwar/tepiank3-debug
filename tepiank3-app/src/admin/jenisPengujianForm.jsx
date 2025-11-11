import React, {useState, useEffect} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {ArrowLeft, Microscope, Save} from "lucide-react";

const jenisPengujianForm = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const existingData = location.state;

    const [formData, setFormData] = useState({jenisCluster: ""});

    // Jika ada data dari tombol edit, isi otomatis
    useEffect(() => {
        if (existingData) {
            setFormData(existingData);
        }
    }, [existingData]);

    // Handle input
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
            alert("Data berhasil diperbarui!");
        } else {
            alert("Data berhasil ditambahkan!");
        }
        navigate("/JenisPengujian");
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-blue-600 ">
            {/* === BODY === */}
            <div className="h-screen flex items-center justify-center to-cyan-100">
                {/* Tombol Kembali */}
                <div className="absolute top-6 left-6">
                    <button
                        onClick={() => navigate("/JenisPengujian")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
                        <ArrowLeft className="w-4 h-4"/>
                        <span>Kembali</span>
                    </button>
                </div>
                <main className="flex items-center justify-center w-full px-4 ">
                    <div
                        className=" backdrop-blur-md w-full  p-8 transition-all hover:shadow-blue-200">
                        {/* Judul */}
                        <div className="flex flex-col items-center mb-8">
                            <div
                                className="bg-gradient-to-tr from-blue-500 to-cyan-500 p-5 rounded-full shadow-lg">
                                <Microscope className="w-12 h-12 text-white"/>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mt-3">
                                {
                                    id
                                        ? "Edit Jenis Pengujian"
                                        : "Input Data Jenis Pengujian"
                                }
                            </h1>
                        </div>

                        {/* FORM */}
                        <div className="flex items-center justify-center ">
                            <form
                                onSubmit={handleSubmit}
                                className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-md rounded-xl p-6 space-y-6 w-100">

                                {/* Input */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Jenis Pengujian
                                    </label>
                                    <input
                                        type="text"
                                        name="jenisPengujian"
                                        value={formData.jenisPengujian}
                                        onChange={handleChange}
                                        placeholder="Masukkan jenis Pengujian"
                                        required="required"
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]"/>
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

            {/* Chat Button */}
            {/* <button className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
        <MessageSquare className="w-6 h-6" />
      </button> */
            }
        </div>
    );
};

export default jenisPengujianForm;
