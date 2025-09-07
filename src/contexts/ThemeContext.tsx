import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage for saved preference
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // Create theme based on mode
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#8b5cf6', // Elegant purple
        light: '#a855f7',
        dark: '#7c3aed',
      },
      secondary: {
        main: '#6366f1', // Indigo
        light: '#818cf8',
        dark: '#4f46e5',
      },
      success: {
        main: '#10b981', // Emerald
        light: '#34d399',
        dark: '#059669',
      },
      warning: {
        main: '#f59e0b', // Amber
        light: '#fbbf24',
        dark: '#d97706',
      },
      error: {
        main: '#ef4444', // Red
        light: '#f87171',
        dark: '#dc2626',
      },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
      },
      divider: mode === 'dark' ? '#334155' : '#e2e8f0',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'dark' 
              ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
              : '0 2px 10px rgba(0, 0, 0, 0.05)',
            background: mode === 'dark' ? '#1e293b' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)' 
              : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
            borderRight: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: mode === 'dark' ? '#1e293b' : '#ffffff',
            border: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  const value = {
    mode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
