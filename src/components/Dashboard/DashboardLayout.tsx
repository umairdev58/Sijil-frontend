import React, { ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardHeader = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(3, 4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  },
}));

// Unused component - commented out
// const MetricCard = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(3.5),
//   borderRadius: theme.spacing(2.5),
//   background: theme.palette.mode === 'dark' 
//     ? alpha(theme.palette.background.paper, 0.9)
//     : theme.palette.background.paper,
//   border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
//   boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.08)}`,
//   transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//   '&:hover': {
//     transform: 'translateY(-6px)',
//     boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
//   },
// }));

const NavigationChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(0.5, 1),
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.2),
    transform: 'scale(1.05)',
  },
  transition: 'all 0.2s ease',
}));

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>
      {/* Premium Header */}
      <DashboardHeader elevation={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Navigation Chips */}
            <NavigationChip
              icon={<DashboardIcon />}
              label="Overview"
              clickable
            />
            <NavigationChip
              icon={<AnalyticsIcon />}
              label="Analytics"
              clickable
            />
            <NavigationChip
              icon={<AssessmentIcon />}
              label="Reports"
              clickable
            />
            <NavigationChip
              icon={<TrendingUpIcon />}
              label="Trends"
              clickable
            />
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, opacity: 0.3 }} />
            
            {/* Action Buttons */}
            <IconButton sx={{ color: 'white', opacity: 0.8 }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton sx={{ color: 'white', opacity: 0.8 }}>
              <SettingsIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2) }}>
              <PersonIcon />
            </Avatar>
          </Stack>
        </Stack>
      </DashboardHeader>

      {/* Main Content */}
      <Box sx={{ px: 4, pb: 4 }}>
        
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
