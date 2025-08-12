import axios from 'axios';

// Base URL akan menggunakan proxy dari package.json
const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Employee API
export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  }
};

// Attendance API
export const attendanceAPI = {
  checkIn: async (notes = '') => {
    const response = await api.post('/attendance/checkin', { notes });
    return response.data;
  },

  checkOut: async (notes = '') => {
    const response = await api.post('/attendance/checkout', { notes });
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getHistory: async (limit = 30) => {
    const response = await api.get(`/attendance/history?limit=${limit}`);
    return response.data;
  },

  getTodayAttendance: async () => {
    const response = await api.get('/attendance/today-all');
    return response.data;
  }
};

export default api;