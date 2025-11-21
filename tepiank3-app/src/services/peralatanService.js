import api from './api';

export const peralatanService = {
  // Get all peralatan
  async getAllPeralatan() {
    try {
      const response = await api.get('/peralatan');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching peralatan:', error);
      throw error;
    }
  },

  // Get peralatan by ID
  async getPeralatanById(id) {
    try {
      const response = await api.get(`/peralatan/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching peralatan by id:', error);
      throw error;
    }
  },

  // Create new peralatan
  async createPeralatan(peralatanData) {
    try {
      const response = await api.post('/peralatan', peralatanData);
      return response.data;
    } catch (error) {
      console.error('Error creating peralatan:', error);
      throw error;
    }
  },

  // Update peralatan (supports partial update)
  async updatePeralatan(id, peralatanData) {
    try {
      const response = await api.put(`/peralatan/${id}`, peralatanData);
      return response.data;
    } catch (error) {
      console.error('Error updating peralatan:', error);
      throw error;
    }
  },

  // Delete peralatan
  async deletePeralatan(id) {
    try {
      const response = await api.delete(`/peralatan/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting peralatan:', error);
      throw error;
    }
  }
};