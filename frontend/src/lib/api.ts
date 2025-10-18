import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';
import { ApiError } from './apiError';

// Create a custom axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/auth
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth context
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear any stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    // Convert all errors to ApiError
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

// Helper functions for different HTTP methods
const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api.get<T>(url, config);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      throw ApiError.fromAxiosError(error as any);
    }
    throw new ApiError(`Failed to fetch data from ${url}`, 0);
  }
};

const post = async <T, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      throw ApiError.fromAxiosError(error as any);
    }
    throw new ApiError(`Failed to post data to ${url}`, 0);
  }
};

const put = async <T, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      throw ApiError.fromAxiosError(error as any);
    }
    throw new ApiError(`Failed to update data at ${url}`, 0);
  }
};

const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api.delete<T>(url, config);
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      throw ApiError.fromAxiosError(error as any);
    }
    throw new ApiError(`Failed to delete data at ${url}`, 0);
  }
};

// Export the configured axios instance and helper methods
export { api, get, post, put, del };

// Type for paginated responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function for paginated queries
export const paginatedGet = async <T>(
  url: string,
  page: number = 1,
  limit: number = 10,
  params: Record<string, any> = {},
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<T>> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...params,
  });
  
  const queryString = queryParams.toString();
  const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
  
  return get<PaginatedResponse<T>>(fullUrl, config);
};

// Helper function to handle file uploads
export const uploadFile = async <T>(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData: Record<string, any> = {},
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<T> => {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // Append additional data as JSON string if provided
  if (Object.keys(additionalData).length > 0) {
    formData.append('data', JSON.stringify(additionalData));
  }
  
  return apiRequest<T>(
    async () => {
      const response = await api.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress as (progressEvent: AxiosProgressEvent) => void,
      });
      return response.data;
    },
    `Failed to upload file to ${url}`
  );
};
