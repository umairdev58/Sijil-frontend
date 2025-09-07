import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, ChangePasswordData } from '../types';
import apiService from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data, token } });
          } else if (storedUser) {
            // Fallback to stored user if API call fails
            const user = JSON.parse(storedUser);
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          } else {
            dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
          }
        } catch (error) {
          // If API call fails, try to restore from localStorage
          if (storedUser) {
            const user = JSON.parse(storedUser);
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          } else {
            dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
          }
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Starting login process...');
      dispatch({ type: 'AUTH_START' });
      console.log('AuthContext: Making API call to login...');
      const response = await apiService.login(credentials);
      console.log('AuthContext: Login API response:', response);
      if (response.success && response.token && response.user) {
        console.log('AuthContext: Login successful, storing token and user...');
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('AuthContext: Dispatching AUTH_SUCCESS...');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.user, token: response.token } });
        console.log('AuthContext: Login process completed successfully');
      } else {
        console.log('AuthContext: Login failed - no success or data');
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Login failed' });
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.response?.data?.message || 'Login failed' 
      });
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.changePassword(data);
      if (response.success) {
        dispatch({ type: 'CLEAR_ERROR' });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Password change failed' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.response?.data?.message || 'Password change failed' 
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 