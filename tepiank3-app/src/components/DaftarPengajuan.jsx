import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { NavBar } from './NavBar';
import { ContextApi } from '../Context/ContextApi';
import { pengajuanService } from '../services/pengajuanService';

export default function DaftarPengajuan() {
  const navigate = useNavigate();
  const { user } = useContext(ContextApi);
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPengajuan();
  }, [user, navigate]);

  const loadPengajuan = async () => {
    try {
      setLoading(true);
      setError('');
      const data = isAdmin 
        ? await pengajuanService.getAllPengajuan()
        : await pengajuanService.getUserPengajuan();
      setPengajuan(data);
    } catch (err) {
      console.error('Error loading pengajuan:', err);
      setError('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
      return;
    }

    try {
      await pengajuanService.deletePengajuan(id);
      setPengajuan(pengajuan.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting pengajuan:', err);
      alert('Gagal menghapus pengajuan');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Clock },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompanyName = (item) => {
    return item.orders?.[0]?.company 
      || item.namaPerusahaan 
      || item.user?.company 
      || 'Tidak diketahui';
  };

  const companySummary = useMemo(() => {
    const map = new Map();
    pengajuan.forEach(item => {
      const name = getCompanyName(item);
      if (!name || name === '-') return;

      const existing = map.get(name) || {
        name,
        totalPengajuan: 0,
        lastSubmitted: null,
        latestStatus: item.status,
        contactPerson: item.orders?.[0]?.contactPerson || item.namaPenanggungJawab || '-',
        phone: item.orders?.[0]?.phone || item.noHpPenanggungJawab || '-',
        email: item.orders?.[0]?.email || item.user?.email || '-'
      };

      existing.totalPengajuan += 1;
      if (!existing.lastSubmitted || new Date(item.createdAt) > new Date(existing.lastSubmitted)) {
        existing.lastSubmitted = item.createdAt;
        existing.latestStatus = item.status;
        existing.contactPerson = item.orders?.[0]?.contactPerson || item.namaPenanggungJawab || existing.contactPerson;
        existing.phone = item.orders?.[0]?.phone || item.noHpPenanggungJawab || existing.phone;
        existing.email = item.orders?.[0]?.email || item.user?.email || existing.email;
      }

      map.set(name, existing);
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.lastSubmitted) - new Date(a.lastSubmitted || 0));
  }, [pengajuan]);

  const filteredPengajuan = useMemo(() => {
    if (!companyFilter) return pengajuan;
    return pengajuan.filter(item => getCompanyName(item) === companyFilter);
  }, [pengajuan, companyFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pengajuan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daftar Pengajuan Layanan Pengujian</h1>
          <p className="text-gray-600 mt-2">Kelola semua pengajuan layanan pengujian Anda</p>
        </div>

      {companySummary.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Perusahaan yang Mengajukan</h2>
              <p className="text-sm text-gray-600">Total {companySummary.length} perusahaan telah mengajukan pengujian</p>
            </div>
            {companyFilter && (
              <button
                onClick={() => setCompanyFilter('')}
                className="self-start md:self-auto px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Reset filter perusahaan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companySummary.map((company) => (
              <button
                key={company.name}
                onClick={() => setCompanyFilter(company.name === companyFilter ? '' : company.name)}
                className={`text-left border rounded-xl p-4 transition hover:shadow-md ${
                  companyFilter === company.name ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    {company.totalPengajuan} pengajuan
                  </span>
                </div>
                <p className="text-sm text-gray-600">PIC: {company.contactPerson || '-'}</p>
                <p className="text-sm text-gray-600">Kontak: {company.phone || '-'}</p>
                {company.lastSubmitted && (
                  <p className="text-xs text-gray-500 mt-2">
                    Pengajuan terakhir {formatDate(company.lastSubmitted)}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {pengajuan.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Belum ada pengajuan</p>
            <button
              onClick={() => navigate('/pengujian')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Buat Pengajuan Baru
            </button>
          </div>
        ) : filteredPengajuan.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Tidak ada pengajuan untuk perusahaan yang dipilih</p>
            <button
              onClick={() => setCompanyFilter('')}
              className="mt-4 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Tampilkan semua pengajuan
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">No. Pengajuan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Perusahaan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kontak</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPengajuan.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.nomorPengujian}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getCompanyName(item)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.orders?.[0]?.contactPerson || '-'}</td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => {
                            setSelectedPengajuan(item);
                            setShowDetail(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition flex items-center gap-1"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 transition flex items-center gap-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPengajuan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Detail Pengajuan</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">No. Pengajuan</p>
                  <p className="font-semibold text-gray-900">{selectedPengajuan.nomorPengujian}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p>{getStatusBadge(selectedPengajuan.status)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Data Perusahaan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-gray-600">Perusahaan</p>
                    <p className="font-medium">{selectedPengajuan.orders?.[0]?.company || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Alamat</p>
                    <p className="font-medium">{selectedPengajuan.orders?.[0]?.address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Penanggung Jawab</p>
                    <p className="font-medium">{selectedPengajuan.orders?.[0]?.contactPerson || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">No. HP</p>
                    <p className="font-medium">{selectedPengajuan.orders?.[0]?.phone || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Detail Pengujian</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Jenis Pengujian</p>
                    <p className="font-medium">{selectedPengajuan.jenisPengujian?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Biaya</p>
                    <p className="font-medium">Rp {selectedPengajuan.totalAmount?.toLocaleString('id-ID') || '0'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Lokasi</p>
                    <p className="font-medium">{selectedPengajuan.lokasi || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Catatan</p>
                    <p className="font-medium">{selectedPengajuan.catatan || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedPengajuan.pengujianItems && selectedPengajuan.pengujianItems.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Parameter Pengujian</h3>
                  <div className="space-y-2 text-sm">
                    {selectedPengajuan.pengujianItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                        <span>{item.parameter?.name}</span>
                        <span className="font-medium">Rp {item.subtotal?.toLocaleString('id-ID') || '0'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
