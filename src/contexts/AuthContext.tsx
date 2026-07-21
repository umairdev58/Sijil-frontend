import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, ChangePasswordData, OrganizationSummary } from '../types';
import apiService, { AuthResponse } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; organization: OrganizationSummary | null } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  organization: null,
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
        organization: action.payload.organization,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        organization: null,
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

const unpackAuthResponse = (response: AuthResponse): {
  user?: User;
  organization: OrganizationSummary | null;
} => {
  const nested = response.data && 'user' in response.data ? response.data : undefined;
  const user = response.user || nested?.user || (
    response.data && '_id' in response.data ? response.data : undefined
  );
  const organization = response.organization ?? nested?.organization ?? user?.organization ?? null;
  return { user, organization };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await apiService.getCurrentUser();
          const auth = unpackAuthResponse(response);
          if (response.success && auth.user) {
            localStorage.setItem('user', JSON.stringify(auth.user));
            dispatch({ type: 'AUTH_SUCCESS', payload: { user: auth.user, token, organization: auth.organization } });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
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
      const auth = unpackAuthResponse(response);
      if (response.success && response.token && auth.user) {
        console.log('AuthContext: Login successful, storing token and user...');
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(auth.user));
        console.log('AuthContext: Dispatching AUTH_SUCCESS...');
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: auth.user, token: response.token, organization: auth.organization } });
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

  const refreshAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await apiService.getCurrentUser();
    const auth = unpackAuthResponse(response);
    if (response.success && auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: auth.user, token, organization: auth.organization } });
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
    refreshAuth,
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