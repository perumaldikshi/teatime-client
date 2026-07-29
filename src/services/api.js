import axios from 'axios';

const DEV_URL = 'https://tea-time-server.vercel.app/api';
const PROD_URL = 'https://tea-time-server.vercel.app/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEV_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to dynamically inject the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to capture auth errors and auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.warn('API returned 401. Logging out...');
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
      // Redirect to login if user is not already there
      if (!window.location.pathname.endsWith('/login') && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const errMsg = error.response?.data?.error || error.message || 'API request failed';
    return Promise.reject(new Error(errMsg));
  }
);

export const setBaseURL = (url) => {
  api.defaults.baseURL = url;
};

export default api;
