import { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

function Home() {
  const [openFaq, setOpenFaq] = useState(0);

  const services = [
    { title: 'PENGUJIAN', icon: '🧪', color: 'from-blue-400 to-blue-600' },
    { title: 'PELATIHAN', icon: '💻', color: 'from-blue-400 to-blue-600' },
    { title: 'UJI KOMPETENSI', icon: '📋', color: 'from-blue-400 to-blue-600' },
    { title: 'KONSULTASI', icon: '🎧', color: 'from-blue-400 to-blue-600' }
  ];

  const faqs = [
    {
      question: 'Apa saja persyaratan yang harus dipenuhi untuk mendaftar ke pengujian online di Poltekkes Kemenkes?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      question: 'Bagaimana cara mendaftar untuk pengujian online?',
      answer: 'Silakan kunjungi menu pendaftaran dan ikuti langkah-langkah yang tersedia.'
    },
    {
      question: 'Bagaimana saya akan diberitahu tentang hasilnya?',
      answer: 'Hasil akan dikirimkan melalui email dan dapat diakses melalui dashboard Anda.'
    },
    {
      question: 'Bagaimana saya dapat menghubungi departemen atau staf yang berhubungan dengan pendaftaran jika saya memiliki pertanyaan atau masalah?',
      answer: 'Anda dapat menghubungi kami melalui menu konsultasi atau email support@tepiank3.com'
    },
    {
      question: 'Apakah biaya pendaftaran dapat dikembalikan jika saya membatalkan pendaftaran?',
      answer: 'Kebijakan pengembalian dana berlaku sesuai dengan syarat dan ketentuan yang berlaku.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">TEPIAN<span className="text-blue-600">K3</span></h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Beranda</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Transaksi</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Troli</a>
            </nav>

            {/* Search & User */}
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
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">Musfiq</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-8">
                <div className="text-white space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-4xl">👷</span>
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-4xl">🏭</span>
                    </div>
                  </div>
                </div>
                <div className="text-white space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-4xl">👩‍🔬</span>
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 inline-block">
                <div className="text-white font-bold text-2xl mb-2">#bangga</div>
                <div className="text-white font-bold text-2xl mb-2">melayani</div>
                <div className="text-white font-bold text-2xl">bangsa</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Silahkan Pilih Layanan:</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className={`bg-gradient-to-br ${service.color} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow`}>
                <div className="bg-white rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-md">
                  <span className="text-4xl">{service.icon}</span>
                </div>
                <h3 className="text-white font-bold text-center text-lg">{service.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">FAQ (Frequently Asked Questions)</h2>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-800 font-medium pr-4">{faq.question}</span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openFaq === index ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    <ChevronDown className={`w-5 h-5 transition-transform ${
                      openFaq === index ? 'transform rotate-180 text-white' : 'text-gray-600'
                    }`} />
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Logo */}
        <div className="text-center pb-12">
          <div className="inline-block">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-gray-800">Digital</p>
                <p className="text-xl font-bold text-gray-800">Ecosystem</p>
                <p className="text-xl font-bold text-gray-800">Development</p>
                <p className="text-xs text-gray-500 mt-1">BALAI 23 SAMARINDA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;