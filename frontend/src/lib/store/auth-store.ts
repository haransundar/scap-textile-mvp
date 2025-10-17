import { create } from 'zustand';
import { authApi, AuthResponse, User } from '../api/auth';

interface AuthState {
  user: (User & { supplier_id?: string }) | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, companyName?: string, role?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('auth_token', response.access_token);
      
      // Fetch full user data
      const userData = await authApi.getCurrentUser();
      const userWithSupplierId = {
        ...userData,
        supplier_id: userData._id // Use _id as supplier_id
      };
      
      set({ user: userWithSupplierId, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Login failed', 
        isLoading: false,
        isAuthenticated: false
      });
    }
  },

  register: async (email, password, fullName, companyName, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({ 
        email, 
        password, 
        full_name: fullName,
        company_name: companyName,
        role: role || 'supplier'
      });
      localStorage.setItem('auth_token', response.access_token);
      
      // Fetch full user data
      const userData = await authApi.getCurrentUser();
      const userWithSupplierId = {
        ...userData,
        supplier_id: userData._id // Use _id as supplier_id
      };
      
      set({ user: userWithSupplierId, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Registration failed', 
        isLoading: false,
        isAuthenticated: false
      });
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const userData = await authApi.getCurrentUser();
      const userWithSupplierId = {
        ...userData,
        supplier_id: userData._id // Use _id as supplier_id
      };
      set({ user: userWithSupplierId, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));