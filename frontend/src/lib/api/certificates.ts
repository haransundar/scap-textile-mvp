import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For sending cookies with requests
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('The requested resource was not found');
          break;
        case 500:
          toast.error('An unexpected error occurred on the server');
          break;
        default:
          const errorData = error.response.data as { detail?: string };
          toast.error(errorData?.detail || 'An error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      toast.error('Request setup error: ' + error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export type CertificateStatus = 'valid' | 'expiring_soon' | 'expired' | 'unknown';

export interface Certificate {
  _id: string;
  user_id: string;
  certificate_type: string;
  certificate_number: string;
  issued_by: string;
  issued_to: string;
  issued_date: string;
  expiry_date: string;
  scope: string;
  status: CertificateStatus;
  original_filename: string;
  file_path: string;
  ocr_text: string;
  ocr_confidence: number;
  verified: boolean;
  needs_review: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateCreate {
  certificate_type: string;
  certificate_number: string;
  issued_by: string;
  issued_to: string;
  issued_date: string;
  expiry_date: string;
  scope: string;
  notes?: string;
  file?: File;
}

export interface CertificateUpdate {
  certificate_type?: string;
  certificate_number?: string;
  issued_by?: string;
  issued_to?: string;
  issued_date?: string;
  expiry_date?: string;
  scope?: string;
  notes?: string;
  verified?: boolean;
  needs_review?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  stats: {
    valid: number;
    expiring_soon: number;
    expired: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

/**
 * Upload a certificate file for processing
 */
export const uploadCertificate = async (file: File): Promise<Certificate> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<Certificate>('/certificates/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * List certificates with pagination and filtering
 */
export interface ListCertificatesParams {
  page?: number;
  per_page?: number;
  status?: CertificateStatus | 'all';
  certificate_type?: string;
  search?: string;
  sort?: string;
}

export const listCertificates = async ({
  page = 1,
  per_page = 10,
  status,
  certificate_type,
  search,
  sort = '-expiry_date',
}: ListCertificatesParams = {}): Promise<PaginatedResponse<Certificate>> => {
  const params: Record<string, any> = {
    page,
    per_page,
    sort,
  };
  
  if (status && status !== 'all') params.status = status;
  if (certificate_type) params.certificate_type = certificate_type;
  if (search) params.search = search;
  
  const response = await api.get<PaginatedResponse<Certificate>>('/certificates', { params });
  return response.data;
};

/**
 * Get a single certificate by ID
 */
export const getCertificate = async (id: string): Promise<Certificate> => {
  const response = await api.get<Certificate>(`/certificates/${id}`);
  return response.data;
};

/**
 * Update a certificate
 */
export const updateCertificate = async (
  id: string, 
  data: CertificateUpdate
): Promise<Certificate> => {
  const response = await api.put<Certificate>(`/certificates/${id}`, data);
  return response.data;
};

/**
 * Delete a certificate
 */
export const deleteCertificate = async (id: string): Promise<void> => {
  await api.delete(`/certificates/${id}`);
};

/**
 * Download certificate file
 */
export const downloadCertificateFile = async (id: string): Promise<Blob> => {
  const response = await api.get(`/certificates/${id}/file`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get certificate statistics
 */
export interface CertificateStats {
  valid: number;
  expiring_soon: number;
  expired: number;
  total: number;
}

export const getCertificateStats = async (): Promise<CertificateStats> => {
  const response = await api.get<CertificateStats>('/certificates/stats');
  return response.data;
};

/**
 * Verify a certificate's data
 */
export const verifyCertificate = async (id: string): Promise<Certificate> => {
  const response = await api.post<Certificate>(`/certificates/${id}/verify`);
  return response.data;
};
