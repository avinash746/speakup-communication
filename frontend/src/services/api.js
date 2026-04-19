import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('speakup_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('speakup_token');
      localStorage.removeItem('speakup_user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data) => api.patch('/auth/preferences', data)
};

// Analysis
export const analysisAPI = {
  analyze: (data) => api.post('/analysis', data),
  getById: (id) => api.get(`/analysis/${id}`)
};

// History
export const historyAPI = {
  getAll: (params) => api.get('/history', { params }),
  getStats: () => api.get('/history/stats'),
  toggleFavorite: (id) => api.patch(`/history/${id}/favorite`),
  delete: (id) => api.delete(`/history/${id}`)
};

export default api;
