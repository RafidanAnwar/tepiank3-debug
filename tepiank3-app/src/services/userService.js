import api from './api';

export const userService = {
  // Get current user profile
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update current user profile
  async updateProfile(userData) {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Upload avatar file
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update avatar URL
  async updateAvatar(avatar) {
    const response = await api.put('/users/avatar', { avatar });
    return response.data;
  },

  // Update last login
  async updateLastLogin() {
    const response = await api.put('/users/last-login');
    return response.data;
  },

  // Get all users (Admin only)
  async getAllUsers(params = {}) {
    const response = await api.get('/users', { params });
    // API mengembalikan object dengan property data dan pagination
    return response.data.data || response.data;
  },

  // Update user role (Admin only)
  async updateUserRole(userId, role) {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Update user data (Admin only)
  async updateUser(userId, updateData) {
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data.data || response.data;
  },

  // Create new user (Admin only)
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data.data || response.data;
  },

  // Toggle user status (Admin only)
  async toggleUserStatus(userId) {
    const response = await api.put(`/users/${userId}/toggle-status`);
    return response.data;
  },

  // Delete user (Admin only)
  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Get navbar stats
  async getNavbarStats() {
    const response = await api.get('/dashboard/navbar-stats');
    return response.data;
  }
};