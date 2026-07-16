/**
 * Centralized API Client
 * 
 * All API calls should use this module instead of raw axios.
 * Automatically attaches JWT auth token to every request and
 * handles 401 (unauthorized) responses by redirecting to login.
 */
import axios from 'axios';
import API_BASE_URL from './config';

// Create a dedicated axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// Handle 401 responses globally by clearing auth state and redirecting to login
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('loginUser');

      // Redirect to login (reload forces React to re-render from unauthenticated state)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
