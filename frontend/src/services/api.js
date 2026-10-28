import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT Bearer token and handle multipart
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, delete preset Content-Type so browser sets boundary automatically
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      const isPublic = path.endsWith('/login') || path.endsWith('/register') || path.endsWith('/') || path === import.meta.env.BASE_URL;
      if (!isPublic) {
        // Use relative navigation so it works under any base path (local dev or GitHub Pages)
        window.location.href = import.meta.env.BASE_URL + 'login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
