import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  Logout,
  Notifications,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { Receipt as ReceiptIcon, Users } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, refreshNotifications } = useNotifications();

  const currentTitle = useMemo(() => {
    const path = window.location.pathname;
    if (path === '/customer-outstanding') return 'Customer Outstanding';
    if (path === '/daily-ledger') return 'Daily Ledger';
    if (path === '/executive-dashboard') return 'Executive Dashboard';
    if (path.startsWith('/sales')) return 'Sales';
    if (path.startsWith('/purchases')) return 'Purchase';
    if (path.startsWith('/freight-invoices')) return 'Freight';
    if (path.startsWith('/transport-invoices')) return 'Transport';
    if (path.startsWith('/dubai-transport-invoices')) return 'Dubai Transport';
    if (path.startsWith('/dubai-clearance-invoices')) return 'Dubai Clearance';
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/customers') return 'Customers';
    if (path === '/suppliers') return 'Suppliers';
    if (path === '/users') return 'Users';
    if (path === '/statement') return 'Statement';
    return 'Dashboard';
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top App Bar - Modern */}
      <AppBar
        position="fixed"
        sx={{
          width: { 
            xs: '100%', 
            sm: `calc(100% - ${sidebarCollapsed ? 70 : 280}px)` 
          },
          ml: { 
            xs: 0, 
            sm: `${sidebarCollapsed ? 70 : 280}px` 
          },
          bgcolor: mode === 'dark' 
          ? 'rgba(15, 23, 42, 0.95)' 
          : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          height: 70,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        elevation={0}
      >
        <Toolbar sx={{ height: '100%', px: 3 }}>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Sidebar Toggle Button */}
          <IconButton
            color="primary"
            onClick={handleSidebarToggle}
            sx={{ 
              mr: 2, 
              display: { xs: 'none', sm: 'flex' },
              background: 'rgba(139, 92, 246, 0.1)',
              '&:hover': {
                background: 'rgba(139, 92, 246, 0.2)',
              }
            }}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
          
          {/* Page Title */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
            color: mode === 'dark' ? '#f1f5f9' : '#1f2937',
            textShadow: mode === 'dark' 
              ? '0 1px 2px rgba(0,0,0,0.3)' 
              : '0 1px 2px rgba(0,0,0,0.1)',
            }}>
              {currentTitle}
            </Typography>
          <Typography variant="caption" sx={{ 
            color: mode === 'dark' ? 'rgba(241, 245, 249, 0.7)' : 'text.secondary', 
            letterSpacing: 0.5 
          }}>
              Manage your business operations
            </Typography>
          </Box>

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Tooltip title="Notifications" arrow>
            <IconButton 
                onClick={handleNotificationMenuOpen}
              sx={{ 
                  bgcolor: 'rgba(139, 92, 246, 0.1)',
                  '&:hover': { 
                    bgcolor: 'rgba(139, 92, 246, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>
            </Tooltip>
            
            {/* Status Chip */}
            <Chip
              label="Live"
              size="small"
              color="success"
              sx={{ 
                height: 24, 
                fontSize: '0.75rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 1 },
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Component */}
      <Sidebar 
        mobileOpen={mobileOpen}
        onMobileToggle={handleDrawerToggle}
        onProfileMenuOpen={handleProfileMenuOpen}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%', 
            sm: `calc(100vw - ${sidebarCollapsed ? 70 : 280}px)` 
          },
          height: '100vh',
          bgcolor: 'background.default',
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          marginLeft: { sm: `${sidebarCollapsed ? 70 : 280}px` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ height: 70, flexShrink: 0 }} />
        <Box sx={{ 
          flex: 1, 
          p: 3, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}>
          {children}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 3,
            border: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.15)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
            background: mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.98)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            '& .MuiMenuItem-root': {
              color: mode === 'dark' 
                ? 'rgba(241, 245, 249, 0.9)' 
                : 'rgba(30, 41, 59, 0.9)',
              '&:hover': {
                background: mode === 'dark' 
                  ? 'rgba(31, 41, 55, 0.6)' 
                  : 'rgba(229, 231, 235, 0.6)',
                color: mode === 'dark' ? '#ffffff' : '#1e293b',
              },
            },
          }
        }}
      >
        <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5 }}>
          <AccountCircle fontSize="small" sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <Logout fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            maxHeight: 450,
            boxShadow: mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 3,
            border: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
            background: mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: mode === 'dark' ? '#a5b4fc' : '#8b5cf6',
              fontSize: '1.1rem',
            }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Box sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                background: mode === 'dark' 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: mode === 'dark' 
                  ? '1px solid rgba(239, 68, 68, 0.3)' 
                  : '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <Typography variant="caption" sx={{ 
                  color: mode === 'dark' ? '#fca5a5' : '#dc2626',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}>
                  {unreadCount} New
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Notification Items */}
        <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
          {notifications.filter(n => !n.read).length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ 
                color: mode === 'dark' ? 'rgba(241, 245, 249, 0.6)' : 'rgba(30, 41, 59, 0.6)',
                fontStyle: 'italic',
              }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.filter(n => !n.read).slice(0, 10).map((notification, index) => {
              const getNotificationIcon = () => {
                switch (notification.type) {
                  case 'success':
                    return <ReceiptIcon fontSize="small" />;
                  case 'warning':
                    return <Notifications fontSize="small" />;
                  case 'info':
                    return <Users fontSize="small" />;
                  case 'error':
                    return <Notifications fontSize="small" />;
                  default:
                    return <Notifications fontSize="small" />;
                }
              };

              const getNotificationColor = () => {
                switch (notification.type) {
                  case 'success':
                    return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                  case 'warning':
                    return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                  case 'info':
                    return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                  case 'error':
                    return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                  default:
                    return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
                }
              };

              const getNotificationShadow = () => {
                switch (notification.type) {
                  case 'success':
                    return '0 4px 12px rgba(16, 185, 129, 0.3)';
                  case 'warning':
                    return '0 4px 12px rgba(245, 158, 11, 0.3)';
                  case 'info':
                    return '0 4px 12px rgba(59, 130, 246, 0.3)';
                  case 'error':
                    return '0 4px 12px rgba(239, 68, 68, 0.3)';
                  default:
                    return '0 4px 12px rgba(107, 114, 128, 0.3)';
                }
              };

              const getNotificationDotColor = () => {
                switch (notification.type) {
                  case 'success':
                    return '#10b981';
                  case 'warning':
                    return '#f59e0b';
                  case 'info':
                    return '#3b82f6';
                  case 'error':
                    return '#ef4444';
                  default:
                    return '#6b7280';
                }
              };

              const formatTimeAgo = (timestamp: Date) => {
                const now = new Date();
                const diff = now.getTime() - timestamp.getTime();
                const minutes = Math.floor(diff / 60000);
                const hours = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);

                if (minutes < 1) return 'Just now';
                if (minutes < 60) return `${minutes}m ago`;
                if (hours < 24) return `${hours}h ago`;
                return `${days}d ago`;
              };

              return (
                <MenuItem 
                  key={notification.id}
                  sx={{ 
                    py: 2, 
                    px: 2,
                    borderBottom: index < notifications.filter(n => !n.read).slice(0, 10).length - 1 ? (mode === 'dark' 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.05)') : 'none',
                    '&:hover': {
                      background: mode === 'dark' 
                        ? 'rgba(99, 102, 241, 0.1)' 
                        : 'rgba(99, 102, 241, 0.05)',
                    },
                    transition: 'all 0.2s ease',
                    opacity: notification.read ? 0.7 : 1,
                  }}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                      handleNotificationMenuClose();
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Avatar sx={{ 
                      width: 36, 
                      height: 36, 
                      background: getNotificationColor(),
                      boxShadow: getNotificationShadow(),
                    }}>
                      {getNotificationIcon()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: notification.read ? 500 : 600,
                        color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                        mb: 0.5,
                      }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: mode === 'dark' ? 'rgba(241, 245, 249, 0.7)' : 'rgba(30, 41, 59, 0.7)',
                        display: 'block',
                        mb: 0.5,
                      }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: mode === 'dark' ? 'rgba(241, 245, 249, 0.5)' : 'rgba(30, 41, 59, 0.5)',
                        fontSize: '0.7rem',
                      }}>
                        {formatTimeAgo(notification.timestamp)}
                      </Typography>
                    </Box>
                    {!notification.read && (
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: getNotificationDotColor(),
                        boxShadow: `0 0 8px ${getNotificationDotColor()}50`,
                      }} />
                    )}
                  </Box>
                </MenuItem>
              );
            })
          )}
        </Box>

        {/* Footer */}
        {notifications.filter(n => !n.read).length > 0 && (
          <Box sx={{ 
            p: 2, 
            borderTop: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
            background: mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.5)' 
              : 'rgba(248, 250, 252, 0.5)',
          }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                size="small"
                variant="text"
                onClick={refreshNotifications}
                sx={{
                  color: mode === 'dark' ? '#8b5cf6' : '#6366f1',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '&:hover': {
                    color: mode === 'dark' ? '#a5b4fc' : '#4f46e5',
                    background: mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  variant="text"
                  onClick={markAllAsRead}
                  sx={{
                    color: mode === 'dark' ? '#8b5cf6' : '#6366f1',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': {
                      color: mode === 'dark' ? '#a5b4fc' : '#4f46e5',
                      background: mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    },
                  }}
                >
                  Mark All Read
                </Button>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  navigate('/notifications');
                  handleNotificationMenuClose();
                }}
                sx={{
                  color: mode === 'dark' ? '#8b5cf6' : '#6366f1',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '&:hover': {
                    color: mode === 'dark' ? '#a5b4fc' : '#4f46e5',
                    background: mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                View All
              </Button>
            </Box>
          </Box>
        )}
      </Menu>
    </Box>
  );
}; 