import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`} arrow>
      <IconButton
        onClick={toggleTheme}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          background: isDark 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: isDark 
            ? '1px solid rgba(99, 102, 241, 0.3)'
            : '1px solid rgba(99, 102, 241, 0.2)',
          color: isDark ? '#a5b4fc' : '#6366f1',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            background: isDark 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: isDark 
              ? '1px solid rgba(99, 102, 241, 0.4)'
              : '1px solid rgba(99, 102, 241, 0.3)',
            transform: 'scale(1.05)',
            boxShadow: isDark 
              ? '0 8px 25px rgba(99, 102, 241, 0.3)'
              : '0 8px 25px rgba(99, 102, 241, 0.2)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark 
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
            borderRadius: 'inherit',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          {isDark ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
