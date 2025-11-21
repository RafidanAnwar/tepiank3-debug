import api from './api';

export const pengajuanService = {
  // Create pengajuan with company data
  async createPengajuan(pengajuanData) {
    const response = await api.post('/pengujian', pengajuanData);
    return response.data;
  },

  // Get all pengajuan for current user
  async getUserPengajuan() {
    const response = await api.get('/pengujian');
    return response.data;
  },

  // Get pengajuan by ID
  async getPengajuanById(id) {
    const response = await api.get(`/pengujian/${id}`);
    return response.data;
  },

  // Get all pengajuan (admin only)
  async getAllPengajuan() {
    const response = await api.get('/pengujian/admin/all-pengajuan');
    return response.data;
  },

  // Update pengajuan status
  async updateStatus(id, status) {
    const response = await api.patch(`/pengujian/${id}/status`, { status });
    return response.data;
  },

  // Delete pengajuan
  async deletePengajuan(id) {
    const response = await api.delete(`/pengujian/${id}`);
    return response.data;
  }
};
