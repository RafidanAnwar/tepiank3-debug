import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut} from 'lucide-react';



export default function PengujianPembayaran() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeStep, setActiveStep] = useState(4);

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

  const steps = [
    { number: 1, title: 'Data Perusahaan/Instansi', subtitle: 'Isi dan lampirkan persyaratan Instansi' },
    { number: 2, title: 'Parameter Pengujian', subtitle: 'Masukkan Lokasi & Parameter Pengujian' },
    { number: 3, title: 'Status Pengajuan', subtitle: 'Pantau Perkembangan Pengajuan' },
    { number: 4, title: 'Informasi Pembayaran', subtitle: 'Ringkasan Pengujian Layanan & Pembayaran' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/home')}>
              <img className='max-w-40' src="./Tepian-K3-Logo-1.svg" alt="" />
              {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">TEPIAN<span className="text-blue-600">K3</span></h1>
                                <p className="text-xs text-gray-500">Balai Kesehatan Pengujian dan Laboratorium Kesehatan</p>
                            </div> */}
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
                    <button
                      onClick={() => navigate('/Profile')} className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 transition-colors">
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

            <h1 className='font-bold'>Pembayaran . . . </h1 >

        </div>


      </div>
    </div>
  );
}