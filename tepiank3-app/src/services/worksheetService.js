import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/worksheets';

export const worksheetService = {
  // Get all worksheets with filters
  getAllWorksheets: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await axios.get(`${BASE_URL}?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data; // Return the whole response object { data, pagination }
    } catch (error) {
      throw error;
    }
  },

  // Get single worksheet
  getWorksheetById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create worksheet from pengujian
  createWorksheet: async (pengujianId, pegawaiUtama = null, pegawaiPendamping = null) => {
    try {
      const response = await axios.post(
        BASE_URL,
        {
          pengujianId,
          pegawaiUtama,
          pegawaiPendamping
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update worksheet
  updateWorksheet: async (id, data) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/${id}`,
        data,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update worksheet item (nilai, satuan, keterangan)
  updateWorksheetItem: async (itemId, nilai, satuan, keterangan) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/item/${itemId}`,
        {
          nilai,
          satuan,
          keterangan
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete worksheet
  deleteWorksheet: async (id) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/${id}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
