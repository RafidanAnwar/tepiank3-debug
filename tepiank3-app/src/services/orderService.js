import api from './api';

export const orderService = {
  // Get all orders (for admin)
  async getAllOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  // Get user's orders
  async getUserOrders() {
    const response = await api.get('/orders/user');
    return response.data;
  },

  // Get order by ID
  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Update order status (admin only)
  async updateOrderStatus(id, status) {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  async cancelOrder(id) {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Get worksheet data (admin only)
  async getWorksheetData() {
    const response = await api.get('/orders/worksheet/data');
    return response.data;
  },

  // Update order
  async updateOrder(id, orderData) {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  // Delete order
  async deleteOrder(id) {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  }
};