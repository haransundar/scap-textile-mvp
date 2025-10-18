import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Set the default Authorization header for API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Fetch user data
          await fetchUserData(storedToken);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage and state
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      setUser(user);
      
      // Redirect to dashboard or intended URL
      const redirectTo = router.query.redirect as string || '/dashboard';
      await router.push(redirectTo);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    try {
      await api.post('/api/auth/register', userData);
      // After successful registration, log the user in
      await login(userData.email, userData.password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear auth state
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    
    // Redirect to login page
    router.push('/login');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        await fetchUserData(token);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        // If refresh fails, log the user out
        logout();
      }
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
