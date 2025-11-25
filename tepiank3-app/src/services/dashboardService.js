import api from './api';

const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get popular parameters (admin only)
  getPopularParameters: async () => {
    const response = await api.get('/dashboard/popular-parameters');
    return response.data;
  }
};

export default dashboardService;