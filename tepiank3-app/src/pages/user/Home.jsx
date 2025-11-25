import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut } from 'lucide-react';
import { NavBar } from '../../components/layout/NavBar';
import { ContextApi } from '../../context/ContextApi';

export default function HomePage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(0);
    const { user, setUser } = useContext(ContextApi);
    // const [showUserMenu, setShowUserMenu] = useState(false);
    // const [user, setUser] = useState(null);

    // Check authentication
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);


    if (!user) return null;

    const services = [
        { title: 'PENGUJIAN', icon: '🧪', picture: "./Icon-Pengujian-Circle.svg", color: 'from-blue-400 to-blue-600' },
        { title: 'PELATIHAN', icon: '💻', picture: "./Icon-pelatihan-circle.svg", color: 'from-blue-400 to-blue-600' },
        { title: 'UJI KOMPETENSI', icon: '📋', picture: "./Icon-Ukom-Circle.svg", color: 'from-blue-400 to-blue-600' },
        { title: 'KONSULTASI', icon: '🎧', picture: "./Icon-Konsultasi-Circle.svg", color: 'from-blue-400 to-blue-600' }
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
            <NavBar />

            {/* Hero Section */}
            <div className="relative overflow-hidden flex justify-center">
                <img className='max-w-[1280px]' src="./web-banner-1.svg" alt="" />
            </div>

            {/* Services Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Silahkan Pilih Layanan:</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            onClick={() => service.title === 'PENGUJIAN' && navigate('/pengujian')}
                            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                        >
                            <div className={`bg-gradient-to-br ${service.color} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow`}>
                                <div className="bg-white rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-md">
                                    {/* <span className="text-4xl">{service.icon}</span> */}
                                    <img src={service.picture} alt="" />
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
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === index ? 'bg-green-500' : 'bg-gray-200'
                                        }`}>
                                        <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'transform rotate-180 text-white' : 'text-gray-600'
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
                        <img className='w-55' src="./Logo-DED-Balai-K3-Smr-1.svg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}