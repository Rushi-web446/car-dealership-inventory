import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthState, LoginCredentials, RegisterCredentials } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    console.log('AuthContext useEffect token', token);
    console.log('AuthContext useEffect userStr', userStr);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('AuthContext parsed user', user);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
          token,
        });
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authApi.login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthState({
      user: data.user,
      isAuthenticated: true,
      loading: false,
      token: data.token,
    });
  };

  const register = async (credentials: RegisterCredentials) => {
    const data = await authApi.register(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthState({
      user: data.user,
      isAuthenticated: true,
      loading: false,
      token: data.token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      token: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
