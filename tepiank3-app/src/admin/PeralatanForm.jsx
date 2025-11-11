import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Pipette, ArrowLeft, Save, Upload } from "lucide-react";

const PeralatanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existingData = location.state;

  const [formData, setFormData] = useState({
    nomorAlat: "",
    nama: "",
    fungsi: "",
    merk: "",
    tipe: "",
    nomorSeri: "",
    kodeBmn: "",
    nup: "",
    waktuPengadaan: "",
    lokasiPenyimpanan: "",
    kalibrasiTerakhir: "",
    koreksi: "",
    kelengkapan1: "",
    kelengkapan2: "",
    kelengkapan3: "",
    kelengkapan4: "",
  });

  // Autofill kalau dari edit
  useEffect(() => {
    if (existingData) setFormData(existingData);
  }, [existingData]);

  // Input handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(id ? "Data peralatan berhasil diperbarui!" : "Data peralatan berhasil ditambahkan!");
    navigate("/Peralatan");
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
              <div className="space-y-3">
                <label className="text-white font-semibold text-sm">Informasi Alat</label>

                <input type="text" name="nomorAlat" value={formData.nomorAlat} onChange={handleChange} placeholder="Nomor Alat" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <input type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="Nama" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <input type="text" name="fungsi" value={formData.fungsi} onChange={handleChange} placeholder="Fungsi" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <input type="text" name="merk" value={formData.merk} onChange={handleChange} placeholder="Merk" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <input type="text" name="tipe" value={formData.tipe} onChange={handleChange} placeholder="Tipe" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <input type="text" name="nomorSeri" value={formData.nomorSeri} onChange={handleChange} placeholder="Nomor Seri" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <div className="grid grid-cols-2 gap-2">
                  <input type="text" name="kodeBmn" value={formData.kodeBmn} onChange={handleChange} placeholder="Kode BMN" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
                  <input type="text" name="nup" value={formData.nup} onChange={handleChange} placeholder="NUP" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
                </div>

                <input type="date" name="waktuPengadaan" value={formData.waktuPengadaan} onChange={handleChange} className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <input type="text" name="lokasiPenyimpanan" value={formData.lokasiPenyimpanan} onChange={handleChange} placeholder="Lokasi Penyimpanan" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
              </div>

              {/* === Kolom 3 === */}
              <div className="space-y-3">
                <label className="text-white font-semibold text-sm">Kelengkapan Alat</label>

                <input type="text" name="kelengkapan1" value={formData.kelengkapan1} onChange={handleChange} placeholder="1." className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
                <input type="text" name="kelengkapan2" value={formData.kelengkapan2} onChange={handleChange} placeholder="2." className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
                <input type="text" name="kelengkapan3" value={formData.kelengkapan3} onChange={handleChange} placeholder="3." className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
                <input type="text" name="kelengkapan4" value={formData.kelengkapan4} onChange={handleChange} placeholder="4." className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />

                <label className="text-white font-semibold text-sm mt-4">Kalibrasi & Koreksi</label>
                <input type="date" name="kalibrasiTerakhir" value={formData.kalibrasiTerakhir} onChange={handleChange} className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
                <input type="text" name="koreksi" value={formData.koreksi} onChange={handleChange} placeholder="Koreksi" className="backdrop-blur-sm shadow-sm bg-white/90 w-full border border-blue-500 rounded-lg px-3 py-2 text-gray-800 focus:outline-none hover:scale-[1.03]" />
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-white/70 text-blue-700 font-semibold px-6 py-2 rounded-lg flex items-center gap-2 shadow hover:text-blue-900 hover:scale-[1.03] transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{id ? "Update" : "Simpan"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PeralatanForm;
