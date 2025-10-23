import { create } from 'zustand';
import { authApi, type User, type LoginCredentials, type RegisterData } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Load initial state from localStorage if available
const loadInitialState = () => {
  if (typeof window === 'undefined') return { user: null, isAuthenticated: false };
  
  try {
    const stored = localStorage.getItem('authState');
    return stored ? JSON.parse(stored) : { user: null, isAuthenticated: false };
  } catch (error) {
    console.error('Failed to parse auth state from localStorage', error);
    return { user: null, isAuthenticated: false };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      
      // Fetch user data
      const user = await authApi.getCurrentUser();
      
      const newState = { 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authState', JSON.stringify(newState));
      }
      
      set(newState);
      return true;
    } catch (error: any) {
      console.error('[API] Error details:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        const errorMsg = 'API endpoint not found. Please check server configuration.';
        console.error(errorMsg, {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        
        // Fallback to mock data if in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock user data for development');
          set({
            user: {
              _id: 'mock-user-id',
              email: 'demo@example.com',
              full_name: 'Demo User',
              role: 'admin',
              created_at: new Date().toISOString(),
              permissions: ['all']
            },
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } else {
          throw error;
        }
      } else {
        let errorMessage = 'Login failed';
        
        if (error && typeof error === 'object' && 'response' in error && error.response) {
          const response = error.response as any;
          // Server responded with an error status
          errorMessage = response.data?.detail || 
                        response.data?.message || 
                        `Server error: ${response.status} ${response.statusText}`;
          
          console.error('Login error details:', {
            status: response.status,
            statusText: response.statusText,
            data: error.response.data,
            url: error.config?.url
          });
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
          console.error('Network error - no response:', error.request);
        } else {
          // Error in setting up the request
          errorMessage = error.message || 'An unexpected error occurred';
          console.error('Login request setup error:', error.message);
        }
        
        set({ 
          error: errorMessage, 
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
        return false;
      }
    }
  },

  register: async (data: RegisterData): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      
      // Fetch user data
      const user = await authApi.getCurrentUser();
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 404) {
        const errorMsg = 'API endpoint not found. Please check server configuration.';
        console.error(errorMsg, {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        set({ 
          error: errorMsg,
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
        return false;
      } else {
        let errorMessage = 'Registration failed';
        
        if (error && typeof error === 'object' && 'response' in error && error.response) {
          const response = error.response as any;
          // Server responded with an error status
          errorMessage = response.data?.detail || 
                        response.data?.message || 
                        `Server error: ${response.status} ${response.statusText}`;
          
          console.error('Registration error details:', {
            status: response.status,
            statusText: response.statusText,
            data: error.response.data,
            url: error.config?.url
          });
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
          console.error('Network error - no response:', error.request);
        } else {
          // Error in setting up the request
          errorMessage = error.message || 'An unexpected error occurred';
          console.error('Registration request setup error:', error.message);
        }
        
        set({ 
          error: errorMessage, 
          isLoading: false,
          isAuthenticated: false,
          user: null
        });
        return false;
      }
    }
  },

  logout: async (): Promise<void> => {
    set({ isLoading: true });
    
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('Logout API call failed, proceeding with client-side cleanup:', error);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authState');
    }
    
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      error: null
    });
  },

  checkAuth: async (): Promise<void> => {
    const { accessToken } = authApi.getTokens();
    
    if (!accessToken) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    
    try {
      const user = await authApi.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to check auth status:', error);
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError() {
    set({ error: null });
  }
}));
