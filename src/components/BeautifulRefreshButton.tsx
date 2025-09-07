import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface BeautifulRefreshButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tooltipText?: string;
  buttonText?: string;
  color?: string;
  variant?: 'filled' | 'outlined';
}

const BeautifulRefreshButton: React.FC<BeautifulRefreshButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  tooltipText = "Refresh data",
  buttonText = "Refresh",
  color = '#8b5cf6',
  variant = 'filled'
}) => {
  const getButtonColor = () => {
    if (disabled) return '#6b7280';
    if (variant === 'outlined') return 'transparent';
    return color;
  };

  const getHoverColor = () => {
    if (disabled) return '#6b7280';
    if (variant === 'outlined') return 'transparent';
    return 'transparent';
  };

  const getBorderColor = () => {
    if (variant === 'outlined') return color;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'outlined') return color;
    return '#ffffff';
  };

  const getHoverTextColor = () => {
    if (variant === 'outlined') return color;
    return color;
  };

  return (
    <Box
      component="div"
      className="button"
      data-tooltip={tooltipText}
      onClick={disabled ? undefined : onClick}
      sx={{
        '--width': '120px',
        '--height': '40px',
        '--tooltip-height': '35px',
        '--tooltip-width': '90px',
        '--gap-between-tooltip-to-button': '18px',
        '--button-color': getButtonColor(),
        '--tooltip-color': '#fff',
        width: 'var(--width)',
        height: 'var(--height)',
        background: 'var(--button-color)',
        border: `1px solid ${getBorderColor()}`,
        position: 'relative',
        textAlign: 'center',
        borderRadius: '999px',
        fontFamily: 'Arial',
        transition: 'background 0.3s',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        '&::before': {
          position: 'absolute',
          content: 'attr(data-tooltip)',
          width: 'var(--tooltip-width)',
          height: 'var(--tooltip-height)',
          backgroundColor: 'var(--tooltip-color)',
          fontSize: '0.9rem',
          color: '#111',
          borderRadius: '.25em',
          lineHeight: 'var(--tooltip-height)',
          bottom: 'calc(var(--height) + var(--gap-between-tooltip-to-button) + 10px)',
          left: 'calc(50% - var(--tooltip-width) / 2)',
          opacity: 0,
          visibility: 'hidden',
          transition: 'all 0.5s',
        },
        '&::after': {
          position: 'absolute',
          content: '""',
          width: 0,
          height: 0,
          border: '10px solid transparent',
          borderTopColor: 'var(--tooltip-color)',
          left: 'calc(50% - 10px)',
          bottom: 'calc(100% + var(--gap-between-tooltip-to-button) - 10px)',
          opacity: 0,
          visibility: 'hidden',
          transition: 'all 0.5s',
        },
        '&:hover': {
          background: disabled ? '#6b7280' : getHoverColor(),
          '& .text': {
            top: '-100%',
            color: getHoverTextColor(),
          },
          '& .icon': {
            top: 0,
            color: getHoverTextColor(),
          },
          '&::before, &::after': {
            opacity: 1,
            visibility: 'visible',
          },
          '&::after': {
            bottom: 'calc(var(--height) + var(--gap-between-tooltip-to-button) - 20px)',
          },
          '&::before': {
            bottom: 'calc(var(--height) + var(--gap-between-tooltip-to-button))',
          },
        },
      }}
    >
      <Box
        className="button-wrapper"
        sx={{
          overflow: 'hidden',
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          color: getTextColor(),
        }}
      >
        <Box
          className="text"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            color: getTextColor(),
            top: 0,
            transition: 'top 0.5s',
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color: getTextColor() }} />
          ) : (
            buttonText
          )}
        </Box>
        <Box
          className="icon"
          sx={{
            color: getTextColor(),
            top: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            transition: 'top 0.5s',
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            aria-hidden="true" 
            role="img" 
            width="24" 
            height="24" 
            preserveAspectRatio="xMidYMid meet" 
            viewBox="0 0 24 24"
          >
            <path 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
            />
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

export default BeautifulRefreshButton;
