import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// CSRF token storage
let csrfToken = null;

// Function to get CSRF token
const getCSRFToken = async () => {
  try {
    const response = await api.get('/health');
    return response.headers['x-csrf-token'];
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
};

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      if (!csrfToken) {
        csrfToken = await getCSRFToken();
      }
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    // Add session ID for CSRF validation
    config.headers['X-Session-ID'] = sessionStorage.getItem('sessionId') || 'anonymous';
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Update CSRF token if provided in response
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken) {
      csrfToken = newCsrfToken;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('loggedUser');
      window.location.href = '/login';
    } else if (error.response?.status === 403 && error.response?.data?.code === 'CSRF_TOKEN_INVALID') {
      // Refresh CSRF token and retry
      csrfToken = await getCSRFToken();
      if (csrfToken && error.config) {
        error.config.headers['X-CSRF-Token'] = csrfToken;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Initialize session ID
if (!sessionStorage.getItem('sessionId')) {
  sessionStorage.setItem('sessionId', Math.random().toString(36).substring(2));
}

export default api;