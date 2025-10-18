import { AxiosError } from 'axios';

export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
  
  static fromAxiosError(error: AxiosError): ApiError {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { data, status } = error.response;
      const message = typeof data === 'object' && data !== null && 'message' in data
        ? (data as any).message
        : error.message || 'An unknown error occurred';
      
      return new ApiError(message, status, data);
    } else if (error.request) {
      // The request was made but no response was received
      return new ApiError('No response received from server', 0);
    } else {
      // Something happened in setting up the request that triggered an Error
      return new ApiError(error.message || 'An unknown error occurred', 0);
    }
  }
  
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
  
  static isUnauthorized(error: unknown): boolean {
    return this.isApiError(error) && error.status === 401;
  }
  
  static isForbidden(error: unknown): boolean {
    return this.isApiError(error) && error.status === 403;
  }
  
  static isNotFound(error: unknown): boolean {
    return this.isApiError(error) && error.status === 404;
  }
  
  static isServerError(error: unknown): boolean {
    return this.isApiError(error) && error.status >= 500;
  }
}

// Helper function to handle API errors
// This function is not used directly in the API client
export const handleApiError = (error: unknown, defaultMessage = 'An error occurred'): never => {
  if (error instanceof ApiError) {
    throw error;
  } else if (error instanceof Error) {
    throw new ApiError(error.message || defaultMessage, 0);
  } else {
    throw new ApiError(defaultMessage, 0);
  }
};

/**
 * Wrapper for API calls that handles errors consistently
 * @template T - The expected response type
 * @param {() => Promise<T>} request - The API request function to execute
 * @param {string} [errorMessage='An error occurred'] - Custom error message
 * @returns {Promise<T>} The API response data
 */
export const apiRequest = async <T>(
  request: () => Promise<{ data: T }>,
  errorMessage = 'An error occurred'
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else if (error && typeof error === 'object' && 'isAxiosError' in error) {
      throw ApiError.fromAxiosError(error as any);
    } else {
      throw new ApiError(errorMessage, 0);
    }
  }
};
