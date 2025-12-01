import React, {useState, useEffect} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {ArrowLeft, Microscope, Save} from "lucide-react";
import { jenisPengujianService } from '../services/jenisPengujianService';
import { clusterService } from '../services/clusterService';

const jenisPengujianForm = () => {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const existingData = location.state;

    const [formData, setFormData] = useState({name: "", description: "", clusterId: ""});
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        loadClusters();
        if (id && !existingData) {
            loadJenisPengujianData();
        } else if (existingData) {
            setFormData({
                name: existingData.name || '',
                description: existingData.description || '',
                clusterId: existingData.clusterId || ''
            });
        }
    }, [id, existingData]);

    const loadClusters = async () => {
        try {
            const data = await clusterService.getAllClusters();
            setClusters(data);
        } catch (error) {
            console.error('Error loading clusters:', error);
        }
    };

    const loadJenisPengujianData = async () => {
        try {
            setLoading(true);
            const data = await jenisPengujianService.getJenisPengujianById(id);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                clusterId: data.clusterId || ''
            });
        } catch (error) {
            console.error('Error loading jenis pengujian:', error);
            alert('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    // Handle input dengan validasi
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
        
        // Clear error saat user mengetik
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    // Validasi form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Nama jenis pengujian harus diisi';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Nama maksimal 100 karakter';
        }
        
        if (!formData.clusterId) {
            newErrors.clusterId = 'Cluster harus dipilih';
        }
        
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Deskripsi maksimal 500 karakter';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setLoading(true);
            const trimmedData = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                clusterId: parseInt(formData.clusterId)
            };
            
            if (id) {
                await jenisPengujianService.updateJenisPengujian(id, trimmedData);
                alert("Data berhasil diperbarui!");
            } else {
                await jenisPengujianService.createJenisPengujian(trimmedData);
                alert("Data berhasil ditambahkan!");
            }
            navigate("/JenisPengujian");
        } catch (error) {
            console.error('Error saving data:', error);
            const errorMsg = error.response?.data?.error || 'Gagal menyimpan data';
            
            if (error.response?.status === 400 && errorMsg.includes('already exists')) {
                setErrors({ name: 'Nama jenis pengujian sudah ada' });
            } else {
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
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

                                {/* Pilih Cluster */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Cluster *
                                    </label>
                                    <select
                                        name="clusterId"
                                        value={formData.clusterId}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${
                                            errors.clusterId ? 'border-red-500' : 'border-blue-500'
                                        }`}
                                    >
                                        <option value="">Pilih Cluster</option>
                                        {clusters.map(cluster => (
                                            <option key={cluster.id} value={cluster.id}>
                                                {cluster.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.clusterId && (
                                        <p className="text-red-200 text-sm mt-1">{errors.clusterId}</p>
                                    )}
                                </div>

                                {/* Input Nama */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Nama Jenis Pengujian *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama jenis pengujian"
                                        maxLength={100}
                                        disabled={loading}
                                        className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${
                                            errors.name ? 'border-red-500' : 'border-blue-500'
                                        }`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-200 text-sm mt-1">{errors.name}</p>
                                    )}
                                    <p className="text-blue-100 text-xs mt-1">
                                        {formData.name.length}/100 karakter
                                    </p>
                                </div>

                                {/* Input Deskripsi */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Deskripsi (Opsional)
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Masukkan deskripsi"
                                        rows={3}
                                        maxLength={500}
                                        disabled={loading}
                                        className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 resize-none ${
                                            errors.description ? 'border-red-500' : 'border-blue-500'
                                        }`}
                                    />
                                    {errors.description && (
                                        <p className="text-red-200 text-sm mt-1">{errors.description}</p>
                                    )}
                                    <p className="text-blue-100 text-xs mt-1">
                                        {formData.description.length}/500 karakter
                                    </p>
                                </div>

                                {/* Tombol Simpan */}
                                <div className="flex justify-center">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-white/70 text-blue-700 font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow hover:text-blue-900 hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Save className="w-4 h-4"/>
                                        <span>
                                            {loading ? 'Menyimpan...' : (id ? "Update" : "Simpan")}
                                        </span>
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
