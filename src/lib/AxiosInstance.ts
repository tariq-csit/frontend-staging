import axios from 'axios';
import { apiRoutes } from './routes';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});



async function refreshToken() {
  try {
    const response = await axios.post(apiRoutes.refreshToken, {
      refreshToken: sessionStorage.refreshToken,
    });
    sessionStorage.setItem('token', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error(error);
    throw error; 
  }
}

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor
axiosInstance.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  if (error.response.status === 401 && !error.config._retry) {
    error.config._retry = true;
    try {
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(error.config); 
    } catch (refreshError) {
      // Optional: Log the user out if token refresh fails
      console.error('User session expired');
      // Redirect to login or show an error
      sessionStorage.clear()
      window.location.href = '/login';
    }
    // Redirect to login or logout the user
  }
  return Promise.reject(error);
});

export default axiosInstance;
