import { useState, useRef, useEffect, useMemo, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Minus, Save, ShoppingCart, Loader } from 'lucide-react';
import PengujianCart from './PengujianCart';
import { NavBar } from '../../components/layout/NavBar';
import { ContextApi } from '../../context/ContextApi';
import { clusterService } from '../../services/clusterService';
import { pengujianService } from '../../services/pengujianService';
import { useApi } from '../../hooks/useApi';

export default function PengujianParameter() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(2);
    const [selectedCategory, setSelectedCategory] = useState('LINGKUNGAN KERJA');
    const [selectedLocation, setSelectedLocation] = useState('Workshop PT. SSB');
    const [loading, setLoading] = useState(false);
    const [selectedJenis, setSelectedJenis] = useState("");
    const [selectedJenisId, setSelectedJenisId] = useState(null);

    const { user } = useContext(ContextApi);
    const { data: clusters, loading: clustersLoading } = useApi(() => clusterService.getClusters());

    // When cluster selection changes, reset jenis pengujian
    useEffect(() => {
        setSelectedJenis("");
        setSelectedJenisId(null);
    }, [selectedCategory]);

    // AUTO-LOAD progres cart/lokasi/cluster/jenis dari localStorage
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
        const savedProgress = JSON.parse(localStorage.getItem('pengujianParameterProgress') || '{}');
        if (savedProgress) {
            if (savedProgress.quantities) setQuantities(savedProgress.quantities);
            if (savedProgress.selectedLocation) setSelectedLocation(savedProgress.selectedLocation);
            if (savedProgress.locations) setLocations(savedProgress.locations);
            if (savedProgress.selectedCategory) setSelectedCategory(savedProgress.selectedCategory);
            if (savedProgress.selectedJenis) setSelectedJenis(savedProgress.selectedJenis);
            if (savedProgress.selectedJenisId) setSelectedJenisId(savedProgress.selectedJenisId);
        }
    }, [user, navigate]);

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

    const categories = useMemo(() => {
        if (!clusters) return [];
        return clusters.map(cluster => ({
            id: cluster.name.toUpperCase(),
            name: cluster.name.toUpperCase(),
            select: cluster.icon || './icon-cluster.svg',
            unselect: cluster.icon || './icon-cluster.svg',
            color: 'from-blue-400 to-blue-600',
            data: cluster
        }));
    }, [clusters]);

    // testParameters (cluster → jenis → params)
    const testParameters = useMemo(() => {
        if (!clusters) return {};

        const params = {};
        clusters.forEach(cluster => {
            const clusterKey = cluster.name.toUpperCase();
            params[clusterKey] = {};
            cluster.jenisPengujian?.forEach(jenis => {
                params[clusterKey][jenis.name] = jenis.parameters?.map(param => ({
                    name: param.name,
                    date: param.acuan || 'Standar Pengujian',
                    price: parseFloat(param.harga),
                    id: param.id
                })) || [];
            });
        });
        return params;
    }, [clusters]);

    // get jenisPengujian list untuk cluster terpilih
    const jenisList = useMemo(() => {
        return clusters && clusters.length
            ? (clusters.find(c => c.name.toUpperCase() === selectedCategory)?.jenisPengujian || [])
            : [];
    }, [selectedCategory, clusters]);

    useEffect(() => {
        if (!selectedJenisId && selectedJenis) {
            const jenis = jenisList.find(j => j.name === selectedJenis);
            if (jenis) {
                setSelectedJenisId(jenis.id);
            }
        }
    }, [jenisList, selectedJenis, selectedJenisId]);

    // parameter hanya untuk cluster & jenis terpilih
    const parameterList = useMemo(() => {
        if (!selectedCategory || !selectedJenis) return [];
        return testParameters[selectedCategory]?.[selectedJenis] || [];
    }, [selectedCategory, selectedJenis, testParameters]);

    const [quantities, setQuantities] = useState({});
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const newCartItems = [];
        Object.entries(quantities).forEach(([key, qty]) => {
            if (qty > 0) {
                const [categoryId, factorType, paramName] = key.split('-');
                const tests = testParameters[categoryId]?.[factorType];
                const test = tests?.find(t => t.name === paramName);
                if (test) {
                    newCartItems.push({
                        id: key,
                        name: test.name,
                        jenisPengujian: factorType,
                        price: test.price,
                        quantity: qty,
                        subtotal: test.price * qty,
                        parameterId: test.id
                    });
                }
            }
        });
        setCartItems(newCartItems);
    }, [quantities, testParameters]);

    const handleUpdateQuantity = (itemId, newQuantity) => {
        setQuantities(prev => ({
            ...prev,
            [itemId]: newQuantity
        }));
    };

    const handleRemoveItem = (itemId) => {
        setQuantities(prev => {
            const newQuantities = { ...prev };
            delete newQuantities[itemId];
            return newQuantities;
        });
    };

    const handleClearCart = () => {
        setQuantities({});
    };

    const handleQuantityChange = useCallback((categoryId, factorType, paramName, change) => {
        const key = `${categoryId}-${factorType}-${paramName}`;
        setQuantities(prev => {
            const currentQty = prev[key] || 0;
            const newQty = Math.max(0, Math.min(999, currentQty + change));
            return {
                ...prev,
                [key]: newQty
            };
        });
    }, []);

    const getCurrentCategoryTests = useMemo(() => {
        return testParameters[selectedCategory] || {};
    }, [selectedCategory]);

    const [newLoc, setNewLoc] = useState({
        name: "",
        city: "",
        type: "",
        district: "",
    });

    const handleAddLoc = () => {
        if (!newLoc.name || !newLoc.city || !newLoc.district) {
            alert("Harap isi semua field!");
            return;
        }

        const newData = {
            id: Date.now(),
            name: newLoc.name.trim(),
            type: newLoc.type.trim() || 'General',
            city: newLoc.city.trim(),
            district: newLoc.district.trim(),
        };

        setLocations(prev => [...prev, newData]);
        setNewLoc({ name: "", type: "", city: "", district: "" });
        setSelectedLocation(newData.name);
    };

    const handleSave = async () => {
        if (cartItems.length === 0) {
            alert('Pilih minimal satu parameter pengujian');
            return;
        }
        localStorage.setItem('pengujianParameterProgress', JSON.stringify({
            quantities,
            selectedLocation,
            locations,
            selectedCategory,
            selectedJenis,
            selectedJenisId
        }));
        alert('Progres disimpan! Anda bisa lanjutkan nanti. Klik Order jika sudah yakin.');
    };

    const handleOrder = async () => {
        if (cartItems.length === 0) {
            alert('Pilih minimal satu parameter pengujian');
            return;
        }
        if (!selectedJenisId && !selectedJenis) {
            alert('Pilih jenis pengujian terlebih dahulu');
            return;
        }
        const resolvedJenis = selectedJenisId || jenisList.find(j => j.name === selectedJenis)?.id;
        if (!resolvedJenis) {
            alert('Jenis pengujian tidak valid. Silakan pilih ulang.');
            return;
        }
        try {
            setLoading(true);
            const companyData = JSON.parse(localStorage.getItem('companyData') || '{}');

            const pengujianData = {
                jenisPengujianId: resolvedJenis,
                items: cartItems.map(item => ({
                    parameterId: item.parameterId,
                    quantity: item.quantity
                })),
                lokasi: selectedLocation,
                company: companyData.namaPerusahaan,
                address: companyData.alamatPerusahaan || '',
                contactPerson: companyData.namaPenanggungJawab,
                phone: companyData.noHpPenanggungJawab,
                logo: companyData.logo // Add logo from local storage
            };

            const response = await pengujianService.createPengujianWithCompany(pengujianData);
            alert('Pesanan berhasil dibuat!');
            localStorage.removeItem('companyData');
            localStorage.removeItem('pengujianParameterProgress'); // clear progres after order!

            // Navigate to status page with the created order ID
            navigate('/status-pengujian', {
                state: { orderId: response.data.order?.id }
            });
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Gagal membuat pesanan: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Data Perusahaan/Instansi', subtitle: 'Isi dan lampirkan persyaratan Instansi' },
        { number: 2, title: 'Parameter Pengujian', subtitle: 'Masukkan Lokasi & Parameter Pengujian' },
        { number: 3, title: 'Status Pengajuan', subtitle: 'Pantau Perkembangan Pengajuan' },
        { number: 4, title: 'Informasi Pembayaran', subtitle: 'Ringkasan Pengujian Layanan & Pembayaran' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pengajuan Layanan Pengujian</h1>

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

                <div className="bg-white h-380 rounded-2xl shadow-lg p-8 mb-8">
                    <p className="text-center text-gray-600 mb-8">Silahkan masukan data lokasi pengujian dan pilih parameter yang akan diuji</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className='pb-10'>
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
                                    <div className='w-120'>
                                        <input
                                            type="text"
                                            value={newLoc.type}
                                            onChange={(e) => setNewLoc({ ...newLoc, type: e.target.value })}
                                            placeholder="Workshop/Office/dll.."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Parameter Pengujian</h3>
                                {clustersLoading ? (
                                    <div className="text-center py-4">Loading clusters...</div>
                                ) : (
                                    <div className="flex justify-between">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategory(category.id)}
                                                className={`p-1 rounded-xl transition-all border-2 ${selectedCategory === category.id
                                                    ? `bg-gradient-to-br ${category.color} text-white border-transparent shadow-lg`
                                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="flex justify-center items-center w-30 h-35 flex-col cursor-pointer">
                                                    <img className={`w-20`} src={category.select} alt="" />
                                                    <span className={`font-bold text-sm ${selectedCategory === category.id ? 'text-white' : 'text-gray-700'}`}>
                                                        {category.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Jenis Pengujian selector - tampil setelah pilih cluster */}
                            {jenisList.length > 0 && <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {jenisList.map(jenis => (
                                        <button
                                            key={jenis.id}
                                            onClick={() => {
                                                setSelectedJenis(jenis.name);
                                                setSelectedJenisId(jenis.id);
                                            }}
                                            className={`px-3 py-2 rounded-lg border transition-colors ${selectedJenis === jenis.name ? 'bg-green-500 text-white border-green-600' : 'bg-gray-50 border-gray-200 hover:bg-green-100'}`}
                                        >
                                            <span className="font-medium">{jenis.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>}

                            {/* Parameter pengujian - tampil setelah pilih jenis*/}
                            <div className="bg-gray-50 rounded-xl p-6 mt-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Parameter Pengujian</h3>
                                {(!selectedCategory || !selectedJenis) ? (
                                    <div className="text-gray-400 text-center">Pilih Cluster & Jenis Pengujian terlebih dahulu</div>
                                ) : parameterList.length === 0 ? (
                                    <div className="text-gray-400 text-center">Parameter tidak tersedia</div>
                                ) : (
                                    <div className="space-y-6">
                                        {parameterList.map((test, idx) => {
                                            const key = `${selectedCategory}-${selectedJenis}-${test.name}`;
                                            const qty = quantities[key] || 0;
                                            return (
                                                <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg">
                                                    <div className="col-span-3 text-sm text-gray-700">{test.name}</div>
                                                    <div className="col-span-3 text-xs text-gray-500">{test.date}</div>
                                                    <div className="col-span-3 text-sm font-semibold text-gray-800">Rp {(test.price || 0).toLocaleString('id-ID')},-</div>
                                                    <div className="col-span-3 flex items-center justify-end space-x-2">
                                                        <button onClick={() => handleQuantityChange(selectedCategory, selectedJenis, test.name, -1)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors" disabled={qty === 0}>
                                                            <Minus className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                        <span className="w-8 text-center font-semibold">{qty}</span>
                                                        <button onClick={() => handleQuantityChange(selectedCategory, selectedJenis, test.name, 1)} className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors">
                                                            <Plus className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <PengujianCart
                                items={cartItems}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onClearCart={handleClearCart}
                            />

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={cartItems.length === 0 || loading}
                                    className="flex-1 bg-linear-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={handleOrder}
                                    disabled={cartItems.length === 0 || loading}
                                    className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                                    <span>Order</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
