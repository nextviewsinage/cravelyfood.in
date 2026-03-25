import axios from 'axios';

// In development, call Django directly to avoid proxy issues
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000/api/'
  : '/api/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
