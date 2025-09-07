import React from 'react';
import { Box, CircularProgress, Typography, Fade, useTheme } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Keyframe animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

// Styled components
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  minHeight: '200px',
  position: 'relative',
}));

const PulseContainer = styled(Box)(({ theme }) => ({
  animation: `${pulse} 2s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ShimmerText = styled(Typography)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%)'
    : 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
  backgroundSize: '200px 100%',
  animation: `${shimmer} 1.5s infinite`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 500,
}));

const BouncingDots = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  '& > div': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    animation: `${bounce} 1.4s ease-in-out infinite both`,
    '&:nth-of-type(1)': {
      animationDelay: '-0.32s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '-0.16s',
    },
  },
}));

const GradientSpinner = styled(CircularProgress)(({ theme }) => ({
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  variant?: 'spinner' | 'dots' | 'pulse' | 'shimmer';
  message?: string;
  showMessage?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  thickness?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'spinner',
  message = 'Loading...',
  showMessage = true,
  color = 'primary',
  thickness = 4,
}) => {
  const theme = useTheme();

  const sizeMap = {
    small: { spinner: 24, container: '100px' },
    medium: { spinner: 40, container: '200px' },
    large: { spinner: 60, container: '300px' },
    fullscreen: { spinner: 80, container: '100vh' },
  };

  const currentSize = sizeMap[size];

  if (size === 'fullscreen') {
    return (
      <Fade in={true} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.default,
            zIndex: 9999,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          }}
        >
          {variant === 'spinner' && (
            <GradientSpinner
              size={currentSize.spinner}
              thickness={thickness}
              color={color}
              sx={{
                '& .MuiCircularProgress-circle': {
                  stroke: `url(#gradient-${color})`,
                },
              }}
            />
          )}
          {variant === 'dots' && (
            <BouncingDots>
              <div></div>
              <div></div>
              <div></div>
            </BouncingDots>
          )}
          {variant === 'pulse' && (
            <PulseContainer>
              <Box
                sx={{
                  width: currentSize.spinner,
                  height: currentSize.spinner,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                }}
              />
            </PulseContainer>
          )}
          {showMessage && (
            <ShimmerText
              variant="body1"
              sx={{ mt: 2, textAlign: 'center' }}
            >
              {message}
            </ShimmerText>
          )}
          
          {/* SVG Gradient Definitions */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.palette.primary.main} />
                <stop offset="100%" stopColor={theme.palette.primary.dark} />
              </linearGradient>
              <linearGradient id="gradient-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.palette.secondary.main} />
                <stop offset="100%" stopColor={theme.palette.secondary.dark} />
              </linearGradient>
            </defs>
          </svg>
        </Box>
      </Fade>
    );
  }

  return (
    <LoadingContainer sx={{ minHeight: currentSize.container }}>
      {variant === 'spinner' && (
        <GradientSpinner
          size={currentSize.spinner}
          thickness={thickness}
          color={color}
          sx={{
            '& .MuiCircularProgress-circle': {
              stroke: `url(#gradient-${color})`,
            },
          }}
        />
      )}
      {variant === 'dots' && (
        <BouncingDots>
          <div></div>
          <div></div>
          <div></div>
        </BouncingDots>
      )}
      {variant === 'pulse' && (
        <PulseContainer>
          <Box
            sx={{
              width: currentSize.spinner,
              height: currentSize.spinner,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
            }}
          />
        </PulseContainer>
      )}
      {variant === 'shimmer' && (
        <Box
          sx={{
            width: currentSize.spinner,
            height: currentSize.spinner,
            borderRadius: '8px',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%)'
              : 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
            backgroundSize: '200px 100%',
            animation: `${shimmer} 1.5s infinite`,
          }}
        />
      )}
      {showMessage && (
        <ShimmerText
          variant="body2"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {message}
        </ShimmerText>
      )}
      
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} />
            <stop offset="100%" stopColor={theme.palette.primary.dark} />
          </linearGradient>
          <linearGradient id="gradient-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.secondary.main} />
            <stop offset="100%" stopColor={theme.palette.secondary.dark} />
          </linearGradient>
        </defs>
      </svg>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
