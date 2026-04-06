import axios from 'axios';

// In development, call Django directly to avoid proxy issues
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000/api/'
  : `${process.env.REACT_APP_API_URL || 'https://cravelyfood-in.onrender.com'}/api/`;

const API_KEY = process.env.REACT_APP_API_KEY || 'cravelyfood-api-key-2024';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'X-API-Key': API_KEY },
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
