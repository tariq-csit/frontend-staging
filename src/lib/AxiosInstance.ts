import axios from 'axios';
import { apiRoutes } from './routes';
import { decodeJWT } from './utils';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Variable to store the ongoing refresh token promise
let refreshTokenPromise: Promise<string> | null = null;

// Token refresh management
let tokenRefreshTimer: ReturnType<typeof setInterval> | null = null;
let lastTokenCheck: number = 0;
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiration

/**
 * Get token expiration time from localStorage
 * @returns expiration timestamp in milliseconds or null
 */
function getTokenExpiration(): number | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  return decoded.exp * 1000; // Convert to milliseconds
}

/**
 * Check if token needs refresh and refresh if needed
 * This is called periodically and before requests
 */
async function checkAndRefreshTokenIfNeeded(): Promise<void> {
  const expiration = getTokenExpiration();
  if (!expiration) return;
  
  const now = Date.now();
  const timeUntilExpiration = expiration - now;
  
  // Refresh if token expires within the buffer time
  if (timeUntilExpiration <= TOKEN_REFRESH_BUFFER) {
    try {
      await refreshToken();
    } catch (error) {
      // Silent fail - reactive refresh will handle it
      console.debug('Proactive token refresh failed, will retry on next request');
    }
  }
}

/**
 * Start periodic token refresh check
 * This runs in the background and refreshes tokens before they expire
 */
function startTokenRefreshTimer(): void {
  // Clear existing timer if any
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
  }
  
  // Check immediately
  checkAndRefreshTokenIfNeeded();
  
  // Then check periodically
  tokenRefreshTimer = setInterval(() => {
    checkAndRefreshTokenIfNeeded();
  }, TOKEN_CHECK_INTERVAL);
}

/**
 * Stop the token refresh timer
 */
function stopTokenRefreshTimer(): void {
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
}

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
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        const baseURL = import.meta.env.VITE_API_URL;
        const response = await axios.post(baseURL + apiRoutes.refresh, {
          refreshToken: storedRefreshToken,
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          // If a new refresh token is provided, update it
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          // Restart timer with new token
          startTokenRefreshTimer();
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
// Token refresh is handled by the background timer, but we do a quick check here
// if it's been a while since the last check (to handle cases where timer might be stopped)
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Quick check: if it's been more than 1 minute since last check, do a quick refresh check
      // This handles edge cases where the timer might not be running
      const now = Date.now();
      if (now - lastTokenCheck > 60000) { // 1 minute
        lastTokenCheck = now;
        // Non-blocking check - don't await, just trigger it
        checkAndRefreshTokenIfNeeded().catch(() => {
          // Silent fail - reactive refresh will handle it
        });
      }
      
      // Always use the current token (which may have been refreshed by the timer)
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
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
        // If refresh fails, stop timer and redirect to login
        stopTokenRefreshTimer();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Initialize token refresh timer when module loads (if user is already logged in)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (token && storedRefreshToken) {
    startTokenRefreshTimer();
  }
  
  // Also start timer when tokens are set (for login flows)
  // We'll expose a function to start it manually from login components
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' && e.newValue && !tokenRefreshTimer) {
      startTokenRefreshTimer();
    }
    if ((e.key === 'token' || e.key === 'refreshToken') && !e.newValue) {
      // Token was removed, stop timer
      stopTokenRefreshTimer();
    }
  });
}

// Export function to manually start timer (useful after login)
export function startTokenRefresh() {
  startTokenRefreshTimer();
}

// Export function to stop timer (useful on logout)
export function stopTokenRefresh() {
  stopTokenRefreshTimer();
}

export default axiosInstance;
