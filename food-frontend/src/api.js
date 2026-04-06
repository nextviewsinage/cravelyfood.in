import axios from 'axios';

// In development, call Django directly to avoid proxy issues
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000/api/'
  : `${process.env.REACT_APP_API_URL || 'https://cravelyfood-in.onrender.com'}/api/`;

const API_KEY = process.env.REACT_APP_API_KEY || 'cravelyfood-api-key-2024';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s to handle Render cold starts
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

// Retry once on timeout/network error (handles Render cold start)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config._retry) return Promise.reject(error);
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetwork = !error.response;
    if (isTimeout || isNetwork) {
      config._retry = true;
      await new Promise((r) => setTimeout(r, 3000)); // wait 3s then retry
      return api(config);
    }
    return Promise.reject(error);
  }
);

export default api;
