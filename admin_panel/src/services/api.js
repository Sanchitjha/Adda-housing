import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Society APIs
export const societyAPI = {
  getAll: () => api.get('/societies'),
  getById: (id) => api.get(`/societies/${id}`),
  create: (data) => api.post('/societies', data),
  update: (id, data) => api.put(`/societies/${id}`, data),
  delete: (id) => api.delete(`/societies/${id}`),
};

// Members APIs
export const membersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Bills APIs
export const billsAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  generate: (data) => api.post('/bills/generate', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
};

// Payments APIs
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  getRazorpayOrder: (data) => api.post('/payments/razorpay/order', data),
};

// Complaints APIs
export const complaintsAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
};

// Notices APIs
export const noticesAPI = {
  getAll: (params) => api.get('/notices', { params }),
  getById: (id) => api.get(`/notices/${id}`),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
};

// Visitors APIs
export const visitorsAPI = {
  getAll: (params) => api.get('/visitors', { params }),
  getById: (id) => api.get(`/visitors/${id}`),
  create: (data) => api.post('/visitors', data),
  update: (id, data) => api.put(`/visitors/${id}`, data),
  approve: (id) => api.put(`/visitors/${id}/approve`),
  reject: (id) => api.put(`/visitors/${id}/reject`),
};

// Amenities APIs
export const amenitiesAPI = {
  getAll: (params) => api.get('/amenities', { params }),
  getById: (id) => api.get(`/amenities/${id}`),
  create: (data) => api.post('/amenities', data),
  update: (id, data) => api.put(`/amenities/${id}`, data),
  delete: (id) => api.delete(`/amenities/${id}`),
};

// Amenity Bookings APIs
export const bookingsAPI = {
  getAll: (params) => api.get('/amenities/bookings', { params }),
  getById: (id) => api.get(`/amenities/bookings/${id}`),
  create: (data) => api.post('/amenities/bookings', data),
  update: (id, data) => api.put(`/amenities/bookings/${id}`, data),
  cancel: (id) => api.put(`/amenities/bookings/${id}/cancel`),
};

// Staff APIs
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: (societyId) => api.get(`/dashboard/stats`, { params: { society_id: societyId } }),
  getRevenueChart: (params) => api.get('/dashboard/revenue-chart', { params }),
  getComplaintsChart: (params) => api.get('/dashboard/complaints-chart', { params }),
  getVisitorsChart: (params) => api.get('/dashboard/visitors-chart', { params }),
};

// Reports APIs
export const reportsAPI = {
  exportPDF: (type, params) => api.get(`/reports/${type}/pdf`, { params, responseType: 'blob' }),
  exportExcel: (type, params) => api.get(`/reports/${type}/excel`, { params, responseType: 'blob' }),
};

export default api;
