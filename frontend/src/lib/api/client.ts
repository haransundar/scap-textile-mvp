import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';

// Check if we're on the server or client
const isServer = typeof window === 'undefined';

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

// Create axios instance with default config
// Always use the backend URL directly (no /api prefix in baseURL)
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Only run on client-side
    if (isServer) {
      return config;
    }

    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Set Authorization header if token exists
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle case where error response is undefined (network error)
    if (!error.response) {
      console.error('[API] Network Error:', {
        url: originalRequest?.url,
        message: error.message || 'Network error - server may be down',
      });
      
      return Promise.reject({
        ...error,
        message: 'Network error - unable to connect to server',
        isNetworkError: true
      });
    }
    
    // Handle 401 Unauthorized errors
    if (error.response.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        
        // Only redirect if not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
    
    // Handle 404 errors specifically
    if (error.response.status === 404) {
      console.error('[API] Endpoint Not Found:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response.status,
        statusText: error.response.statusText
      });
      
      return Promise.reject({
        ...error,
        message: `API endpoint not found: ${originalRequest?.url}`,
        isNotFoundError: true
      });
    }
    
    // Log error details with more information
    console.error('[API] Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default apiClient;
