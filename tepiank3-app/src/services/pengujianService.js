import api from './api';

export const pengujianService = {
  async getAllPengujian() {
    const response = await api.get('/pengujian');
    return response.data;
  },

  async getPengujianById(id) {
    const response = await api.get(`/pengujian/${id}`);
    return response.data;
  },

  async createPengujianWithCompany(data) {
    const response = await api.post('/pengujian', data);
    return response.data;
  }
};
