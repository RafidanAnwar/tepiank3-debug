import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut, MapPin, Plus, Minus, Save, ShoppingCart } from 'lucide-react';
import CostPanel from './CostPanel';

export default function PengujianParameter() {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeStep, setActiveStep] = useState(2);
    const [selectedCategory, setSelectedCategory] = useState('LINGKUNGAN KERJA');
    const [selectedLocation, setSelectedLocation] = useState('Workshop PT. SSB');

    const profileMenuRef = useRef(null);
    const userName = localStorage.getItem('userName') || 'Musfiq';

    // Location data
    const [locations, setLocations] = useState([
        {
            id: 1,
            name: 'Workshop PT. SSB',
            type: 'Workshop',
            city: 'Samarinda',
            district: 'Loa Janan'
        },
        {
            id: 2,
            name: 'Warehouse Utama',
            type: 'Warehouse',
            city: 'Samarinda',
            district: 'Loa Janan'
        },
        {
            id: 3,
            name: 'Office Utama',
            type: 'Office',
            city: 'Samarinda',
            district: 'Loa Janan'
        }
    ]);


    // Parameter categories
    const categories = [
        {
            id: 'LINGKUNGAN KERJA',
            name: 'LINGKUNGAN KERJA',
            select: './icon-claster-lingkunagn-kerja-select.svg',
            unselect: './icon-claster-lingkunagn-kerja-unselect.svg',
            icon: '👷',
            color: 'from-blue-400 to-blue-600'
        },
        {
            id: 'KESELAMATAN KERJA',
            name: 'KESELAMATAN KERJA',
            select: './icon-claster-keselamatan-kerja-select.svg',
            unselect: './icon-claster-keselamatan-kerja-unselect.svg',
            icon: '🦺',
            color: 'from-cyan-400 to-cyan-600'
        },
        {
            id: 'KESEHATAN KERJA',
            name: 'KESEHATAN KERJA',
            select: './icon-claster-kesehatan-kerja-select.svg',
            unselect: './icon-claster-kesehatan-kerja-unselect.svg',
            icon: '👂',
            color: 'from-blue-500 to-blue-700'
        },
        {
            id: 'BIOMARKER',
            name: 'BIOMARKER',
            select: './icon-claster-biomaker-select.svg',
            unselect: './icon-claster-biomaker-unselect.svg',
            icon: '🧪',
            color: 'from-cyan-500 to-cyan-700'
        },
        {
            id: 'LINGKUNGAN HIDUP',
            name: 'LINGKUNGAN HIDUP',
            select: './icon-claster-lingkungan-hidup-select.svg',
            unselect: './icon-claster-lingkungan-hidup-unselect.svg',
            icon: '🌿',
            color: 'from-blue-400 to-blue-600'
        }
    ];

    // Test parameters data
    const testParameters = {
        'LINGKUNGAN KERJA': {
            'Faktor Fisik': [
                { name: 'Kebisingan', date: 'Permeriksaan 05 Thn 2018', price: 150000 },
                { name: 'Kebisingan Personal', date: 'Permeriksaan 05 Thn 2018', price: 150000 },
                { name: 'Iklim Kerja', date: 'Permeriksaan 05 Thn 2018', price: 150000 },
                { name: 'Penerangan Umum', date: 'Permeriksaan 05 Thn 2018', price: 150000 },
                { name: 'Benzen', date: 'Permeriksaan 05 Thn 2018', price: 150000 }
            ],
            'Faktor Kimia': [
                { name: 'Toluen', date: 'Permeriksaan 05 Thn 2018', price: 150000 },
                { name: 'Xylen', date: 'Permeriksaan 05 Thn 2018', price: 150000 }
            ],
            'Faktor Biologi': [
                { name: 'Koloni Jamur', date: 'Permeriksaan 05 Thn 2018', price: 150000 },
                { name: 'Koloni Bakteri', date: 'Permeriksaan 05 Thn 2018', price: 150000 }
            ]
        },
        'KESELAMATAN KERJA': {
            'Bejana Tekan': [
                { name: 'Pemeriksaan', date: 'Permeriksaan 05 Thn 2018', price: 600000 }
            ],
            'Pembumian': [
                { name: 'Pemeriksaan', date: 'Permeriksaan 05 Thn 2018', price: 600000 }
            ]
        },
        'KESEHATAN KERJA': {
            'Kebisingen': [
                { name: 'Kebisingen', date: 'Permeriksaan 05 Thn 2018', price: 600000 },
                { name: 'Kebisingen', date: 'Permeriksaan 05 Thn 2018', price: 600000 }
            ]
        }
    };

    const [quantities, setQuantities] = useState({});
    const [cartItems, setCartItems] = useState([]);

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

    const handleQuantityChange = (categoryId, factorType, paramName, change) => {
        const key = `${categoryId}-${factorType}-${paramName}`;
        const currentQty = quantities[key] || 0;
        const newQty = Math.max(0, currentQty + change);

        setQuantities(prev => ({
            ...prev,
            [key]: newQty
        }));
    };

    const getCurrentCategoryTests = () => {
        return testParameters[selectedCategory] || {};
    };

    const calculateTotal = () => {
        let total = 0;
        Object.entries(quantities).forEach(([key, qty]) => {
            if (qty > 0) {
                const [categoryId, factorType, paramName] = key.split('-');
                const tests = testParameters[categoryId]?.[factorType];
                const test = tests?.find(t => t.name === paramName);
                if (test) {
                    total += test.price * qty;
                }
            }
        });
        return total;
    };


    // State input form
    const [newLoc, setNewLoc] = useState({
        name: "",
        city: "",
        type: "",
        district: "",
    });

    const handleAddLoc = () => {
        console.log(newLoc)
        if (!newLoc.name || !newLoc.city || !newLoc.district) {
            alert("Harap isi semua field!");
            return;
        }

        const newData = {
            id: locations.length + 1,
            name: newLoc.name,
            type: newLoc.type, // bisa disesuaikan
            city: newLoc.city,
            district: newLoc.district,
        };

        setLocations([...locations, newData]); // update state
        setNewLoc({ name: "", type: "", city: "", district: "" });
    }

    const handleSave = () => {
        console.log('Saved quantities:', quantities);
        alert('Data berhasil disimpan!');
    };

    const handleOrder = () => {
        console.log('Order placed:', quantities);
        alert('Pesanan berhasil dibuat!');
        navigate('/status-pengujian');
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

                {/* Main Card */}
                <div className="bg-white h-380 rounded-2xl shadow-lg p-8 mb-8">
                    <p className="text-center text-gray-600 mb-8">Silahkan masukan data lokasi pengujian dan pilih parameter yang akan diuji</p>




                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                        <div className="lg:col-span-2">

                            {/* Area/Lokasi Section */}
                            <div className='pb-10 '>
                                <div className="flex items-center space-x-2 mb-4">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-bold text-gray-800">Area/Lokasi Pengujian</h3>
                                </div>
                                <div className='flex justify-evenly'>

                                    <div className="flex space-y-3 w-210 overflow-x-auto gap-3 mr-3">
                                        {locations.map((location) => (
                                            <div
                                                key={location.id}
                                                onClick={() => setSelectedLocation(location.name)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedLocation === location.name
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-semibold text-gray-500">{location.type}</span>
                                                    <span className="text-xs font-bold text-blue-600">{location.id}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-800 mb-1">{location.name}</h4>
                                                <p className="text-xs text-gray-500">Kota/Kabupaten: <span className="font-medium">{location.city}</span></p>
                                                <p className="text-xs text-gray-500">Kecamatan: <span className="font-medium">{location.district}</span></p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='w-120' >
                                        <input
                                            type="text"
                                            value={newLoc.type}
                                            onChange={(e) => setNewLoc({ ...newLoc, type: e.target.value })}
                                            placeholder="Workshop/Office/dll.."
                                            className="w-full  px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            value={newLoc.name}
                                            onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                                            placeholder="Workshop Cabang/dll.."
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            value={newLoc.city}
                                            onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })}
                                            placeholder="Kota/Kabupaten"
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            value={newLoc.district}
                                            placeholder="Kecamatan"
                                            onChange={(e) => setNewLoc({ ...newLoc, district: e.target.value })}
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                    </div>
                                    <button
                                        onClick={handleAddLoc}
                                        className="w-8 mx-3 flex-1 bg-linear-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Parameter Categories */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Parameter Pengujian</h3>
                                {/* <div className="grid grid-cols-1 gap-3"> */}
                                <div className="flex justify-between">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`p-1 rounded-xl transition-all border-2 ${selectedCategory === category.id
                                                ? `bg-linear-to-br ${category.color} text-white border-transparent shadow-lg`
                                                : 'bg-white border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex justify-center items-center w-30 h-35 flex-col cursor-pointer">
                                                <img className={`w-20`} src={selectedCategory === category.id ? category.select : category.unselect} alt="" />

                                                {/* <span className="text-2xl">{category.icon}</span> */}
                                                <span className={`font-bold text-sm ${selectedCategory === category.id ? 'text-white' : 'text-gray-700'}`}>
                                                    {category.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Middle - Test Parameters */}
                            <div className="bg-gray-50 rounded-xl p-6 mt-10">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Jenis Pengujian</h3>

                                <div className="space-y-6">
                                    {Object.entries(getCurrentCategoryTests()).map(([factorType, tests]) => (
                                        <div key={factorType}>
                                            <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">{factorType}</h4>
                                            <div className="space-y-2">
                                                {tests.map((test, idx) => {
                                                    const key = `${selectedCategory}-${factorType}-${test.name}`;
                                                    const qty = quantities[key] || 0;

                                                    return (
                                                        <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg">
                                                            <div className="col-span-3 text-sm text-gray-700">{test.name}</div>
                                                            <div className="col-span-3 text-xs text-gray-500">{test.date}</div>
                                                            <div className="col-span-3 text-sm font-semibold text-gray-800">
                                                                Rp {test.price.toLocaleString('id-ID')},-
                                                            </div>
                                                            <div className="col-span-3 flex items-center justify-end space-x-2">
                                                                <button
                                                                    onClick={() => handleQuantityChange(selectedCategory, factorType, test.name, -1)}
                                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                                    disabled={qty === 0}
                                                                >
                                                                    <Minus className="w-4 h-4 text-gray-600" />
                                                                </button>
                                                                <span className="w-8 text-center font-semibold">{qty}</span>
                                                                <button
                                                                    onClick={() => handleQuantityChange(selectedCategory, factorType, test.name, 1)}
                                                                    className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
                                                                >
                                                                    <Plus className="w-4 h-4 text-white" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                        </div>



                        {/* Left Side - Locations & Categories */}
                        <div className="space-y-6">
                            {/* Area/Lokasi Section */}
                            {/* <div className='pb-10 border-b border-gray-300'>
                                <div className="flex items-center space-x-2 mb-4">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-bold text-gray-800">Area/Lokasi Pengujian</h3>
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto ">
                                    {locations.map((location) => (
                                        <div
                                            key={location.id}
                                            onClick={() => setSelectedLocation(location.name)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedLocation === location.name
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-gray-500">{location.type}</span>
                                                <span className="text-xs font-bold text-blue-600">{location.id}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 mb-1">{location.name}</h4>
                                            <p className="text-xs text-gray-500">Kota/Kabupaten: <span className="font-medium">{location.city}</span></p>
                                            <p className="text-xs text-gray-500">Kecamatan: <span className="font-medium">{location.district}</span></p>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nama area/lokasi (Contoh: Workshop)"
                                    className="w-full mt-4 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Kota/Kabupaten"
                                    className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Kecamatan"
                                    className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleSave}
                                    className="w-full mt-3 flex-1 bg-linear-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                                >
                                    Add
                                </button>
                            </div> */}

                            {/* Parameter Categories */}
                            {/* <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Parameter Pengujian</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`p-4 rounded-xl transition-all border-2 ${selectedCategory === category.id
                                                ? `bg-linear-to-br ${category.color} text-white border-transparent shadow-lg`
                                                : 'bg-white border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3 cursor-pointer">
                                                <span className="text-2xl">{category.icon}</span>
                                                <span className={`font-bold text-sm ${selectedCategory === category.id ? 'text-white' : 'text-gray-700'}`}>
                                                    {category.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div> */}

                            {/*resume*/}

                            <CostPanel />

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-linear-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={handleOrder}
                                    className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Order</span>
                                </button>
                            </div>

                        </div>




                    </div>
                </div>

                {/* CTA Section */}
                {/* <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-12 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Pellentesque suscipit fringilla libero eu.</h2>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                        Get a Demo →
                    </button>
                </div> */}
            </div>
        </div>
    );
}