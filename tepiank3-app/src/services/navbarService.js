import api from './api';

export const navbarService = {
  // Get navbar statistics (notifications)
  getNavbarStats: async () => {
    try {
      const response = await api.get('/dashboard/navbar-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching navbar stats:', error);
      throw error;
    }
  },

  // Get user profile for navbar
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};