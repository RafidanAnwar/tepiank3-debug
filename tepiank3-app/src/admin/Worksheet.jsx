import React, { useState, useEffect, useContext } from "react";
import {
  Edit2,
  Save,
  X,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ContextApi } from '../Context/ContextApi';
import Sidebar from "../pages/SideBar.jsx";
import Navbar from "../pages/NavBar.jsx";
import { worksheetService } from '../services/worksheetService';

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
        <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto bg-gradient-to-tr from-blue-200 to-blue-600 shadow-lg p-2 flex flex-col justify-between">
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
            <div className="space-y-4">
              {worksheets.map((worksheet) => (
                <div key={worksheet.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === worksheet.id ? null : worksheet.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">{worksheet.nomorWorksheet}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(worksheet.status)}`}>
                          {getStatusLabel(worksheet.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {worksheet.pengujian?.jenisPengujian?.name}
                      </p>
                    </div>
                    {expandedId === worksheet.id ? <ChevronUp /> : <ChevronDown />}
                  </div>

                  {/* Expanded Content */}
                  {expandedId === worksheet.id && (
                    <div className="border-t px-4 py-4 space-y-4">
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
                          <table className="w-full text-sm">
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
                  )}
                </div>
              ))}
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

    </div>
  );
};

export default WorksheetPage;
