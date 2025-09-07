import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const SkeletonContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const TableSkeleton = styled(Box)(({ theme }) => ({
  '& .MuiSkeleton-root': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
  },
}));

const CardSkeleton = styled(Box)(({ theme }) => ({
  '& .MuiSkeleton-root': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
  },
}));

interface SkeletonLoaderProps {
  variant: 'table' | 'card' | 'list' | 'form' | 'chart' | 'custom';
  rows?: number;
  columns?: number;
  height?: number | string;
  width?: number | string;
  showHeader?: boolean;
  showAvatar?: boolean;
  showText?: boolean;
  showImage?: boolean;
  customLayout?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  rows = 5,
  columns = 1,
  height = 60,
  width = '100%',
  showHeader = true,
  showAvatar = false,
  showText = true,
  showImage = false,
  customLayout,
}) => {
  const theme = useTheme();

  const renderTableSkeleton = () => (
    <TableSkeleton>
      {showHeader && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2 }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              variant="rectangular"
              width={`${100 / columns}%`}
              height={40}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={`row-${rowIndex}`} sx={{ display: 'flex', gap: 2, mb: 1, p: 2 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="rectangular"
              width={`${100 / columns}%`}
              height={height}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      ))}
    </TableSkeleton>
  );

  const renderCardSkeleton = () => (
    <CardSkeleton>
      <Box sx={{ p: 2 }}>
        {showAvatar && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Box>
        )}
        {showImage && (
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        )}
        {showText && (
          <>
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="90%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={16} />
          </>
        )}
      </Box>
    </CardSkeleton>
  );

  const renderListSkeleton = () => (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 1 }}>
          {showAvatar && (
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );

  const renderFormSkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Skeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={48} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );

  const renderChartSkeleton = () => (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="circular" width={12} height={12} />
        ))}
      </Box>
    </Box>
  );

  const renderCustomSkeleton = () => (
    <SkeletonContainer>
      {customLayout || (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{ borderRadius: 1 }}
        />
      )}
    </SkeletonContainer>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'table':
        return renderTableSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'chart':
        return renderChartSkeleton();
      case 'custom':
        return renderCustomSkeleton();
      default:
        return renderCustomSkeleton();
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader;
