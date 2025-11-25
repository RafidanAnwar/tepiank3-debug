import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, UserCircle, LogOut, Check, Circle, Lock, CircleDot, Save, FileText, CreditCard } from 'lucide-react';
import { NavBar } from '../../components/layout/NavBar';
import { safeLocalStorage } from '../../utils/errorHandler';
import api from '../../services/api';

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
      return <Check key={status} className={`${baseStyle} ${completedStyle}`} />;
    case 'current':
      return <Circle key={status} className={`${baseStyle} ${currentStyle}`} />;
    case 'active':
    case 'in-progress': // Untuk langkah-langkah di antaranya, kita gunakan lingkaran solid kecil
      return <div key={status} className={activeStyle}></div>;
    case 'pending':
      return <div key={status} className={pendingStyle}></div>;
    case 'locked':
      return <Lock key={status} className={`${baseStyle} ${lockedStyle}`} />;
    default:
      return <div key={status} className={activeStyle}></div>;
  }
};

export default function PengujianStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // Default step 1
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const profileMenuRef = useRef(null);
  const userName = localStorage.getItem('userName') || 'Musfiq';

  useEffect(() => {
    fetchOrders();

    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      if (response.data && response.data.length > 0) {
        setOrders(response.data);

        // Check if there's an orderId passed in state
        const stateOrderId = location.state?.orderId;
        if (stateOrderId) {
          const preSelected = response.data.find(o => o.id === stateOrderId);
          if (preSelected) {
            setSelectedOrder(preSelected);
          } else {
            setSelectedOrder(response.data[0]);
          }
        } else {
          setSelectedOrder(response.data[0]); // Select the latest one by default
        }
      } else {
        setActiveStep(1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      updateProgress(selectedOrder);
    }
  }, [selectedOrder]);

  const updateProgress = (order) => {
    if (!order) return;

    let step = 1;
    const status = order.status;

    // Base status mapping
    switch (status) {
      case 'PENDING':
        step = 3; // Menunggu Persetujuan
        break;
      case 'CONFIRMED':
        step = 4; // Disetujui
        break;
      case 'IN_PROGRESS':
        step = 5; // Penawaran Dibuat

        // Progressive step advancement based on documents
        if (order.penawaranFile) {
          step = 6; // Unduh Penawaran available

          // Check if user has downloaded (we'll track this in localStorage)
          const downloadedPenawaran = localStorage.getItem(`downloaded_penawaran_${order.id}`);
          if (downloadedPenawaran) {
            step = 7; // Move to Unggah Persetujuan
          }

          // If user uploaded persetujuan
          if (order.suratPersetujuanFile) {
            // Check approval status
            if (order.persetujuanStatus === 'APPROVED') {
              step = 7; // Approved, stay at step 7 waiting for invoice
            } else if (order.persetujuanStatus === 'REJECTED') {
              step = 7; // Rejected, stay at upload step
            } else {
              step = 7; // Pending review, stay at upload step
            }
          }
        }
        break;
      case 'COMPLETED':
        // Only show invoice step if persetujuan is approved
        if (order.persetujuanStatus === 'APPROVED') {
          // Check if invoice file exists - if yes, go directly to download step
          if (order.invoiceFile) {
            step = 8; // Unduh Invoice available
          } else {
            step = 7; // Stay at persetujuan step (waiting for invoice)
          }
        } else {
          step = 7; // Stay at persetujuan step until approved
        }
        break;
      case 'PAID':
        step = 8; // Still show invoice step, but maybe with completed status?
        break;
      case 'CANCELLED':
        step = 1;
        break;
      default:
        step = 1;
    }

    setActiveStep(step);
  };

  const handleOrderChange = (e) => {
    const orderId = parseInt(e.target.value);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleLogout = () => {
    try {
      safeLocalStorage.removeItem('isAuthenticated');
      safeLocalStorage.removeItem('userName');
      safeLocalStorage.removeItem('loggedUser');
      safeLocalStorage.removeItem('userRole');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const handleUnduhPenawaran = () => {
    try {
      if (selectedOrder?.penawaranFile) {
        const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${selectedOrder.penawaranFile}`;
        window.open(url, '_blank');

        // Mark as downloaded and advance to next step
        localStorage.setItem(`downloaded_penawaran_${selectedOrder.id}`, 'true');
        updateProgress(selectedOrder);
      } else {
        alert("Penawaran belum tersedia");
      }
    } catch (error) {
      console.error('Error downloading penawaran:', error);
      alert('Gagal mengunduh penawaran. Silakan coba lagi.');
    }
  };

  const handleUnggahPersetujuan = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
          alert('Hanya file PDF yang diperbolehkan');
          return;
        }

        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64 = reader.result;
              await api.post(`/orders/${selectedOrder.id}/upload-persetujuan`, { file: base64 });
              alert('Surat persetujuan berhasil diupload');
              fetchOrders(); // Refresh data
            } catch (err) {
              console.error('Error uploading persetujuan:', err);
              alert('Gagal mengupload surat persetujuan');
            }
          };
          reader.readAsDataURL(file);
        } catch (err) {
          console.error('Error reading file:', err);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error uploading persetujuan:', error);
      alert('Gagal mengunggah persetujuan. Silakan coba lagi.');
    }
  };

  const handleUnduhInvoice = () => {
    try {
      if (selectedOrder?.invoiceFile) {
        const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${selectedOrder.invoiceFile}`;
        window.open(url, '_blank');

        // Mark as downloaded and advance to next step
        localStorage.setItem(`downloaded_invoice_${selectedOrder.id}`, 'true');
        updateProgress(selectedOrder);
      } else {
        alert("Invoice belum tersedia");
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Gagal mengunduh invoice. Silakan coba lagi.');
    }
  };

  const steps = [
    { number: 1, title: 'Data Perusahaan/Instansi', subtitle: 'Isi dan lampirkan persyaratan Instansi' },
    { number: 2, title: 'Parameter Pengujian', subtitle: 'Masukkan Lokasi & Parameter Pengujian' },
    { number: 3, title: 'Status Pengajuan', subtitle: 'Pantau Perkembangan Pengajuan' },
    { number: 4, title: 'Informasi Pembayaran', subtitle: 'Ringkasan Pengujian Layanan & Pembayaran' }
  ];

  // Calculate progres based on activeStep
  const progres = useMemo(() => {
    const baseProgres = [
      { id: 1, label: 'Order Terkirim' },
      { id: 2, label: 'Sedang Diproses' },
      { id: 3, label: 'Menunggu Persetujuan' },
      { id: 4, label: 'Disetujui' },
      { id: 5, label: 'Penawaran Dibuat' },
      { id: 6, label: 'Unduh Penawaran' },
      { id: 7, label: 'Unggah Persetujuan' },
      { id: 8, label: 'Unduh Invoice' },
      // Removed 'Informasi Pembayaran' from here
    ];

    return baseProgres.map(step => {
      let status = 'pending';
      if (step.id < activeStep) {
        status = 'completed';
      } else if (step.id === activeStep) {
        status = 'active'; // Or 'current'
      } else {
        status = 'pending'; // Or 'locked'
      }

      // Special handling for specific steps if needed
      if (step.id > activeStep + 2) status = 'locked';

      return { ...step, status };
    });
  }, [activeStep]);

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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${3 === step.number
                    ? 'bg-linear-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                    : 3 > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}>
                    {3 > step.number ? '✓' : step.number}
                  </div>
                  <div className={`mt-2 text-center max-w-xs ${3 === step.number ? 'block' : 'hidden md:block'}`}>
                    <p className={`text-sm font-semibold ${3 === step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 ${3 > step.number ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Selection */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-md">
            <label htmlFor="order-select" className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Pilih Nomor Order
            </label>
            <div className="relative">
              <select
                id="order-select"
                value={selectedOrder?.id || ''}
                onChange={handleOrderChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                disabled={loading || orders.length === 0}
              >
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {new Date(order.createdAt).toLocaleDateString('id-ID')} ({order.status})
                  </option>
                ))}
                {orders.length === 0 && <option>Tidak ada order</option>}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
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
                {loading ? (
                  <div className="text-center py-10">Loading status...</div>
                ) : (
                  progres.map((step, index) => {
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
                        <div className="flex-col items-center w-full max-w-md">
                          <span
                            className={`${labelStyle} text-base leading-tight ${isLocked ? 'text-gray-500' : ''} block mb-2`}
                          >
                            {step.label}
                          </span>

                          {step.label === "Unduh Penawaran" && (
                            <button
                              onClick={step.status === "pending" || step.status === "locked" ? undefined : handleUnduhPenawaran}
                              className={`w-full text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-md ${step.status === "pending" || step.status === "locked" ? "bg-gray-300" : "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg cursor-pointer"}`}
                            >
                              <Save className="w-4 h-4" />
                              <span>Unduh</span>
                            </button>
                          )}
                          {step.label === "Unggah Persetujuan" && (
                            <button
                              onClick={step.status === "pending" || step.status === "locked" ? undefined : handleUnggahPersetujuan}
                              className={`w-full text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-md ${step.status === "pending" || step.status === "locked" ? "bg-gray-300" : "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg cursor-pointer"}`}
                            >
                              <Save className="w-4 h-4" />
                              <span>Unggah</span>
                            </button>
                          )}
                          {step.label === "Unduh Invoice" && (
                            <div className="w-full">
                              <button
                                onClick={step.status === "pending" || step.status === "locked" ? undefined : handleUnduhInvoice}
                                className={`w-full text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-md ${step.status === "pending" || step.status === "locked" ? "bg-gray-300" : "bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg cursor-pointer"}`}
                              >
                                <Save className="w-4 h-4" />
                                <span>Invoice</span>
                              </button>

                              {/* Show Payment Button if Invoice is available/downloaded */}
                              {selectedOrder?.invoiceFile && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <p className="text-sm text-gray-600 mb-2 text-center">Langkah selanjutnya:</p>
                                  <button
                                    onClick={() => navigate('/pembayaran-pengujian', { state: { orderId: selectedOrder.id } })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    Lanjut ke Pembayaran
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
