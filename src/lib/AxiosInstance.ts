import axios from 'axios';
import { apiRoutes } from './routes';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Variable to store the ongoing refresh token promise
let refreshTokenPromise: Promise<string> | null = null;

// Function to handle token refresh
async function refreshToken() {
  try {
    // If there's already a refresh in progress, return the existing promise
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }

    // Create a new refresh token promise
    refreshTokenPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const baseURL = import.meta.env.VITE_API_URL;
        const response = await axios.post(baseURL + apiRoutes.refresh, {
          refreshToken: refreshToken,
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          // If a new refresh token is provided, update it
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          return response.data.token;
        }

        throw new Error('No token in refresh response');
      } catch (error: any) {
        // More specific error handling for refresh token failures
        if (error.response?.status === 401) {
          // Only clear auth if it's specifically a refresh token issue
          const errorMessage = (error.response?.data?.message || error.response?.data?.error || '').toLowerCase();
          if (errorMessage.includes('refresh token') || 
              errorMessage.includes('token expired') ||
              errorMessage.includes('invalid refresh') ||
              errorMessage.includes('unauthorized')) {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
        throw error;
      } finally {
        // Clear the refresh token promise so future refresh requests can proceed
        refreshTokenPromise = null;
      }
    })();

    return refreshTokenPromise;
  } catch (error) {
    localStorage.clear(); // Clear all auth tokens on refresh failure
    window.location.href = '/login';
    throw error;
  }
}

// Request Interceptor - Add token to all requests
axiosInstance.interceptors.request.use(
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

// Response Interceptor - Handle token refresh and user deletion
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors first (token expiration/invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check both possible error message fields
      const errorMessage = (error.response?.data?.message || error.response?.data?.error || '').toLowerCase();
      
      // Check for specific non-refreshable auth errors first
      if (errorMessage === "user not found") {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Check for explicit token invalidation (admin action)
      if (errorMessage === "token has been invalidated") {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // For other 401 errors (including "unauthorized"), attempt token refresh
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
