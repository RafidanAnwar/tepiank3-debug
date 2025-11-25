import api from './api';

const ENDPOINT = '/worksheets';

export const worksheetService = {
  // Get all worksheets with filters
  getAllWorksheets: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await api.get(`${ENDPOINT}?${params}`);
      return response.data; // Return the whole response object { data, pagination }
    } catch (error) {
      throw error;
    }
  },

  // Get single worksheet
  getWorksheetById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create worksheet from pengujian
  createWorksheet: async (pengujianId, pegawaiUtama = null, pegawaiPendamping = null) => {
    try {
      const response = await api.post(ENDPOINT, {
        pengujianId,
        pegawaiUtama,
        pegawaiPendamping
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update worksheet
  updateWorksheet: async (id, data) => {
    try {
      const response = await api.put(`${ENDPOINT}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update worksheet item (nilai, satuan, keterangan, isReady)
  updateWorksheetItem: async (itemId, nilai, satuan, keterangan, isReady) => {
    try {
      const response = await api.put(`${ENDPOINT}/item/${itemId}`, {
        nilai,
        satuan,
        keterangan,
        isReady
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete worksheet
  deleteWorksheet: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
