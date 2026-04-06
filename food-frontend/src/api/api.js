import axios from 'axios';

// In development, call Django directly to avoid proxy issues
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000/api/'
  : `${process.env.REACT_APP_API_URL}/api/`;

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// On 401 — try token refresh once, skip for auth endpoints
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest.url?.includes('auth/token') ||
      originalRequest.url?.includes('auth/register');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}auth/token/refresh/`, { refresh }, { timeout: 5000 });
          const newToken = res.data.access;
          localStorage.setItem('access_token', newToken);
          API.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return API(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;
