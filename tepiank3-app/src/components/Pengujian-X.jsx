import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut, Upload, Save, Edit } from 'lucide-react';

export default function PengujianX() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const profileMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const userName = localStorage.getItem('userName') || 'Musfiq';

  const [formData, setFormData] = useState({
    namaPerusahaan: '',
    jenisKegiatan: '',
    jmlTenagaKerjaPria: '',
    jmlTenagaKerjaWanita: '',
    provinsi: '',
    kota: '',
    fasilitasKesehatan: '',
    kecamatan: '',
    kelurahan: '',
    namaPenanggungJawab: '',
    emailPerusahaan: '',
    noHpPenanggungJawab: '',
    statusWlkp: '',
    emailPenanggungJawab: '',
    nomorWlkp: ''
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    alert('Data berhasil disimpan!');
  };

  const steps = [
    { number: 1, title: 'Data Perusahaan/Instansi', subtitle: 'Isi dan lampirkan persyaratan Instansi' },
    { number: 2, title: 'Parameter Pengujian', subtitle: 'Masukkan Lokasi & Parameter Pengujian' },
    { number: 3, title: 'Informasi Pembayaran', subtitle: 'Ringkasan Pengujian Layanan & Pembayaran' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">TEPIAN<span className="text-blue-600">K3</span></h1>
                <p className="text-xs text-gray-500">Balai Kesehatan Pengujian dan Laboratorium Kesehatan</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/home')} className="text-gray-700 hover:text-blue-600 font-medium">Beranda</button>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Riwayat</a>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative hidden lg:block">
                <input
                  type="text"
                  placeholder="Search here.."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                    <button className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 transition-colors">
                      <UserCircle className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700 font-medium">Profile</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-red-50 transition-colors group">
                      <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                      <span className="text-sm text-gray-700 group-hover:text-red-600 font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pengajuan Layanan Pengujian</h1>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    activeStep === step.number 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg' 
                      : activeStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number}
                  </div>
                  <div className={`mt-2 text-center max-w-xs ${activeStep === step.number ? 'block' : 'hidden md:block'}`}>
                    <p className={`text-sm font-semibold ${activeStep === step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 ${activeStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Logo Upload Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center">
                  <div className="w-full aspect-square bg-gray-200 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-white rounded-lg flex items-center justify-center mb-2">
                          <Upload className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-sm">Upload Logo</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white border-2 border-green-500 text-green-600 py-2 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
                  <input
                    type="text"
                    name="namaPerusahaan"
                    value={formData.namaPerusahaan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama Perusahaan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kegiatan Usaha (KLU)</label>
                  <select
                    name="jenisKegiatan"
                    value={formData.jenisKegiatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih...</option>
                    <option value="industri">Industri</option>
                    <option value="perdagangan">Perdagangan</option>
                    <option value="jasa">Jasa</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Perusahaan (Nama Jalan/Gang & Nomor Bangunan)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Alamat lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jml Tenaga Kerja Pria</label>
                  <input
                    type="number"
                    name="jmlTenagaKerjaPria"
                    value={formData.jmlTenagaKerjaPria}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jml Tenaga Kerja Wanita</label>
                  <input
                    type="number"
                    name="jmlTenagaKerjaWanita"
                    value={formData.jmlTenagaKerjaWanita}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                  <input
                    type="text"
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten</label>
                  <input
                    type="text"
                    name="kota"
                    value={formData.kota}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas Kesehatan</label>
                  <select
                    name="fasilitasKesehatan"
                    value={formData.fasilitasKesehatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih...</option>
                    <option value="ada">Ada</option>
                    <option value="tidak">Tidak Ada</option>
                  </select>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
                  <input
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelurahan</label>
                  <input
                    type="text"
                    name="kelurahan"
                    value={formData.kelurahan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Penanggung Jawab Pengujian (Pihak perusahaan)</label>
                <input
                  type="text"
                  name="namaPenanggungJawab"
                  value={formData.namaPenanggungJawab}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 6 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Perusahaan</label>
                <input
                  type="email"
                  name="emailPerusahaan"
                  value={formData.emailPerusahaan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 7 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. HP Penanggung Jawab Pengujian (Pihak perusahaan)</label>
                <input
                  type="tel"
                  name="noHpPenanggungJawab"
                  value={formData.noHpPenanggungJawab}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 8 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status WLKP Online</label>
                  <select
                    name="statusWlkp"
                    value={formData.statusWlkp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih...</option>
                    <option value="aktif">Aktif</option>
                    <option value="tidak-aktif">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Penanggung Jawab Pengujian (Pihak perusahaan)</label>
                  <input
                    type="email"
                    name="emailPenanggungJawab"
                    value={formData.emailPenanggungJawab}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 9 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor WLKP Online</label>
                <input
                  type="text"
                  name="nomorWlkp"
                  value={formData.nomorWlkp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Simpan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {/* <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-12 text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Pellentesque suscipit fringilla libero eu.</h2>
          <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
            Get a Demo →
          </button>
        </div> */}
      </div>
    </div>
  );
}