import React from 'react';
import {
  Button,
  ButtonProps,
  useTheme,
  alpha,
  styled,
} from '@mui/material';

interface PremiumActionButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  elevated?: boolean;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => !['elevated'].includes(prop as string),
})<PremiumActionButtonProps>(({ theme, variant = 'primary', size = 'medium', elevated = false }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          background: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          hoverBackground: theme.palette.success.dark,
        };
      case 'warning':
        return {
          background: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
          hoverBackground: theme.palette.warning.dark,
        };
      case 'error':
        return {
          background: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          hoverBackground: theme.palette.error.dark,
        };
      case 'info':
        return {
          background: theme.palette.info.main,
          color: theme.palette.info.contrastText,
          hoverBackground: theme.palette.info.dark,
        };
      case 'secondary':
        return {
          background: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          hoverBackground: theme.palette.secondary.dark,
        };
      default:
        return {
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          hoverBackground: theme.palette.primary.dark,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: theme.spacing(1, 2),
          fontSize: '0.875rem',
          borderRadius: theme.spacing(1.5),
        };
      case 'large':
        return {
          padding: theme.spacing(2, 4),
          fontSize: '1.125rem',
          borderRadius: theme.spacing(2),
        };
      default:
        return {
          padding: theme.spacing(1.5, 3),
          fontSize: '1rem',
          borderRadius: theme.spacing(1.5),
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return {
    background: variantStyles.background,
    color: variantStyles.color,
    padding: sizeStyles.padding,
    fontSize: sizeStyles.fontSize,
    borderRadius: sizeStyles.borderRadius,
    fontWeight: 600,
    textTransform: 'none' as const,
    letterSpacing: '0.5px',
    border: 'none',
    boxShadow: elevated 
      ? `0 8px 32px ${alpha(variantStyles.background, 0.4)}`
      : `0 4px 16px ${alpha(variantStyles.background, 0.3)}`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${theme.palette.common.white}33, transparent)`,
      transition: 'left 0.5s',
    },
    
    '&:hover': {
      background: variantStyles.hoverBackground,
      transform: elevated ? 'translateY(-4px)' : 'translateY(-2px)',
      boxShadow: elevated 
        ? `0 12px 40px ${alpha(variantStyles.background, 0.5)}`
        : `0 6px 20px ${alpha(variantStyles.background, 0.4)}`,
      
      '&::before': {
        left: '100%',
      },
    },
    
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: elevated 
        ? `0 4px 16px ${alpha(variantStyles.background, 0.4)}`
        : `0 2px 8px ${alpha(variantStyles.background, 0.3)}`,
    },
    
    '&:disabled': {
      background: alpha(theme.palette.action.disabled, 0.12),
      color: alpha(theme.palette.action.disabled, 0.38),
      boxShadow: 'none',
      transform: 'none',
    },
  };
});

const PremiumActionButton: React.FC<PremiumActionButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  elevated = false,
  children,
  ...props
}) => {
  return (
    <StyledButton
      size={size}
      elevated={elevated}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default PremiumActionButton;
