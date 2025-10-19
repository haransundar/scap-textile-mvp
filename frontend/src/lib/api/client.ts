import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { authApi } from './auth';

// Types for token refresh handling
interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

// Store for pending requests while refreshing token
let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Get API URL from environment with fallback (empty for proxy)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000
});

// Log API URL for debugging
console.log('API Base URL:', API_URL || '(using Next.js proxy)');

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return config;
    }

    // Get token from auth store
    const { accessToken } = authApi.getTokens();
    
    // Set Authorization header if token exists
    if (accessToken) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${accessToken}`, true);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Log error details
    console.error('[API] Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
    });

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve: (token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              resolve(apiClient(originalRequest));
            }, 
            reject: (err) => {
              reject(err);
            } 
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        authApi
          .refreshToken()
          .then(({ access_token }) => {
            // Update the auth header
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
            }

            // Process any queued requests
            processQueue(null, access_token);

            // Retry the original request
            resolve(apiClient(originalRequest));
          })
          .catch((err) => {
            // If refresh token fails, clear auth and redirect to login
            processQueue(err, null);
            authApi.clearAuth();
            
            // Only redirect if we're on the client side and not already on the login page
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // If error is not 401 or we've already tried to refresh, reject
    return Promise.reject(error);
  }
);

export default apiClient;
