import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  // NOTE: Backend requires full SupplierCreate; this is a placeholder.
  // Implement full registration form later. For now, keep minimal to plan UI.
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  supplier_id: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/suppliers/login', credentials);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/suppliers/register', data);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<any> => {
    const response = await apiClient.get('/api/suppliers/me');
    return response.data;
  },
};