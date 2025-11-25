import React, { useState, useEffect, useContext } from 'react';
import { FileText, ChevronDown, ChevronUp, Edit2, Save, X, MessageSquare } from 'lucide-react';
import Navbar from '../../components/layout/NavBar';
import Sidebar from '../../components/layout/SideBar';
import { worksheetService } from '../../services/worksheetService';
import { ContextApi } from '../../context/ContextApi';

const WorksheetPage = () => {
  const { user } = useContext(ContextApi);

  const [worksheets, setWorksheets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const perPage = 5;

  useEffect(() => {
    loadWorksheets();
  }, [page, statusFilter]);

  const loadWorksheets = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = statusFilter ? { status: statusFilter } : {};
      const result = await worksheetService.getAllWorksheets(page, perPage, filters);
      console.log('Loaded worksheets:', result.data); // Debugging
      setWorksheets(result.data || []);
      setPagination(result.pagination || null);
    } catch (err) {
      console.error('Error loading worksheets:', err);
      setError('Gagal memuat worksheet');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemId, nilai, satuan, keterangan) => {
    try {
      await worksheetService.updateWorksheetItem(itemId, nilai, satuan, keterangan);
      await loadWorksheets();
      setEditingItemId(null);
      setEditValues({});
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Gagal mengupdate item');
    }
  };

  const handleStatusChange = async (worksheetId, newStatus) => {
    try {
      await worksheetService.updateWorksheet(worksheetId, { status: newStatus });
      await loadWorksheets();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal mengupdate status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'APPROVED': 'bg-emerald-100 text-emerald-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'DRAFT': 'Draft',
      'IN_PROGRESS': 'Sedang Dikerjakan',
      'COMPLETED': 'Selesai',
      'APPROVED': 'Disetujui',
      'REJECTED': 'Ditolak'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <Navbar />
      </header>

      <div className="flex">
        <aside className="bg-linear-to-tr from-blue-200 to-blue-600 w-25 shadow-lg p-2 min-h-screen flex flex-col justify-between">
          <Sidebar />
        </aside>

        <main className="max-w-7xl mx-auto flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
              <FileText className="w-8 h-8" />
              <span>Daftar Worksheet</span>
            </h2>
          </div>

          {/* Filter Status */}
          <div className="mb-4 flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="COMPLETED">Selesai</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && worksheets.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Worksheet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Pengujian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {worksheets.map((worksheet) => (
                    <React.Fragment key={worksheet.id}>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === worksheet.id ? null : worksheet.id)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {worksheet.nomorWorksheet}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {worksheet.pengujian?.orders?.map(o => o.orderNumber).join(', ') || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {worksheet.user?.fullname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {worksheet.pengujian?.jenisPengujian?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(worksheet.status)}`}>
                            {getStatusLabel(worksheet.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {expandedId === worksheet.id ? <ChevronUp className="ml-auto h-5 w-5 text-gray-400" /> : <ChevronDown className="ml-auto h-5 w-5 text-gray-400" />}
                        </td>
                      </tr>
                      {expandedId === worksheet.id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Order Info */}
                              {worksheet.pengujian?.orders?.length > 0 && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">Informasi Order</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {worksheet.pengujian.orders.map(order => (
                                      <div key={order.id} className="flex gap-8">
                                        <div>
                                          <p className="text-gray-500">No. Order</p>
                                          <p className="font-medium text-gray-800">{order.orderNumber}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500">Perusahaan</p>
                                          <p className="font-medium text-gray-800">{order.company || '-'}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Info Row */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Tanggal Mulai</p>
                                  <p className="font-medium">
                                    {worksheet.tanggalMulai ? new Date(worksheet.tanggalMulai).toLocaleDateString('id-ID') : '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Tanggal Selesai</p>
                                  <p className="font-medium">
                                    {worksheet.tanggalSelesai ? new Date(worksheet.tanggalSelesai).toLocaleDateString('id-ID') : '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Pegawai Utama</p>
                                  <p className="font-medium">{worksheet.pegawaiUtama ? `ID: ${worksheet.pegawaiUtama}` : '-'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Pegawai Pendamping</p>
                                  <p className="font-medium">{worksheet.pegawaiPendamping ? `ID: ${worksheet.pegawaiPendamping}` : '-'}</p>
                                </div>
                              </div>

                              {/* Items Table */}
                              <div className="mt-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Item Pengujian</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm bg-white rounded-lg border">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left">Parameter</th>
                                        <th className="px-3 py-2 text-left">Nilai</th>
                                        <th className="px-3 py-2 text-left">Satuan</th>
                                        <th className="px-3 py-2 text-left">Keterangan</th>
                                        <th className="px-3 py-2 text-center">Aksi</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {worksheet.worksheetItems?.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                          <td className="px-3 py-2 font-medium">{item.parameter?.name}</td>
                                          <td className="px-3 py-2">
                                            {editingItemId === item.id ? (
                                              <input
                                                type="number"
                                                step="0.001"
                                                value={editValues.nilai || item.nilai || ''}
                                                onChange={(e) => setEditValues(prev => ({ ...prev, nilai: e.target.value }))}
                                                className="w-24 px-2 py-1 border rounded"
                                              />
                                            ) : (
                                              <span>{item.nilai || '-'}</span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            {editingItemId === item.id ? (
                                              <input
                                                type="text"
                                                value={editValues.satuan || item.satuan || ''}
                                                onChange={(e) => setEditValues(prev => ({ ...prev, satuan: e.target.value }))}
                                                className="w-20 px-2 py-1 border rounded"
                                              />
                                            ) : (
                                              <span>{item.satuan || item.parameter?.satuan || '-'}</span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2">
                                            {editingItemId === item.id ? (
                                              <input
                                                type="text"
                                                value={editValues.keterangan || item.keterangan || ''}
                                                onChange={(e) => setEditValues(prev => ({ ...prev, keterangan: e.target.value }))}
                                                className="w-32 px-2 py-1 border rounded"
                                              />
                                            ) : (
                                              <span className="text-gray-600">{item.keterangan || '-'}</span>
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-center flex gap-2 justify-center">
                                            {editingItemId === item.id ? (
                                              <>
                                                <button
                                                  onClick={() => handleUpdateItem(item.id, editValues.nilai, editValues.satuan, editValues.keterangan)}
                                                  className="text-green-600 hover:text-green-800"
                                                >
                                                  <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => setEditingItemId(null)}
                                                  className="text-red-600 hover:text-red-800"
                                                >
                                                  <X className="w-4 h-4" />
                                                </button>
                                              </>
                                            ) : (
                                              <button
                                                onClick={() => {
                                                  setEditingItemId(item.id);
                                                  setEditValues({ nilai: item.nilai, satuan: item.satuan, keterangan: item.keterangan });
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                              >
                                                <Edit2 className="w-4 h-4" />
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Status Change */}
                              <div className="mt-4 flex gap-2">
                                <select
                                  value={worksheet.status}
                                  onChange={(e) => handleStatusChange(worksheet.id, e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="DRAFT">Draft</option>
                                  <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                                  <option value="COMPLETED">Selesai</option>
                                  <option value="APPROVED">Disetujui</option>
                                  <option value="REJECTED">Ditolak</option>
                                </select>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && worksheets.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada worksheet</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-gray-700">
                Halaman {pagination.page} dari {pagination.pages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Chat Button */}
      <button className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};

export default WorksheetPage;
