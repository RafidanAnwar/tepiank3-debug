import api from './api';

export const clusterService = {
  // Get all clusters
  async getAllClusters() {
    try {
      const response = await api.get('/clusters');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching clusters:', error);
      throw error;
    }
  },

  // Get cluster by ID
  async getClusterById(id) {
    try {
      const response = await api.get(`/clusters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cluster:', error);
      throw error;
    }
  },

  // Create new cluster
  async createCluster(clusterData) {
    try {
      const response = await api.post('/clusters', clusterData);
      return response.data;
    } catch (error) {
      console.error('Error creating cluster:', error);
      throw error;
    }
  },

  // Update cluster
  async updateCluster(id, clusterData) {
    try {
      const response = await api.put(`/clusters/${id}`, clusterData);
      return response.data;
    } catch (error) {
      console.error('Error updating cluster:', error);
      throw error;
    }
  },

  // Delete cluster
  async deleteCluster(id) {
    try {
      const response = await api.delete(`/clusters/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting cluster:', error);
      throw error;
    }
  },

  // Alias for getAllClusters
  getClusters() {
    return this.getAllClusters();
  }
};