import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut, Check, Circle, Lock, CircleDot, Save } from 'lucide-react';
import { NavBar } from './NavBar';

// Data untuk langkah-langkah (steps) pada progress tracker
const progres = [
  {
    id: 1,
    label: 'Order Terkirim',
    status: 'completed',
  },
  {
    id: 2,
    label: 'Sedang Diproses',
    status: 'in-progress' // Sudah dilewati, tapi bukan fokus
  },
  {
    id: 3,
    label: 'Menunggu Persetujuan',
    status: 'in-progress'
  },
  {
    id: 4,
    label: 'Disetujui',
    status: 'completed' // Selesai
  },
  {
    id: 5,
    label: 'Menunggu Penawaran',
    status: 'in-progress', // Langkah Saat Ini (Lingkaran Berongga pada gambar)
  },
  {
    id: 6,
    label: 'Penawaran Dibuat',
    status: 'in-progress'
  },
  {
    id: 7,
    label: 'Unduh Penawaran',
    status: 'active' // Fokus aktif (lingkaran solid pada gambar)
  },
  {
    id: 8,
    label: 'Unggah Persetujuan',
    status: 'current' // Belum disentuh (lingkaran berongga yang lebih kecil)
  },
  {
    id: 9,
    label: 'Invoice Dibuat',
    status: 'pending'
  },
  {
    id: 10,
    label: 'Unduh Invoice',
    status: 'pending' // Terkunci
  },
  {
    id: 11,
    label: 'Informasi Pembayaran',
    status: 'locked' // Terkunci
  },
];


// Helper function untuk menentukan ikon dan styling
const getStepIcon = (status) => {
  const baseStyle = "w-10 h-10"; // Ukuran default
  const completedStyle = "p-0.5 text-white bg-blue-700 rounded-full";
  const activeStyle = "w-6 h-6 bg-blue-700 rounded-full"; // Lingkaran kecil solid
  const currentStyle = "p-1 border-2 border-blue-700 bg-white text-transparent rounded-full"; // Lingkaran berongga besar
  const pendingStyle = "w-6 h-6 border-2 border-gray-400 bg-white rounded-full text-transparent"; // Lingkaran berongga kecil
  const lockedStyle = " text-gray-500 bg-white";

  switch (status) {
    case 'completed':
      return <Check className={`${baseStyle} ${completedStyle}`} />;
    case 'current':
      return <Circle className={`${baseStyle} ${currentStyle}`} />;
    case 'active':
    case 'in-progress': // Untuk langkah-langkah di antaranya, kita gunakan lingkaran solid kecil
      return <div className={activeStyle}></div>;
    case 'pending':
      return <div className={pendingStyle}></div>;
    case 'locked':
      return <Lock className={`${baseStyle} ${lockedStyle}`} />;
    default:
      return <div className={activeStyle}></div>;
  }
};


export default function PengujianStatus() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeStep, setActiveStep] = useState(3);

  const profileMenuRef = useRef(null);
  const userName = localStorage.getItem('userName') || 'Musfiq';


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

  const handlePembayaran = () => {
    navigate('/pembayaran-pengujian');
  };

  
    const handleUnduhPenawaran = () => {
      alert("Unduh Penawaran");
    }
  
    const handleUnggahPersetujuan = () => {
      alert("Unggah Penawaran");
    }
  
    const handleUnduhInvoice = () => {
      alert("Unduh Invoice");
    }
  
  
  const steps = [
    { number: 1, title: 'Data Perusahaan/Instansi', subtitle: 'Isi dan lampirkan persyaratan Instansi' },
    { number: 2, title: 'Parameter Pengujian', subtitle: 'Masukkan Lokasi & Parameter Pengujian' },
    { number: 3, title: 'Status Pengajuan', subtitle: 'Pantau Perkembangan Pengajuan' },
    { number: 4, title: 'Informasi Pembayaran', subtitle: 'Ringkasan Pengujian Layanan & Pembayaran' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <NavBar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pengajuan Layanan Pengujian</h1>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${activeStep === step.number
                    ? 'bg-linear-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                    : activeStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}>
                    {activeStep > step.number ? '✓' : step.number}
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

        {/* Main Status */}
        <div className="bg-white h-380 rounded-2xl shadow-lg p-8 mb-8">

          <div className="p-4 sm:p-8 in-h-screen flex justify-center">
            <div className="w-full max-w-xs p-6">
              <div className="relative">

                {/* Garis Vertikal (Timeline) */}
                <div className="absolute top-1 left-3 h-[calc(100%-40px)] border-l-2 border-blue-300 z-0"></div>

                {/* Daftar Langkah */}
                {progres.map((step, index) => {

                  // Tentukan style label (bold atau normal)
                  const labelStyle = step.status === 'active' || step.label === 'Goals'
                    ? 'font-bold text-gray-900'
                    : 'font-medium text-gray-700';

                  // Khusus untuk langkah yang terkunci (agar ikon sejajar dengan teks)
                  const isLocked = step.status === 'locked';

                  return (
                    <div key={step.id} className="relative z-10 mb-20 flex items-start">

                      {/* Ikon Langkah */}
                      <div className="shrink-0 mr-3 mt-0.5">
                        {getStepIcon(step.status)}
                      </div>

                      {/* Label Langkah */}
                      <div className="flex-col items-center">
                        <span
                          className={`${labelStyle} text-base leading-tight ${isLocked ? 'text-gray-500' : ''}`}
                        >
                          {step.label}
                        </span>

                        {step.label === "Unduh Penawaran" && (

                          <button

                            onClick={step.status === "pending" ? undefined : handleUnduhPenawaran}
                            className={`flex-1 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-lg ${step.status === "pending" ? "bg-gray-300" : "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all hover:shadow-xl cursor-pointer"}`}
                          >
                            <Save className="w-5 h-5" />
                            <span>Unduh</span>
                          </button>
                        )}
                        {step.label === "Unggah Persetujuan" && (

                          <button
                            onClick={step.status === "pending" ? undefined : handleUnggahPersetujuan}
                            className={`flex-1 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-lg ${step.status === "pending" ? "bg-gray-300" : "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all hover:shadow-xl cursor-pointer"}`}
                          >
                            <Save className="w-5 h-5" />
                            <span>Unggah</span>
                          </button>
                        )}
                        {step.label === "Unduh Invoice" && (

                          <button
                            onClick={step.status === "pending" ? undefined : handleUnduhInvoice}
                            className={`flex-1 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-lg ${step.status === "pending" ? "bg-gray-300" : "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all hover:shadow-xl cursor-pointer"}`}
                          >
                            <Save className="w-5 h-5" />
                            <span>Invoice</span>
                          </button>
                        )}
                        {step.label === "Informasi Pembayaran" && (

                          <button
                          onClick={step.status === "pending" ? undefined : handlePembayaran}
                      
                            className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <Save className="w-5 h-5" />
                            <span>Pembayaran</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>


      </div>
    </div>
  );
}