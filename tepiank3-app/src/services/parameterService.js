import api from './api';

export const parameterService = {
  // Get all parameters (optional: support query params)
  async getAllParameters(params = {}) {
    try {
      const response = await api.get('/parameters', { params });
      // Backend returns { data: [...], pagination: {...} } or just array
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching parameters:', error);
      throw error;
    }
  },

  // Get parameter by ID
  async getParameterById(id) {
    try {
      const response = await api.get(`/parameters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching parameter by id:', error);
      throw error;
    }
  },

  // Get parameters by jenis pengujian
  async getParametersByJenisPengujian(jenisPengujianId) {
    try {
      const response = await api.get(`/parameters/by-jenis/${jenisPengujianId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching parameters by jenis pengujian:', error);
      throw error;
    }
  },

  // Create parameter (Admin only)
  async createParameter(data) {
    try {
      const response = await api.post('/parameters', data);
      return response.data;
    } catch (error) {
      console.error('Error creating parameter:', error);
      throw error;
    }
  },

  // Update parameter (Admin only)
  async updateParameter(id, data) {
    try {
      const response = await api.put(`/parameters/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating parameter:', error);
      throw error;
    }
  },

  // Delete parameter (Admin only)
  async deleteParameter(id) {
    try {
      const response = await api.delete(`/parameters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting parameter:', error);
      throw error;
    }
  },
};
