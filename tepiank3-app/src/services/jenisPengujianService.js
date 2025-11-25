import api from './api';

export const jenisPengujianService = {
  // Get all jenis pengujian (optional: support query params like clusterId)
  async getAllJenisPengujian(params = {}) {
    try {
      const response = await api.get('/jenis-pengujian', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching jenis pengujian:', error);
      throw error;
    }
  },

  // Get jenis pengujian by ID
  async getJenisPengujianById(id) {
    try {
      const response = await api.get(`/jenis-pengujian/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jenis pengujian by id:', error);
      throw error;
    }
  },

  // Get jenis pengujian filtered by cluster (digunakan di ParameterForm)
  async getJenisPengujianByCluster(clusterId) {
    try {
      const response = await api.get('/jenis-pengujian', {
        params: { clusterId },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching jenis pengujian by cluster:', error);
      throw error;
    }
  },

  // Create jenis pengujian (Admin only)
  async createJenisPengujian(data) {
    try {
      const response = await api.post('/jenis-pengujian', data);
      return response.data;
    } catch (error) {
      console.error('Error creating jenis pengujian:', error);
      throw error;
    }
  },

  // Update jenis pengujian (Admin only)
  async updateJenisPengujian(id, data) {
    try {
      const response = await api.put(`/jenis-pengujian/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating jenis pengujian:', error);
      throw error;
    }
  },

  // Delete jenis pengujian (Admin only)
  async deleteJenisPengujian(id) {
    try {
      const response = await api.delete(`/jenis-pengujian/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting jenis pengujian:', error);
      throw error;
    }
  },
};
