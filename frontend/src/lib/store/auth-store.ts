import { create } from 'zustand';
import { authApi, AuthResponse, User, LoginCredentials, RegisterData } from '../api/auth';

interface AuthState {
  user: (User & { supplier_id?: string }) | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, companyName?: string, role?: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string, rememberMe = true) => {
    set({ isLoading: true, error: null });
    try {
      // Log the login attempt
      console.log('Attempting login with email:', email);
      
      // Call the auth API
      const response = await authApi.login({ 
        email, 
        password,
        remember_me: rememberMe 
      });
      
      // Log the API response
      console.log('Login API response:', response);
      
      if (!response.access_token) {
        throw new Error('No access token received');
      }
      
      // Get user data using the token
      const userData = await authApi.getCurrentUser();
      console.log('User data from /me endpoint:', userData);
      
      // Prepare user object with fallback for supplier_id
      const userWithSupplierId = {
        ...userData,
        supplier_id: userData.supplier_id || userData._id
      };
      
      console.log('Login successful, user:', userWithSupplierId);
      set({ 
        user: userWithSupplierId, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error: any) {
      // Enhanced error logging
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Login failed. Please check your credentials and try again.';
      
      console.error('Login error:', {
        message: errorMessage,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        error: error
      });
      
      set({ 
        error: errorMessage,
        isAuthenticated: false,
        isLoading: false
      });
      
      return false;
    }
  },

  register: async (email: string, password: string, fullName: string, companyName?: string, role = 'supplier'): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      console.log('Registering user:', { email, fullName, companyName, role });
      
      const response = await authApi.register({ 
        email, 
        password, 
        full_name: fullName, 
        company_name: companyName, 
        role 
      });
      
      console.log('Registration response:', response);
      
      if (!response.access_token) {
        throw new Error('No access token received during registration');
      }
      
      // Get user data
      const userData = await authApi.getCurrentUser();
      console.log('User data after registration:', userData);
      
      const userWithSupplierId = {
        ...userData,
        supplier_id: userData.supplier_id || userData._id
      };
      
      set({ 
        user: userWithSupplierId, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      console.error('Registration error:', errorMessage, error);
      
      set({ 
        error: errorMessage,
        isAuthenticated: false,
        isLoading: false
      });
      
      return false;
    }
  },

  logout: async (): Promise<boolean> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    }
    return true;
  },

  checkAuth: async (): Promise<boolean> => {
    set({ isLoading: true });
    try {
      console.log('Checking authentication status...');
      
      // Check if we have a token
      const { accessToken } = authApi.getTokens();
      if (!accessToken) {
        throw new Error('No authentication token found');
      }
      
      // Verify token by fetching user data
      const userData = await authApi.getCurrentUser();
      
      if (!userData) {
        throw new Error('No user data returned');
      }
      
      console.log('User is authenticated:', userData);
      
      const userWithSupplierId = {
        ...userData,
        supplier_id: userData.supplier_id || userData._id
      };
      
      set({
        user: userWithSupplierId,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Clear any invalid tokens
      authApi.clearAuth();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please log in again.'
      });
      
      return false;
    }
  },
}));