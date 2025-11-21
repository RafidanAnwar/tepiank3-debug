import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Trash2, Plus, Filter, Search } from 'lucide-react';
import { NavBar } from './NavBar';
import { ContextApi } from '../Context/ContextApi';
import { pengujianService } from '../services/pengujianService';

const Worksheet = () => {
  const navigate = useNavigate();
  const { user } = useContext(ContextApi);
  const [pengujianList, setPengujianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPengujian();
  }, [user, navigate]);

  const loadPengujian = async () => {
    try {
      setLoading(true);
      const data = await pengujianService.getAllPengujian();
      setPengujianList(data);
    } catch (error) {
      console.error('Error loading pengujian:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPengujian = pengujianList.filter(item => {
    const matchesSearch = 
      item.nomorPengujian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenisPengujian?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (pengujian) => {
    navigate(`/worksheet/${pengujian.id}`, { state: { pengujian } });
  };

  const handleExportPDF = (pengujian) => {
    console.log('Export PDF:', pengujian);
    alert('Fitur export PDF akan segera tersedia');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Menunggu',
      'CONFIRMED': 'Dikonfirmasi',
      'IN_PROGRESS': 'Sedang Berjalan',
      'COMPLETED': 'Selesai',
      'CANCELLED': 'Dibatalkan'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Worksheet Pengujian</h1>
          </div>
          <button
            onClick={() => navigate('/pengujian')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Pengujian Baru
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nomor atau jenis pengujian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="PENDING">Menunggu</option>
                <option value="CONFIRMED">Dikonfirmasi</option>
                <option value="IN_PROGRESS">Sedang Berjalan</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : filteredPengujian.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada data pengujian</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nomor Pengujian</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Jenis Pengujian</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Lokasi</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total Item</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total Harga</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tanggal</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPengujian.map((pengujian) => (
                    <tr key={pengujian.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {pengujian.nomorPengujian}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pengujian.jenisPengujian?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pengujian.lokasi || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pengujian.pengujianItems?.length || 0} item
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rp {pengujian.totalAmount?.toLocaleString('id-ID') || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pengujian.status)}`}>
                          {getStatusLabel(pengujian.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(pengujian.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(pengujian)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportPDF(pengujian)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Export PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {filteredPengujian.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Pengujian</p>
              <p className="text-2xl font-bold text-blue-600">{filteredPengujian.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Harga</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {filteredPengujian.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Item</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredPengujian.reduce((sum, p) => sum + (p.pengujianItems?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredPengujian.filter(p => p.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Worksheet;