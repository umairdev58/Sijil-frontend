import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface KPIMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    period: string;
    isPositive: boolean;
  };
  progress?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const MetricCard = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.9)
    : theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.06)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 24px ${alpha(theme.palette.common.black, 0.12)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: `${theme.spacing(1.5)} ${theme.spacing(1.5)} 0 0`,
  },
}));

const TrendChip = styled(Chip)(({ theme, color = 'default' }) => ({
  background: color === 'success' 
    ? alpha(theme.palette.success.main, 0.1)
    : color === 'error'
    ? alpha(theme.palette.error.main, 0.1)
    : alpha(theme.palette.info.main, 0.1),
  color: color === 'success'
    ? theme.palette.success.main
    : color === 'error'
    ? theme.palette.error.main
    : theme.palette.info.main,
  border: `1px solid ${color === 'success'
    ? alpha(theme.palette.success.main, 0.2)
    : color === 'error'
    ? alpha(theme.palette.error.main, 0.2)
    : alpha(theme.palette.info.main, 0.2)}`,
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 'auto',
  padding: theme.spacing(0.5, 1),
}));

const ProgressBar = styled(LinearProgress)(({ theme, color = 'primary' }) => ({
  height: 6,
  borderRadius: 3,
  background: alpha(theme.palette[color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'].main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: `linear-gradient(90deg, ${theme.palette[color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'].main} 0%, ${theme.palette[color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'].light} 100%)`,
  },
}));

const KPIMetricCard: React.FC<KPIMetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  progress,
  status = 'info',
  icon,
  color,
  size = 'medium',
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      case 'info': return theme.palette.info.main;
      default: return color || theme.palette.primary.main;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.isPositive) {
      return <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />;
    } else if (trend.value === 0) {
      return <TrendingFlatIcon sx={{ color: theme.palette.info.main, fontSize: 16 }} />;
    } else {
      return <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'info';
    return trend.isPositive ? 'success' : trend.value === 0 ? 'info' : 'error';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          titleVariant: 'body2' as const,
          valueVariant: 'h5' as const,
          subtitleVariant: 'caption' as const,
          padding: theme.spacing(2),
        };
      case 'large':
        return {
          titleVariant: 'h6' as const,
          valueVariant: 'h3' as const,
          subtitleVariant: 'body2' as const,
          padding: theme.spacing(4),
        };
      default:
        return {
          titleVariant: 'body1' as const,
          valueVariant: 'h4' as const,
          subtitleVariant: 'body2' as const,
          padding: theme.spacing(3),
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <MetricCard sx={{ padding: sizeStyles.padding }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant={sizeStyles.titleVariant} 
            color="text.primary"
            sx={{ 
              fontWeight: 600,
              opacity: 0.9,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
            gutterBottom
          >
            {title}
          </Typography>
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              background: alpha(getStatusColor(), 0.15),
              color: getStatusColor(),
              border: `1px solid ${alpha(getStatusColor(), 0.2)}`,
            }}
          >
            {icon}
          </Box>
        )}
      </Stack>

      {/* Main Value */}
      <Typography 
        variant={sizeStyles.valueVariant} 
        fontWeight={800}
        color="text.primary"
        gutterBottom
        sx={{ 
          background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}B3 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1.5,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {value}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography 
          variant={sizeStyles.subtitleVariant} 
          color="text.secondary" 
          mb={2}
        >
          {subtitle}
        </Typography>
      )}

      {/* Trend Indicator */}
      {trend && (
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          {getTrendIcon()}
          <TrendChip
            label={`${trend.isPositive ? '+' : ''}${trend.value}% ${trend.period}`}
            color={getTrendColor()}
            size="small"
          />
        </Stack>
      )}

      {/* Progress Bar */}
      {progress !== undefined && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={600} color="text.primary">
              {progress}%
            </Typography>
          </Stack>
          <ProgressBar 
            variant="determinate" 
            value={progress} 
            color={status}
            sx={{ mb: 1 }}
          />
        </Box>
      )}
    </MetricCard>
  );
};

export default KPIMetricCard;
