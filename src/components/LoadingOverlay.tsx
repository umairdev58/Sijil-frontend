import React from 'react';
import { Box, Backdrop, Fade, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import LoadingSpinner from './LoadingSpinner';

const OverlayContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(248, 250, 252, 0.9)',
  backdropFilter: 'blur(4px)',
  zIndex: 1000,
  borderRadius: theme.shape.borderRadius,
}));

const BackdropOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(248, 250, 252, 0.9)',
  backdropFilter: 'blur(4px)',
}));

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
  variant?: 'overlay' | 'backdrop';
  size?: 'small' | 'medium' | 'large';
  spinnerVariant?: 'spinner' | 'dots' | 'pulse' | 'shimmer';
  showMessage?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  thickness?: number;
  children?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  message = 'Loading...',
  variant = 'overlay',
  size = 'medium',
  spinnerVariant = 'spinner',
  showMessage = true,
  color = 'primary',
  thickness = 4,
  children,
}) => {
  const theme = useTheme();

  if (variant === 'backdrop') {
    return (
      <>
        {children}
        <BackdropOverlay open={loading}>
          <Fade in={loading} timeout={300}>
            <Box>
              <LoadingSpinner
                size={size}
                variant={spinnerVariant}
                message={message}
                showMessage={showMessage}
                color={color}
                thickness={thickness}
              />
            </Box>
          </Fade>
        </BackdropOverlay>
      </>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {loading && (
        <Fade in={loading} timeout={300}>
          <OverlayContainer>
            <LoadingSpinner
              size={size}
              variant={spinnerVariant}
              message={message}
              showMessage={showMessage}
              color={color}
              thickness={thickness}
            />
          </OverlayContainer>
        </Fade>
      )}
    </Box>
  );
};

export default LoadingOverlay;
