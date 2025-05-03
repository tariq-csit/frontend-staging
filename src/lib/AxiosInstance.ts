import axios from 'axios';
import { apiRoutes } from './routes';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Function to handle token refresh
async function refreshToken() {
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

// Response Interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
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
