import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Define the variant type
type ChartVariant = 'default' | 'elevated' | 'outlined';

interface PremiumChartProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  chartVariant?: ChartVariant;
  chartHeight?: number;
}

const ChartContainer = styled(Paper)<{ chartVariant: ChartVariant; size: 'small' | 'medium' | 'large' }>(({ theme, chartVariant, size }) => {
  return {
    background: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.95)
      : theme.palette.background.paper,
    borderRadius: theme.spacing(3),
    border: chartVariant === 'outlined' 
      ? `2px solid ${alpha(theme.palette.divider, 0.12)}`
      : 'none',
    boxShadow: chartVariant === 'elevated' 
      ? `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`
      : chartVariant === 'default'
      ? `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`
      : 'none',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: chartVariant === 'elevated' ? 'translateY(-4px)' : 'none',
      boxShadow: chartVariant === 'elevated' 
        ? `0 12px 40px ${alpha(theme.palette.common.black, 0.16)}`
        : chartVariant === 'default'
        ? `0 6px 24px ${alpha(theme.palette.common.black, 0.12)}`
        : 'none',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: chartVariant === 'outlined' 
        ? 'transparent'
        : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
    },
  };
});

const ChartHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2, 3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  background: alpha(theme.palette.background.paper, 0.5),
}));

const ChartContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    transform: 'scale(1.1)',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.success.main, 0.1),
  color: theme.palette.success.main,
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 'auto',
  padding: theme.spacing(0.5, 1),
}));

const LoadingSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  background: alpha(theme.palette.action.hover, 0.3),
}));

const PremiumChart: React.FC<PremiumChartProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  error,
  actions,
  size = 'medium',
  chartVariant = 'default',
  chartHeight = 400,
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          titleVariant: 'h6' as const,
          subtitleVariant: 'body2' as const,
          headerPadding: theme.spacing(2, 2, 1.5, 2),
          contentPadding: theme.spacing(2),
        };
      case 'large':
        return {
          titleVariant: 'h4' as const,
          subtitleVariant: 'h6' as const,
          headerPadding: theme.spacing(4, 4, 3, 4),
          contentPadding: theme.spacing(4),
        };
      default:
        return {
          titleVariant: 'h5' as const,
          subtitleVariant: 'body1' as const,
          headerPadding: theme.spacing(3, 3, 2, 3),
          contentPadding: theme.spacing(3),
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ height: chartHeight }}>
          <Stack spacing={2}>
            <LoadingSkeleton variant="rectangular" height={chartHeight * 0.8} />
            <Stack direction="row" spacing={1}>
              <LoadingSkeleton variant="rectangular" height={20} width="30%" />
              <LoadingSkeleton variant="rectangular" height={20} width="20%" />
              <LoadingSkeleton variant="rectangular" height={20} width="25%" />
            </Stack>
          </Stack>
        </Box>
      );
    }

    if (error) {
      return (
        <Box 
          sx={{ 
            height: chartHeight, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Chart Error
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {error}
          </Typography>
        </Box>
      );
    }

    return children;
  };

  return (
    <ChartContainer chartVariant={chartVariant} size={size}>
      {/* Header */}
      <ChartHeader sx={{ padding: sizeStyles.headerPadding }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography 
                variant={sizeStyles.titleVariant} 
                fontWeight={700}
                color="text.primary"
              >
                {title}
              </Typography>
              {!loading && !error && (
                <StatusChip label="Live" size="small" />
              )}
            </Stack>
            {subtitle && (
              <Typography 
                variant={sizeStyles.subtitleVariant} 
                color="text.secondary"
                sx={{ opacity: 0.8 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {actions}
            <ActionButton size="small">
              <RefreshIcon fontSize="small" />
            </ActionButton>
            <ActionButton size="small">
              <DownloadIcon fontSize="small" />
            </ActionButton>
            <ActionButton size="small">
              <FullscreenIcon fontSize="small" />
            </ActionButton>
            <ActionButton size="small">
              <MoreVertIcon fontSize="small" />
            </ActionButton>
          </Stack>
        </Stack>
      </ChartHeader>

      {/* Chart Content */}
      <ChartContent sx={{ padding: sizeStyles.contentPadding }}>
        {renderContent()}
      </ChartContent>
    </ChartContainer>
  );
};

export default PremiumChart;
