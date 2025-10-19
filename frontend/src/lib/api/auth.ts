import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  user_id: string;
  email: string;
  role: string;
  supplier_id?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface User {
  _id: string;
  email: string;
  role: string;
  full_name: string;
  company_name?: string;
  created_at: string;
  supplier_id?: string;
  permissions?: string[];
}

// Store tokens in localStorage
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authApi = {
  // Store tokens
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }
    }
  },

  // Get stored tokens
  getTokens: () => {
    if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
    return {
      accessToken: localStorage.getItem(TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
    };
  },

  // Clear all auth data
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  // Login with email/password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    
    // Store tokens if received
    if (response.data.access_token) {
      authApi.setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      });
    }
    
    return response.data;
  },
  
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    
    // Store tokens if received
    if (response.data.access_token) {
      authApi.setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      });
    }
    
    return response.data;
  },
  
  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },
  
  // Refresh access token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const { refreshToken } = authApi.getTokens();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', {
      refresh_token: refreshToken
    });
    
    // Update stored access token
    if (response.data.access_token) {
      authApi.setTokens({
        accessToken: response.data.access_token
      });
    }
    
    return response.data;
  },
  
  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      authApi.clearAuth();
    }
  }
};
