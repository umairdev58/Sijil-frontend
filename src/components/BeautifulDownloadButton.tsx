import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface BeautifulDownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tooltipText?: string;
  buttonText?: string;
}

const BeautifulDownloadButton: React.FC<BeautifulDownloadButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  tooltipText = "Size: 20Mb",
  buttonText = "Download"
}) => {
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
        '--button-color': disabled ? '#6b7280' : '#1163ff',
        '--tooltip-color': '#fff',
        width: 'var(--width)',
        height: 'var(--height)',
        background: 'var(--button-color)',
        position: 'relative',
        textAlign: 'center',
        borderRadius: '0.45em',
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
          background: disabled ? '#6b7280' : '#6c18ff',
          '& .text': {
            top: '-100%',
          },
          '& .icon': {
            top: 0,
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
          color: '#fff',
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
            color: '#fff',
            top: 0,
            transition: 'top 0.5s',
          }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ color: '#fff' }} />
          ) : (
            buttonText
          )}
        </Box>
        <Box
          className="icon"
          sx={{
            color: '#fff',
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
              d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"
            />
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

export default BeautifulDownloadButton;
