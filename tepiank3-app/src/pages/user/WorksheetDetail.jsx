import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import Navbar from '../../components/layout/NavBar';
import { pengujianService } from '../../services/pengujianService';

const WorksheetDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pengujian, setPengujian] = useState(location.state?.pengujian || null);
  const [loading, setLoading] = useState(!pengujian);

  useEffect(() => {
    if (!pengujian) {
      loadPengujian();
    }
  }, [id, pengujian]);

  const loadPengujian = async () => {
    try {
      setLoading(true);
      const data = await pengujianService.getPengujianById(id);
      setPengujian(data);
    } catch (error) {
      console.error('Error loading pengujian:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('Fitur export PDF akan segera tersedia');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pengujian) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Data tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/worksheet')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
          {/* Header */}
          <div className="text-center mb-8 pb-8 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WORKSHEET PENGUJIAN</h1>
            <p className="text-gray-600">Nomor: {pengujian.nomorPengujian}</p>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pengujian</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Jenis Pengujian</p>
                  <p className="font-medium text-gray-900">{pengujian.jenisPengujian?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cluster</p>
                  <p className="font-medium text-gray-900">{pengujian.jenisPengujian?.cluster?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lokasi Pengujian</p>
                  <p className="font-medium text-gray-900">{pengujian.lokasi || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Pengujian</p>
                  <p className="font-medium text-gray-900">
                    {pengujian.tanggalPengujian
                      ? new Date(pengujian.tanggalPengujian).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status & Tanggal</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${pengujian.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        pengujian.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          pengujian.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                            pengujian.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                      }`}>
                      {pengujian.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Dibuat</p>
                  <p className="font-medium text-gray-900">
                    {new Date(pengujian.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terakhir Diupdate</p>
                  <p className="font-medium text-gray-900">
                    {new Date(pengujian.updatedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Parameter Pengujian</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Parameter</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Satuan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acuan</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-800">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800">Harga</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pengujian.pengujianItems?.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.parameter?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.parameter?.satuan || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.parameter?.acuan || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        Rp {item.price?.toLocaleString('id-ID') || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        Rp {item.subtotal?.toLocaleString('id-ID') || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rp {pengujian.totalAmount?.toLocaleString('id-ID') || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {pengujian.catatan && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Catatan</h4>
              <p className="text-gray-700">{pengujian.catatan}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-300 text-center text-sm text-gray-600">
            <p>Dokumen ini dicetak dari sistem Tepian K3</p>
            <p>{new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:shadow-none {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default WorksheetDetail;