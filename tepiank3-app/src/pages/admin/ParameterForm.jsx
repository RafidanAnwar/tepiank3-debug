// File: ParameterForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Atom, ArrowLeft, Save } from "lucide-react";
import { parameterService } from '../../services/parameterService';
import { jenisPengujianService } from '../../services/jenisPengujianService';
import { clusterService } from '../../services/clusterService';
import { peralatanService } from '../../services/peralatanService';

const ParameterForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const existingData = location.state;

    const [formData, setFormData] = useState({
        name: "",
        satuan: "",
        acuan: "",
        harga: "",
        jenisPengujianId: "",
        clusterId: ""
    });
    const [clusters, setClusters] = useState([]);
    const [jenisPengujian, setJenisPengujian] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [peralatanList, setPeralatanList] = useState([]);
    const [selectedPeralatan, setSelectedPeralatan] = useState([]); // { peralatanId, quantity, peralatan }
    const [peralatanQuery, setPeralatanQuery] = useState('');
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    useEffect(() => {
        loadClusters();
        if (id && !existingData) {
            loadParameterData();
        } else if (existingData) {
            setFormData({
                name: existingData.name || '',
                satuan: existingData.satuan || '',
                acuan: existingData.acuan || '',
                harga: existingData.harga || '',
                jenisPengujianId: existingData.jenisPengujianId || '',
                clusterId: existingData.jenisPengujian?.clusterId || ''
            });
            if (existingData.jenisPengujian?.clusterId) {
                loadPeralatan();
                loadJenisPengujianByCluster(existingData.jenisPengujian.clusterId);
            }
        }
    }, [id, existingData]);

    // If editing, load selected peralatan separately (ensure we populate quantities)
    useEffect(() => {
        const loadSelectedPeralatan = async () => {
            if (!id) return;
            try {
                const data = await parameterService.getParameterById(id);
                if (Array.isArray(data.parameterPeralatans) && data.parameterPeralatans.length > 0) {
                    const sel = data.parameterPeralatans.map(pp => ({
                        peralatanId: pp.peralatanId,
                        quantity: pp.quantity,
                        peralatan: pp.peralatan
                    }));
                    setSelectedPeralatan(sel);
                }
            } catch (err) {
                console.error('Failed to load selected peralatan:', err);
            }
        };

        loadSelectedPeralatan();
    }, [id]);

    const loadClusters = async () => {
        try {
            const data = await clusterService.getAllClusters();
            setClusters(data);
        } catch (error) {
            console.error('Error loading clusters:', error);
        }
    };

    const loadJenisPengujianByCluster = async (clusterId) => {
        try {
            const data = await jenisPengujianService.getJenisPengujianByCluster(clusterId);
            setJenisPengujian(data);
        } catch (error) {
            console.error('Error loading jenis pengujian:', error);
        }
    };

    const loadParameterData = async () => {
        try {
            setLoading(true);
            const loadPeralatan = async () => {
                try {
                    const data = await peralatanService.getAllPeralatan();
                    setPeralatanList(data);
                } catch (error) {
                    console.error('Error loading peralatan:', error);
                }
            };
            const data = await parameterService.getParameterById(id);
            setFormData({
                name: data.name || '',
                satuan: data.satuan || '',
                acuan: data.acuan || '',
                harga: data.harga || '',
                jenisPengujianId: data.jenisPengujianId || '',
                clusterId: data.jenisPengujian?.clusterId || ''
            });
            if (data.jenisPengujian?.clusterId) {
                loadJenisPengujianByCluster(data.jenisPengujian.clusterId);
            }
        } catch (error) {
            console.error('Error loading parameter:', error);
            alert('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);

        // Clear error saat user mengetik
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Load jenis pengujian when cluster changes
        if (name === 'clusterId') {
            setFormData(prev => ({ ...prev, jenisPengujianId: '' }));
            if (value) {
                loadJenisPengujianByCluster(value);
            } else {
                setJenisPengujian([]);
            }
        }
    };

    // Peralatan selection handlers
    const togglePeralatan = (peralatan) => {
        const exists = selectedPeralatan.find(p => p.peralatanId === peralatan.id);
        if (exists) {
            setSelectedPeralatan(prev => prev.filter(p => p.peralatanId !== peralatan.id));
        } else {
            setSelectedPeralatan(prev => [...prev, { peralatanId: peralatan.id, quantity: 1, peralatan }]);
        }
        setIsDirty(true);
    };

    const setPeralatanQuantity = (peralatanId, qty) => {
        setSelectedPeralatan(prev => prev.map(p => p.peralatanId === peralatanId ? { ...p, quantity: qty } : p));
        setIsDirty(true);
    };

    // Validasi form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama parameter harus diisi';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Nama maksimal 100 karakter';
        }

        if (!formData.clusterId) {
            newErrors.clusterId = 'Cluster harus dipilih';
        }

        if (!formData.jenisPengujianId) {
            newErrors.jenisPengujianId = 'Jenis pengujian harus dipilih';
        }

        if (!formData.harga || parseFloat(formData.harga) <= 0) {
            newErrors.harga = 'Harga harus diisi dan lebih dari 0';
        }

        if (formData.satuan && formData.satuan.length > 50) {
            newErrors.satuan = 'Satuan maksimal 50 karakter';
        }

        if (formData.acuan && formData.acuan.length > 200) {
            newErrors.acuan = 'Acuan maksimal 200 karakter';
        }

        // Validate peralatan quantities
        for (const p of selectedPeralatan) {
            if (!p.peralatanId || isNaN(parseInt(p.peralatanId))) {
                newErrors.peralatan = 'Peralatan tidak valid';
                break;
            }
            if (!p.quantity || parseInt(p.quantity) < 1) {
                newErrors.peralatan = 'Jumlah peralatan minimal 1';
                break;
            }
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
            const submitData = {
                name: formData.name.trim(),
                satuan: formData.satuan.trim() || null,
                acuan: formData.acuan.trim() || null,
                harga: parseFloat(formData.harga),
                jenisPengujianId: parseInt(formData.jenisPengujianId)
            };
            // Attach peralatan associations if selected
            if (selectedPeralatan.length > 0) {
                submitData.peralatan = selectedPeralatan.map(p => ({ peralatanId: p.peralatanId, quantity: parseInt(p.quantity) }));
            }

            if (id) {
                await parameterService.updateParameter(id, submitData);
                alert("Data parameter berhasil diperbarui!");
            } else {
                await parameterService.createParameter(submitData);
                alert("Data parameter berhasil ditambahkan!");
            }
            navigate("/Parameter");
        } catch (error) {
            console.error('Error saving parameter:', error);
            const errorMsg = error.response?.data?.error || 'Gagal menyimpan data';

            if (error.response?.status === 400 && errorMsg.includes('already exists')) {
                setErrors({ name: 'Nama parameter sudah ada dalam jenis pengujian ini' });
            } else {
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-blue-600">
            <div className="h-screen flex items-center justify-center">
                {/* Tombol Kembali */}
                <div className="absolute top-6 left-6">
                    <button
                        onClick={() => navigate("/Parameter")}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
                        <ArrowLeft className="w-4 h-4" />
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
                                <Atom className="w-12 h-12 text-white" />
                            </div>

                            {/* Peralatan terkait (opsional) */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-white mb-2">Peralatan (opsional)</label>
                                <div className="flex items-center gap-3 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Cari peralatan..."
                                        value={peralatanQuery}
                                        onChange={(e) => setPeralatanQuery(e.target.value)}
                                        className="px-2 py-1 rounded border"
                                    />
                                    <label className="text-sm text-white flex items-center gap-2">
                                        <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
                                        Hanya tersedia
                                    </label>
                                </div>

                                <div className="bg-white/90 border border-blue-500 rounded-lg p-3 max-h-48 overflow-auto">
                                    {peralatanList.length === 0 && (
                                        <p className="text-sm text-gray-600">Belum ada peralatan terdaftar.</p>
                                    )}
                                    {peralatanList
                                        .filter(p => {
                                            const q = peralatanQuery.trim().toLowerCase();
                                            if (onlyAvailable && p.status !== 'AVAILABLE') return false;
                                            if (!q) return true;
                                            return (p.name || '').toLowerCase().includes(q) || (p.merk || '').toLowerCase().includes(q);
                                        })
                                        .map(p => {
                                            const sel = selectedPeralatan.find(s => s.peralatanId === p.id);
                                            return (
                                                <div key={p.id} className="flex items-center justify-between py-1">
                                                    <div className="flex items-center space-x-2">
                                                        <input type="checkbox" checked={!!sel} onChange={() => togglePeralatan(p)} />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-800">{p.name}</div>
                                                            <div className="text-xs text-gray-500">{p.merk || ''} {p.tipe ? `- ${p.tipe}` : ''}</div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={sel ? sel.quantity : 1}
                                                            onChange={(e) => setPeralatanQuantity(p.id, Math.max(1, parseInt(e.target.value || '1')))}
                                                            disabled={!sel}
                                                            className="w-20 text-sm border rounded px-2 py-1"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                {errors.peralatan && (
                                    <p className="text-red-200 text-sm mt-1">{errors.peralatan}</p>
                                )}
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

                                {/* Pilih Cluster */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Cluster *
                                    </label>
                                    <select
                                        name="clusterId"
                                        value={formData.clusterId || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${errors.clusterId ? 'border-red-500' : 'border-blue-500'
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

                                {/* Jenis Pengujian */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Jenis Pengujian *
                                    </label>
                                    <select
                                        name="jenisPengujianId"
                                        value={formData.jenisPengujianId}
                                        onChange={handleChange}
                                        disabled={loading || !formData.clusterId}
                                        className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${errors.jenisPengujianId ? 'border-red-500' : 'border-blue-500'
                                            }`}
                                    >
                                        <option value="">
                                            {!formData.clusterId ? 'Pilih cluster terlebih dahulu' : 'Pilih Jenis Pengujian'}
                                        </option>
                                        {jenisPengujian.map(jenis => (
                                            <option key={jenis.id} value={jenis.id}>
                                                {jenis.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.jenisPengujianId && (
                                        <p className="text-red-200 text-sm mt-1">{errors.jenisPengujianId}</p>
                                    )}
                                </div>

                                {/* Nama Parameter */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Nama Parameter *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Masukkan nama parameter"
                                        maxLength={100}
                                        disabled={loading}
                                        className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${errors.name ? 'border-red-500' : 'border-blue-500'
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-200 text-sm mt-1">{errors.name}</p>
                                    )}
                                    <p className="text-blue-100 text-xs mt-1">
                                        {formData.name.length}/100 karakter
                                    </p>
                                </div>

                                {/* Satuan */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Satuan
                                    </label>
                                    <input
                                        type="text"
                                        name="satuan"
                                        value={formData.satuan}
                                        onChange={handleChange}
                                        placeholder="Masukkan satuan (opsional)"
                                        disabled={loading}
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50" />
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
                                        placeholder="Masukkan acuan (opsional)"
                                        disabled={loading}
                                        className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50" />
                                </div>

                                {/* Harga */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Harga *
                                    </label>
                                    <input
                                        type="number"
                                        name="harga"
                                        value={formData.harga}
                                        onChange={handleChange}
                                        placeholder="Masukkan harga"
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                        className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${errors.harga ? 'border-red-500' : 'border-blue-500'
                                            }`}
                                    />
                                    {errors.harga && (
                                        <p className="text-red-200 text-sm mt-1">{errors.harga}</p>
                                    )}
                                    {formData.harga && (
                                        <p className="text-blue-100 text-xs mt-1">
                                            Rp {parseFloat(formData.harga || 0).toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Tombol Simpan */}
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-white/70 text-blue-700 font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow hover:text-blue-900 hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {loading ? 'Menyimpan...' : (id ? "Update" : "Simpan")}
                                    </span>
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
