import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Building2, FileText, CreditCard, Check, Circle, Lock } from 'lucide-react';
import { NavBar } from '../../components/layout/NavBar';
import api from '../../services/api';

export default function PengujianPembayaran() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get orderId from navigation state
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      // If no orderId, redirect back to status
      navigate('/status-pengujian');
      return;
    }

    fetchOrderDetails();
  }, [orderId, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);

      if (response.data) {
        setOrder(response.data);
      } else {
        alert('Order tidak ditemukan');
        navigate('/status-pengujian');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Gagal memuat data order');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBuktiBayar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result;
          await api.post(`/orders/${order.id}/upload-bukti-bayar`, { file: base64 });
          alert('Bukti bayar berhasil diupload');
          fetchOrderDetails(); // Refresh data
        } catch (err) {
          console.error('Error uploading bukti bayar:', err);
          alert('Gagal mengupload bukti bayar');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };

  const steps = [
    { number: 1, title: 'Data Perusahaan/Instansi', subtitle: 'Isi dan lampirkan persyaratan Instansi' },
    { number: 2, title: 'Parameter Pengujian', subtitle: 'Masukkan Lokasi & Parameter Pengujian' },
    { number: 3, title: 'Status Pengajuan', subtitle: 'Pantau Perkembangan Pengajuan' },
    { number: 4, title: 'Informasi Pembayaran', subtitle: 'Ringkasan Pengujian Layanan & Pembayaran' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pengajuan Layanan Pengujian</h1>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${4 === step.number
                    ? 'bg-linear-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                    : 4 > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}>
                    {4 > step.number ? '✓' : step.number}
                  </div>
                  <div className={`mt-2 text-center max-w-xs ${4 === step.number ? 'block' : 'hidden md:block'}`}>
                    <p className={`text-sm font-semibold ${4 === step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 ${4 > step.number ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/status-pengujian')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Status
        </button>

        <div id="printable-card" className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Status */}
          <div className={`px-8 py-6 text-white flex justify-between items-center ${order.paymentStatus === 'PAID' ? 'bg-green-600' : 'bg-blue-600'}`}>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {order.paymentStatus === 'PAID' ? (
                  <>
                    <CheckCircle className="w-8 h-8" />
                    Pembayaran Berhasil
                  </>
                ) : (
                  <>
                    <CreditCard className="w-8 h-8" />
                    Informasi Pembayaran
                  </>
                )}
              </h1>
              <p className="mt-1 text-white opacity-90">
                {order.paymentStatus === 'PAID'
                  ? 'Terima kasih, pembayaran Anda telah diverifikasi.'
                  : 'Silakan lakukan pembayaran dan upload bukti bayar.'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">No. Order</p>
              <p className="text-xl font-mono font-bold">{order.orderNumber}</p>
            </div>
          </div>

          <div className="p-8">
            {/* Payment Content */}
            {order.paymentStatus !== 'PAID' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                {/* Upload Form */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Upload Bukti Pembayaran</h3>

                  {order.paymentStatus === 'PENDING_VERIFICATION' ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h4 className="font-bold text-yellow-800 mb-2">Menunggu Verifikasi</h4>
                      <p className="text-yellow-700 text-sm">
                        Bukti pembayaran Anda sedang diperiksa oleh admin. Mohon tunggu konfirmasi selanjutnya.
                      </p>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="bukti-bayar"
                        accept="image/*,application/pdf"
                        onChange={handleUploadBuktiBayar}
                        className="hidden"
                      />
                      <label
                        htmlFor="bukti-bayar"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-gray-700 mb-1">Klik untuk upload bukti bayar</span>
                        <span className="text-sm text-gray-500">Format: JPG, PNG, PDF</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary (Always visible or only when paid? User asked for summary access AFTER payment verification. 
                But usually summary is good to see always. Let's keep it visible but maybe below payment form if not paid.) 
            */}

        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Rincian Order
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Informasi Pemohon</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Perusahaan</span>
                  <span className="font-medium">{order.company || order.pengujian?.namaPerusahaan || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PIC</span>
                  <span className="font-medium">{order.contactPerson || order.pengujian?.namaPenanggungJawab || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kontak</span>
                  <span className="font-medium">{order.phone || order.pengujian?.noHpPenanggungJawab || '-'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Status</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status Order</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status Pembayaran</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-800' :
                      order.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {order.paymentStatus || 'UNPAID'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.paymentStatus === 'PAID' && (
          <div className="flex justify-end gap-4 mt-8 no-print">
            {order.suratTugasFile && (
              <a
                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${order.suratTugasFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
              >
                <FileText className="w-4 h-4" />
                Download Surat Tugas
              </a>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Ringkasan
            </button>
          </div>
        )}
      </div>


      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-card, #printable-card * {
            visibility: visible;
          }
          #printable-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          /* Ensure background colors are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
