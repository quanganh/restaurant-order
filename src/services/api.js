import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Menu API
export const menuAPI = {
  getAll: () => api.get('/api/menu'),
  getAllAdmin: () => api.get('/api/menu/all'),
  getById: (id) => api.get(`/api/menu/${id}`),
  create: (data) => api.post('/api/menu', data),
  update: (id, data) => api.put(`/api/menu/${id}`, data),
  delete: (id) => api.delete(`/api/menu/${id}`),
  toggle: (id) => api.patch(`/api/menu/${id}/toggle`),
  getCategories: () => api.get('/api/menu/categories/list')
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/api/orders', data),
  getAll: (params) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  getByTable: (tableNumber) => api.get(`/api/orders/table/${tableNumber}`),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
  cancel: (id) => api.delete(`/api/orders/${id}`)
};

// Tables API
export const tablesAPI = {
  getAll: () => api.get('/api/tables'),
  getByNumber: (tableNumber) => api.get(`/api/tables/${tableNumber}`),
  create: (data) => api.post('/api/tables', data),
  update: (id, data) => api.put(`/api/tables/${id}`, data),
  delete: (id) => api.delete(`/api/tables/${id}`),
  getQRCode: (tableNumber) => api.get(`/api/tables/${tableNumber}/qr`),
  updateStatus: (tableNumber, status) => api.patch(`/api/tables/${tableNumber}/status`, { status }),
  callService: (tableNumber, message) => api.post(`/api/tables/${tableNumber}/service`, { message }),
  resolveService: (tableNumber, serviceId) => api.patch(`/api/tables/${tableNumber}/service/${serviceId}/resolve`)
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me'),
  setup: (data) => api.post('/api/auth/setup', data)
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getAnalytics: (period) => api.get('/api/admin/analytics', { params: { period } }),
  getStaff: () => api.get('/api/admin/staff'),
  createStaff: (data) => api.post('/api/admin/staff', data),
  updateStaff: (id, data) => api.put(`/api/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/api/admin/staff/${id}`),
  getServiceCalls: () => api.get('/api/admin/service-calls')
};

export default api;
