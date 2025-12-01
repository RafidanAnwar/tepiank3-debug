import { useState, useRef, useEffect, useMemo, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Plus, Minus, Save, ShoppingCart, Loader, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import PengujianCart from './PengujianCart';
import { NavBar } from '../../components/layout/NavBar';
import { useCart } from '../../context/CartContext'; // Import useCart
import { ContextApi } from '../../context/ContextApi'; // Restore ContextApi import
import { clusterService } from '../../services/clusterService';
import { pengujianService } from '../../services/pengujianService';
import { useApi } from '../../hooks/useApi';
import api from '../../services/api';

export default function PengujianParameter() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(2);
    const [selectedCategory, setSelectedCategory] = useState('LINGKUNGAN KERJA');
    const [selectedLocation, setSelectedLocation] = useState(''); // Start empty
    const [loading, setLoading] = useState(false);
    const [selectedJenis, setSelectedJenis] = useState("");
    const [selectedJenisId, setSelectedJenisId] = useState(null);
    const location = useLocation();
    const [isRevision, setIsRevision] = useState(false);
    const [revisionNote, setRevisionNote] = useState(null);
    const [orderId, setOrderId] = useState(null);

    // Carousel State
    const [clusterStartIndex, setClusterStartIndex] = useState(0);
    const CLUSTERS_PER_PAGE = 5;

    // Table Pagination State
    const [currentTablePage, setCurrentTablePage] = useState(1);
    const ITEMS_PER_PAGE = 10; // Consistent number of rows per page

    const { user } = useContext(ContextApi);
    const { setCartItems: setGlobalCartItems, setIsRevisionMode } = useCart();
    const { data: clusters, loading: clustersLoading } = useApi(() => clusterService.getClusters());

    // When cluster selection changes, reset jenis pengujian and table page
    useEffect(() => {
        setSelectedJenis("");
        setSelectedJenisId(null);
        setCurrentTablePage(1);
    }, [selectedCategory]);

    // Check auth only
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Load revision data - handle both orderId and full revisionOrder
    useEffect(() => {
        const loadRevisionData = async () => {
            // Check both patterns: { orderId } or { revisionOrder, isRevision }
            const stateOrderId = location.state?.orderId;
            const revOrder = location.state?.revisionOrder;
            const isRevisionFlag = location.state?.isRevision;

            let orderIdToLoad = null;

            // Pattern 1: Direct orderId from old notifications
            if (stateOrderId) {
                orderIdToLoad = stateOrderId;
            }
            // Pattern 2: Full revisionOrder object from Pengujian page
            else if (isRevisionFlag && revOrder) {
                orderIdToLoad = revOrder.id;
                setRevisionNote(revOrder.notes); // Pre-set notes from object
            }

            if (orderIdToLoad) {
                try {
                    setLoading(true);
                    const response = await api.get(`/orders/${orderIdToLoad}`);
                    const order = response.data;

                    setIsRevision(true);
                    setIsRevisionMode(true); // Disable cart in revision mode
                    setRevisionNote(order.notes || revOrder?.notes);
                    setOrderId(order.id);

                    // Reconstruct locations from order items
                    const uniqueLocs = [...new Set(order.orderItems.map(item => item.location))];
                    const reconstructedLocations = uniqueLocs.map((locName, index) => ({
                        id: Date.now() + index,
                        name: locName,
                        type: 'Office',
                        city: '',
                        district: '',
                        province: ''
                    }));

                    setLocations(reconstructedLocations);
                    if (reconstructedLocations.length > 0) {
                        setSelectedLocation(reconstructedLocations[0].name);
                    }

                    // Reconstruct quantities from order items
                    const newQuantities = {};
                    order.orderItems.forEach(item => {
                        // Find the parameter details to get jenisPengujian name
                        const cluster = clusters?.find(c =>
                            c.jenisPengujian?.some(j =>
                                j.parameters?.some(p => p.id === item.parameterId)
                            )
                        );

                        if (cluster) {
                            const jenis = cluster.jenisPengujian.find(j =>
                                j.parameters?.some(p => p.id === item.parameterId)
                            );

                            if (jenis) {
                                const param = jenis.parameters.find(p => p.id === item.parameterId);
                                if (param) {
                                    const key = `${item.location}|${cluster.name.toUpperCase()}|${jenis.name}|${param.name}`;
                                    newQuantities[key] = item.quantity;

                                    // Auto-select the first cluster and jenis
                                    if (!selectedCategory) {
                                        setSelectedCategory(cluster.name.toUpperCase());
                                    }
                                    if (!selectedJenis) {
                                        setSelectedJenis(jenis.name);
                                        setSelectedJenisId(jenis.id);
                                    }
                                }
                            }
                        }
                    });

                    setQuantities(newQuantities);

                    // Save to localStorage for persistence
                    localStorage.setItem('pengujianParameterProgress', JSON.stringify({
                        quantities: newQuantities,
                        selectedLocation: reconstructedLocations[0]?.name || '',
                        locations: reconstructedLocations,
                        selectedCategory: selectedCategory || Object.keys(newQuantities)[0]?.split('|')[1],
                        selectedJenis: selectedJenis || '',
                        selectedJenisId: selectedJenisId
                    }));

                } catch (error) {
                    console.error("Error loading revision data", error);
                    alert('Gagal memuat data revisi: ' + (error.response?.data?.error || error.message));
                } finally {
                    setLoading(false);
                }
            }
        };

        // Only load if we have clusters data
        if (clusters && clusters.length > 0) {
            loadRevisionData();
        }
    }, [location.state, clusters]); // Added clusters dependency

    // Load saved progress from localStorage if available
    useEffect(() => {
        const savedProgress = localStorage.getItem('pengujianParameterProgress');
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                if (parsed.locations && parsed.locations.length > 0) {
                    const migratedLocations = parsed.locations.map(loc => ({
                        ...loc,
                        province: loc.province || '' // Ensure province exists
                    }));
                    setLocations(migratedLocations);
                }
                if (parsed.selectedLocation) setSelectedLocation(parsed.selectedLocation);
                if (parsed.quantities) setQuantities(parsed.quantities);
                if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
                if (parsed.selectedJenis) setSelectedJenis(parsed.selectedJenis);
                if (parsed.selectedJenisId) setSelectedJenisId(parsed.selectedJenisId);
            } catch (e) {
                console.error("Failed to load saved progress", e);
            }
        }
    }, []);

    const [locations, setLocations] = useState([]);

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

    // Derived visible categories for carousel
    const visibleCategories = useMemo(() => {
        return categories.slice(clusterStartIndex, clusterStartIndex + CLUSTERS_PER_PAGE);
    }, [categories, clusterStartIndex]);

    const handlePrevCluster = () => {
        setClusterStartIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextCluster = () => {
        setClusterStartIndex(prev => Math.min(categories.length - CLUSTERS_PER_PAGE, prev + 1));
    };

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

    // Flattened Parameter List for Pagination
    const flatParameterList = useMemo(() => {
        if (!selectedCategory || !jenisList.length) return [];

        const flatList = [];
        jenisList.forEach(jenis => {
            const params = testParameters[selectedCategory]?.[jenis.name] || [];
            params.forEach(param => {
                flatList.push({
                    ...param,
                    jenisName: jenis.name,
                    jenisId: jenis.id
                });
            });
        });
        return flatList;
    }, [jenisList, selectedCategory, testParameters]);

    // Pagination Logic
    const totalTablePages = Math.ceil(flatParameterList.length / ITEMS_PER_PAGE);

    const paginatedFlatList = useMemo(() => {
        const startIndex = (currentTablePage - 1) * ITEMS_PER_PAGE;
        return flatParameterList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [flatParameterList, currentTablePage]);

    const handlePrevTablePage = () => setCurrentTablePage(p => Math.max(1, p - 1));
    const handleNextTablePage = () => setCurrentTablePage(p => Math.min(totalTablePages, p + 1));

    useEffect(() => {
        if (!selectedJenisId && selectedJenis) {
            const jenis = jenisList.find(j => j.name === selectedJenis);
            if (jenis) {
                setSelectedJenisId(jenis.id);
            }
        }
    }, [jenisList, selectedJenis, selectedJenisId]);

    const [quantities, setQuantities] = useState({});
    const [cartItems, setCartItems] = useState([]);

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

    // Update key generation to use pipe '|'
    useEffect(() => {
        const newCartItems = [];
        Object.entries(quantities).forEach(([key, qty]) => {
            if (qty > 0) {
                // key format: location|categoryId|factorType|paramName
                const parts = key.split('|');
                if (parts.length < 4) return; // Invalid key format

                const location = parts[0];
                const categoryId = parts[1];
                const factorType = parts[2];
                const paramName = parts.slice(3).join('|');

                const tests = testParameters[categoryId]?.[factorType];
                const test = tests?.find(t => t.name === paramName);

                // FIX: Find jenisId from clusters directly, not from currently selected jenisList
                // This ensures we get the correct ID even if the user switches categories
                const cluster = clusters?.find(c => c.name.toUpperCase() === categoryId);
                const jenis = cluster?.jenisPengujian?.find(j => j.name === factorType);
                const jenisId = jenis?.id;

                if (test) {
                    newCartItems.push({
                        id: key,
                        name: test.name,
                        jenisPengujian: factorType,
                        jenisPengujianId: jenisId,
                        price: test.price,
                        quantity: qty,
                        subtotal: test.price * qty,
                        parameterId: test.id,
                        location: location
                    });
                }
            }
        });
        setCartItems(newCartItems);
    }, [quantities, testParameters, clusters]);

    // Auto-sync with global cart
    useEffect(() => {
        setGlobalCartItems(cartItems);
    }, [cartItems, setGlobalCartItems]);

    const handleQuantityChange = useCallback((categoryId, factorType, paramName, change) => {
        if (!selectedLocation) {
            alert("Pilih lokasi terlebih dahulu!");
            return;
        }
        const key = `${selectedLocation}|${categoryId}|${factorType}|${paramName}`;
        setQuantities(prev => {
            const currentQty = prev[key] || 0;
            const newQty = Math.max(0, Math.min(999, currentQty + change));
            return {
                ...prev,
                [key]: newQty
            };
        });
    }, [selectedLocation]);

    const getCurrentCategoryTests = useMemo(() => {
        return testParameters[selectedCategory] || {};
    }, [selectedCategory]);

    const [newLoc, setNewLoc] = useState({
        name: "",
        city: "",
        type: "",
        district: "",
        province: "",
    });

    const handleAddLoc = () => {
        if (!newLoc.name || !newLoc.city || !newLoc.district || !newLoc.province) {
            alert("Harap isi semua field!");
            return;
        }

        const newData = {
            id: Date.now(),
            name: newLoc.name.trim(),
            type: newLoc.type.trim() || 'General',
            city: newLoc.city.trim(),
            district: newLoc.district.trim(),
            province: newLoc.province.trim(),
        };

        setLocations(prev => [...prev, newData]);
        setNewLoc({ name: "", type: "", city: "", district: "", province: "" });
        setSelectedLocation(newData.name);
    };

    const handleDeleteLocation = (id, e) => {
        e.stopPropagation(); // Prevent triggering selection
        if (window.confirm("Apakah anda yakin ingin menghapus lokasi ini?")) {
            setLocations(prev => prev.filter(loc => loc.id !== id));
            if (selectedLocation === locations.find(l => l.id === id)?.name) {
                setSelectedLocation(""); // Reset selection if deleted
            }
        }
    };

    const handleSave = async () => {
        if (cartItems.length === 0) {
            alert('Pilih minimal satu parameter pengujian');
            return;
        }

        // Save to localStorage for persistence
        localStorage.setItem('pengujianParameterProgress', JSON.stringify({
            quantities,
            selectedLocation,
            locations,
            selectedCategory,
            selectedJenis,
            selectedJenisId
        }));

        alert('Progres disimpan!');
    };

    const handleOrder = async () => {
        if (cartItems.length === 0) {
            alert('Pilih minimal satu parameter pengujian');
            return;
        }

        const firstJenisId = cartItems[0].jenisPengujianId;

        if (!firstJenisId) {
            alert('Jenis pengujian tidak valid. Silakan pilih ulang.');
            return;
        }

        try {
            setLoading(true);
            const companyData = JSON.parse(localStorage.getItem('companyData') || '{}');
            const selectedLocData = locations.find(l => l.name === selectedLocation);

            if (isRevision) {
                const payload = {
                    items: cartItems.map(item => ({
                        parameterId: item.parameterId,
                        quantity: item.quantity,
                        location: item.location,
                        price: item.price,
                        subtotal: item.subtotal
                    })),
                    totalAmount: cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0),
                    ...(companyData.namaPerusahaan && {
                        company: companyData.namaPerusahaan,
                        address: companyData.alamatPerusahaan,
                        contactPerson: companyData.namaPenanggungJawab,
                        phone: companyData.noHpPenanggungJawab,
                        companyLogo: companyData.logo
                    })
                };

                await api.put(`/orders/${orderId}`, payload);
                setIsRevisionMode(false); // Re-enable cart after revision
                alert('Revisi berhasil dikirim!');
                navigate('/status-pengujian', { state: { orderId } });
            } else {
                const pengujianData = {
                    jenisPengujianId: firstJenisId, // Fallback/Main ID
                    items: cartItems.map(item => ({
                        parameterId: item.parameterId,
                        quantity: item.quantity,
                        location: item.location,
                        jenisPengujianId: item.jenisPengujianId // Pass per-item ID
                    })),
                    lokasi: selectedLocation,
                    kota: selectedLocData?.city || '',
                    kecamatan: selectedLocData?.district || '',
                    provinsi: selectedLocData?.province || '',
                    company: companyData.namaPerusahaan,
                    address: companyData.alamatPerusahaan || '',
                    contactPerson: companyData.namaPenanggungJawab,
                    phone: companyData.noHpPenanggungJawab,
                    logo: companyData.logo
                };

                const response = await pengujianService.createPengujianWithCompany(pengujianData);
                alert('Pesanan berhasil dibuat!');
                localStorage.removeItem('companyData');
                localStorage.removeItem('pengujianParameterProgress'); // clear progres after order!
                setQuantities({}); // Clear cart state

                // Navigate to status page with the created order ID
                navigate('/status-pengujian', {
                    state: { orderId: response.order?.id }
                });
            }
        } catch (error) {
            console.error('Error processing order:', error);
            alert('Gagal memproses pesanan: ' + (error.response?.data?.error || error.message));
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
                {isRevision && revisionNote && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong className="font-medium">Catatan Revisi:</strong> {revisionNote}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
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
                                                    <button
                                                        onClick={(e) => handleDeleteLocation(location.id, e)}
                                                        className="p-1 hover:bg-red-100 rounded-full transition-colors group"
                                                        title="Hapus Lokasi"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                                    </button>
                                                </div>
                                                <h4 className="font-bold text-gray-800 mb-1">{location.name}</h4>
                                                <p className="text-xs text-gray-500">Kota/Kabupaten: <span className="font-medium">{location.city}</span></p>
                                                <p className="text-xs text-gray-500">Kecamatan: <span className="font-medium">{location.district}</span></p>
                                                <p className="text-xs text-gray-500">Provinsi: <span className="font-medium">{location.province}</span></p>
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
                                        <input
                                            type="text"
                                            value={newLoc.province}
                                            placeholder="Provinsi"
                                            onChange={(e) => setNewLoc({ ...newLoc, province: e.target.value })}
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
                                    <div className="flex items-center space-x-2">
                                        {/* Prev Button */}
                                        {clusterStartIndex > 0 && (
                                            <button
                                                onClick={handlePrevCluster}
                                                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                                            </button>
                                        )}

                                        <div className="flex justify-between flex-1 gap-2 overflow-hidden">
                                            {visibleCategories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => setSelectedCategory(category.id)}
                                                    className={`flex-1 p-1 rounded-xl transition-all border-2 min-w-[120px] ${selectedCategory === category.id
                                                        ? `bg-gradient-to-br ${category.color} text-white border-transparent shadow-lg`
                                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                                        }`}
                                                >
                                                    <div className="flex justify-center items-center w-full h-35 flex-col cursor-pointer">
                                                        <img className={`w-20`} src={category.select} alt="" />
                                                        <span className={`font-bold text-sm text-center mt-2 ${selectedCategory === category.id ? 'text-white' : 'text-gray-700'}`}>
                                                            {category.name}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Next Button */}
                                        {clusterStartIndex + CLUSTERS_PER_PAGE < categories.length && (
                                            <button
                                                onClick={handleNextCluster}
                                                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
                                            >
                                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Parameter Table Layout */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 bg-blue-50 border-b border-gray-200 text-sm font-bold text-gray-700">
                                    <div className="col-span-3 p-4 flex items-center justify-center border-r border-gray-200">
                                        Jenis Pengujian
                                    </div>
                                    <div className="col-span-9 grid grid-cols-9">
                                        <div className="col-span-3 p-4 border-r border-gray-200">Parameter</div>
                                        <div className="col-span-2 p-4 border-r border-gray-200 text-center">Acuan</div>
                                        <div className="col-span-2 p-4 border-r border-gray-200 text-center">Biaya</div>
                                        <div className="col-span-2 p-4 text-center">Jumlah</div>
                                    </div>
                                </div>

                                {/* Table Body */}
                                {(!selectedCategory) ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Silahkan pilih kategori (Cluster) terlebih dahulu
                                    </div>
                                ) : flatParameterList.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Tidak ada data pengujian untuk kategori ini
                                    </div>
                                ) : (
                                    paginatedFlatList.map((item, idx) => {
                                        const key = `${selectedLocation}|${selectedCategory}|${item.jenisName}|${item.name}`;
                                        const qty = quantities[key] || 0;

                                        // Check if we should show the Jenis Name
                                        // Show if it's the first item in the page OR if it's different from the previous item
                                        const showJenis = idx === 0 || item.jenisName !== paginatedFlatList[idx - 1].jenisName;
                                        const isNewGroup = showJenis && idx !== 0; // To add separator border

                                        return (
                                            <div key={`${item.jenisId}-${item.id}`} className={`grid grid-cols-12 border-b border-gray-200 last:border-b-0 ${isNewGroup ? 'border-t-2 border-t-gray-100' : ''}`}>
                                                {/* Jenis Column */}
                                                <div className={`col-span-3 p-4 flex items-center justify-center font-semibold text-gray-700 bg-gray-50/50 border-r border-gray-200`}>
                                                    {showJenis ? item.jenisName : ''}
                                                </div>

                                                {/* Parameters Column */}
                                                <div className="col-span-9 grid grid-cols-9 items-center hover:bg-blue-50/30 transition-colors">
                                                    <div className="col-span-3 p-3 text-sm text-gray-700 font-medium border-r border-gray-100">
                                                        {item.name}
                                                    </div>
                                                    <div className="col-span-2 p-3 text-xs text-gray-500 text-center border-r border-gray-100">
                                                        {item.date}
                                                    </div>
                                                    <div className="col-span-2 p-3 text-sm font-semibold text-gray-800 text-center border-r border-gray-100">
                                                        Rp {(item.price || 0).toLocaleString('id-ID')}
                                                    </div>
                                                    <div className="col-span-2 p-3 flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(selectedCategory, item.jenisName, item.name, -1)}
                                                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${qty === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                                            disabled={qty === 0}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-gray-700">{qty}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(selectedCategory, item.jenisName, item.name, 1)}
                                                            className="w-7 h-7 rounded-md bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-all"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Table Pagination Controls */}
                            {totalTablePages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg mt-2 shadow-sm">
                                    <button
                                        onClick={handlePrevTablePage}
                                        disabled={currentTablePage === 1}
                                        className={`p-1 rounded-md transition-colors ${currentTablePage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-600 font-medium">
                                        Halaman {currentTablePage} dari {totalTablePages}
                                    </span>
                                    <button
                                        onClick={handleNextTablePage}
                                        disabled={currentTablePage === totalTablePages}
                                        className={`p-1 rounded-md transition-colors ${currentTablePage === totalTablePages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
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
