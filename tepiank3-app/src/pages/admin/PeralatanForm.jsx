import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Pipette, ArrowLeft, Save, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { peralatanService } from '../../services/peralatanService';

const PeralatanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existingData = location.state;

  const [formData, setFormData] = useState({
    nomorAlat: "",
    name: "",
    description: "",
    status: "AVAILABLE",
    merk: "",
    tipe: "",
    nomorSeri: "",
    kodeBMN: "",
    nup: "",
    waktuPengadaan: "",
    lokasiPenyimpanan: "",
    tanggalKalibrasi: "",
    koreksi: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Get ID from URL params or query string
    const urlParams = new URLSearchParams(window.location.search);
    const editId = id || urlParams.get('id');

    if (editId && !existingData) {
      loadPeralatanData(editId);
    } else if (existingData) {
      setFormData({
        nomorAlat: existingData.nomorAlat || '',
        name: existingData.name || '',
        description: existingData.description || '',
        status: existingData.status || 'AVAILABLE',
        merk: existingData.merk || '',
        tipe: existingData.tipe || '',
        nomorSeri: existingData.nomorSeri || '',
        kodeBMN: existingData.kodeBMN || '',
        nup: existingData.nup || '',
        waktuPengadaan: existingData.waktuPengadaan ? new Date(existingData.waktuPengadaan).toISOString().split('T')[0] : '',
        lokasiPenyimpanan: existingData.lokasiPenyimpanan || '',
        tanggalKalibrasi: existingData.tanggalKalibrasi ? new Date(existingData.tanggalKalibrasi).toISOString().split('T')[0] : '',
        koreksi: existingData.koreksi || ''
      });
    }
  }, [id, existingData]);

  const loadPeralatanData = async (peralatanId) => {
    try {
      setLoading(true);
      const data = await peralatanService.getPeralatanById(peralatanId || id);
      setFormData({
        nomorAlat: data.nomorAlat || '',
        name: data.name || '',
        description: data.description || '',
        status: data.status || 'AVAILABLE',
        merk: data.merk || '',
        tipe: data.tipe || '',
        nomorSeri: data.nomorSeri || '',
        kodeBMN: data.kodeBMN || '',
        nup: data.nup || '',
        waktuPengadaan: data.waktuPengadaan ? new Date(data.waktuPengadaan).toISOString().split('T')[0] : '',
        lokasiPenyimpanan: data.lokasiPenyimpanan || '',
        tanggalKalibrasi: data.tanggalKalibrasi ? new Date(data.tanggalKalibrasi).toISOString().split('T')[0] : '',
        koreksi: data.koreksi || ''
      });
    } catch (error) {
      console.error('Error loading peralatan:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear success message
    if (success) {
      setSuccess('');
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama peralatan wajib diisi';
    }

    if (!formData.status) {
      newErrors.status = 'Status wajib dipilih';
    }

    // Validate date format
    if (formData.tanggalKalibrasi && isNaN(new Date(formData.tanggalKalibrasi))) {
      newErrors.tanggalKalibrasi = 'Format tanggal tidak valid';
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
      setErrors({});

      const urlParams = new URLSearchParams(window.location.search);
      const editId = id || urlParams.get('id');

      if (editId) {
        await peralatanService.updatePeralatan(editId, formData);
        setSuccess("Data peralatan berhasil diperbarui!");
      } else {
        await peralatanService.createPeralatan(formData);
        setSuccess("Data peralatan berhasil ditambahkan!");
      }

      setTimeout(() => {
        navigate("/Peralatan");
      }, 1500);
    } catch (error) {
      console.error('Error saving peralatan:', error);
      setErrors({ submit: error.response?.data?.message || 'Gagal menyimpan data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 flex items-center justify-center py-10">

      {/* Tombol Kembali */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/Peralatan")}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>

      <main className="flex items-center justify-center w-full px-4">
        <div className="backdrop-blur-md w-full max-w-[1000px] p-8 transition-all rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-xl">
          {/* Judul */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-tr from-blue-500 to-cyan-500 p-5 rounded-full shadow-lg">
              <Pipette className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-3">
              {id ? "Edit Data Peralatan" : "Input Data Peralatan"}
            </h1>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errors.submit}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* === Kolom 1 === */}
              <div className="space-y-4">
                {/* Upload Gambar */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Gambar Alat</label>
                  <div className="border border-blue-400 rounded-lg bg-white/90 w-full h-40 flex items-center justify-center text-gray-400 text-sm">
                    Upload Foto
                  </div>
                  <button
                    type="button"
                    className="mt-2 bg-blue-400 text-white text-sm px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <Upload className="w-4 h-4" /> Upload Foto
                  </button>
                </div>

                {/* QR Code */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">QR Code</label>
                  <div className="border border-blue-400 rounded-lg bg-white/90 w-full h-40 flex items-center justify-center text-gray-400 text-sm">
                    QR Preview
                  </div>
                  <button
                    type="button"
                    className="mt-2 bg-blue-400 text-white text-sm px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    Generate QR Code
                  </button>
                </div>

                {/* Upload Dokumen */}
                <div>
                  <button
                    type="button"
                    className="w-full mt-4 bg-blue-400 text-white text-sm px-3 py-1.5 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                    <Upload className="w-4 h-4" /> Upload Dokumen
                  </button>
                </div>
              </div>

              {/* === Kolom 2 === */}
              <div className="space-y-4">
                <label className="text-white font-semibold text-sm">Informasi Dasar</label>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nomor Alat</label>
                  <input
                    type="text"
                    name="nomorAlat"
                    value={formData.nomorAlat}
                    onChange={handleChange}
                    placeholder="Masukkan nomor alat"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nama Peralatan</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama peralatan"
                    required
                    disabled={loading}
                    className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${errors.name ? 'border-red-500' : 'border-blue-500'
                      }`}
                  />
                  {errors.name && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Fungsi/Deskripsi</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Masukkan fungsi peralatan"
                    rows={3}
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Merk</label>
                  <input
                    type="text"
                    name="merk"
                    value={formData.merk}
                    onChange={handleChange}
                    placeholder="Masukkan merk peralatan"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tipe</label>
                  <input
                    type="text"
                    name="tipe"
                    value={formData.tipe}
                    onChange={handleChange}
                    placeholder="Masukkan tipe peralatan"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nomor Seri</label>
                  <input
                    type="text"
                    name="nomorSeri"
                    value={formData.nomorSeri}
                    onChange={handleChange}
                    placeholder="Masukkan nomor seri"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* === Kolom 3 === */}
              <div className="space-y-4">
                <label className="text-white font-semibold text-sm">Informasi Inventaris</label>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Kode BMN</label>
                  <input
                    type="text"
                    name="kodeBMN"
                    value={formData.kodeBMN}
                    onChange={handleChange}
                    placeholder="Masukkan kode BMN"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">NUP</label>
                  <input
                    type="text"
                    name="nup"
                    value={formData.nup}
                    onChange={handleChange}
                    placeholder="Masukkan NUP"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Waktu Pengadaan</label>
                  <input
                    type="date"
                    name="waktuPengadaan"
                    value={formData.waktuPengadaan}
                    onChange={handleChange}
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    name="lokasiPenyimpanan"
                    value={formData.lokasiPenyimpanan}
                    onChange={handleChange}
                    placeholder="Masukkan lokasi penyimpanan"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tanggal Kalibrasi Terakhir</label>
                  <input
                    type="date"
                    name="tanggalKalibrasi"
                    value={formData.tanggalKalibrasi}
                    onChange={handleChange}
                    disabled={loading}
                    className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${errors.tanggalKalibrasi ? 'border-red-500' : 'border-blue-500'
                      }`}
                  />
                  {errors.tanggalKalibrasi && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.tanggalKalibrasi}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Koreksi</label>
                  <input
                    type="text"
                    name="koreksi"
                    value={formData.koreksi}
                    onChange={handleChange}
                    placeholder="Masukkan nilai koreksi"
                    disabled={loading}
                    className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`backdrop-blur-sm shadow-sm bg-white/90 w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03] disabled:opacity-50 ${errors.status ? 'border-red-500' : 'border-blue-500'
                      }`}
                  >
                    <option value="AVAILABLE">Tersedia</option>
                    <option value="IN_USE">Sedang Digunakan</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="DAMAGED">Rusak</option>
                  </select>
                  {errors.status && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.status}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-white/70 text-blue-700 font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow hover:text-blue-900 hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : (id ? "Update" : "Simpan")}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PeralatanForm;
