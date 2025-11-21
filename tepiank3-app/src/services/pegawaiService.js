import api from './api';

export const pegawaiService = {
  // Get all pegawai
  async getAllPegawai(params = {}) {
    const response = await api.get('/pegawai', { params });
    return response.data.data || response.data;
  },

  // Get single pegawai
  async getPegawaiById(id) {
    const response = await api.get(`/pegawai/${id}`);
    return response.data.data || response.data;
  },

  // Create pegawai
  async createPegawai(data) {
    const response = await api.post('/pegawai', data);
    return response.data.data || response.data;
  },

  // Update pegawai
  async updatePegawai(id, data) {
    const response = await api.put(`/pegawai/${id}`, data);
    return response.data.data || response.data;
  },

  // Delete pegawai
  async deletePegawai(id) {
    const response = await api.delete(`/pegawai/${id}`);
    return response.data;
  }
};
