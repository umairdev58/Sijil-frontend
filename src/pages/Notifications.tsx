import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  Avatar,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Badge,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Warning,
  Error,
  MoreVert,
  Delete,
  MarkEmailRead,
  Refresh,
} from '@mui/icons-material';
import { Receipt as ReceiptIcon, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { mode } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    refreshNotifications,
    loading 
  } = useNotifications();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return a.timestamp.getTime() - b.timestamp.getTime();
    }
  });

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value as 'all' | 'unread' | 'read');
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as 'newest' | 'oldest');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    handleMenuClose();
  };

  const handleDelete = (notificationId: string) => {
    removeNotification(notificationId);
    handleMenuClose();
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <ReceiptIcon size={20} />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'info':
        return <Users size={20} />;
      case 'error':
        return <Error fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
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

  const getNotificationShadow = (type: string) => {
    switch (type) {
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

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100%',
      background: mode === 'dark' 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      p: 3,
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 48, 
              height: 48, 
              background: mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: mode === 'dark' 
                ? '1px solid rgba(99, 102, 241, 0.3)'
                : '1px solid rgba(99, 102, 241, 0.2)',
            }}>
              <NotificationsIcon sx={{ 
                color: mode === 'dark' ? '#a5b4fc' : '#6366f1',
                fontSize: 24,
              }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                color: mode === 'dark' ? '#f1f5f9' : '#1f2937',
                mb: 0.5,
              }}>
                Notifications
              </Typography>
              <Typography variant="body2" sx={{ 
                color: mode === 'dark' ? 'rgba(241, 245, 249, 0.7)' : 'rgba(30, 41, 59, 0.7)',
              }}>
                Manage your business notifications
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Chip
                  label={`${unreadCount} Unread`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              </Badge>
            )}
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshNotifications}
              disabled={loading}
              sx={{
                borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                color: mode === 'dark' ? '#a5b4fc' : '#6366f1',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)',
                  background: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="contained"
                startIcon={<MarkEmailRead />}
                onClick={markAllAsRead}
                sx={{
                  background: mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)'
                      : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                }}
              >
                Mark All Read
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters and Sort */}
        <Paper sx={{ 
          p: 2, 
          background: mode === 'dark' 
            ? 'rgba(15, 23, 42, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          border: mode === 'dark' 
            ? '1px solid rgba(148, 163, 184, 0.15)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: mode === 'dark' 
            ? '0 8px 24px rgba(0,0,0,0.3)' 
            : '0 8px 24px rgba(0,0,0,0.1)',
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={handleFilterChange}
                sx={{
                  color: mode === 'dark' ? '#f1f5f9' : '#1f2937',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortBy}
                label="Sort"
                onChange={handleSortChange}
                sx={{
                  color: mode === 'dark' ? '#f1f5f9' : '#1f2937',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" sx={{ 
              color: mode === 'dark' ? 'rgba(241, 245, 249, 0.7)' : 'rgba(30, 41, 59, 0.7)',
              ml: 'auto',
            }}>
              {sortedNotifications.length} notification{sortedNotifications.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Notifications List */}
      {sortedNotifications.length === 0 ? (
        <Card sx={{ 
          background: mode === 'dark' 
            ? 'rgba(15, 23, 42, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          border: mode === 'dark' 
            ? '1px solid rgba(148, 163, 184, 0.15)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: mode === 'dark' 
            ? '0 8px 24px rgba(0,0,0,0.3)' 
            : '0 8px 24px rgba(0,0,0,0.1)',
        }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <NotificationsIcon sx={{ 
              fontSize: 64, 
              color: mode === 'dark' ? 'rgba(241, 245, 249, 0.3)' : 'rgba(30, 41, 59, 0.3)',
              mb: 2,
            }} />
            <Typography variant="h6" sx={{ 
              color: mode === 'dark' ? 'rgba(241, 245, 249, 0.7)' : 'rgba(30, 41, 59, 0.7)',
              mb: 1,
            }}>
              No notifications found
            </Typography>
            <Typography variant="body2" sx={{ 
              color: mode === 'dark' ? 'rgba(241, 245, 249, 0.5)' : 'rgba(30, 41, 59, 0.5)',
            }}>
              {filter === 'unread' ? 'All notifications have been read' : 
               filter === 'read' ? 'No read notifications yet' : 
               'No notifications available'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {sortedNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <Card sx={{ 
                mb: 2,
                background: mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.8)' 
                  : 'rgba(255, 255, 255, 0.8)',
                border: mode === 'dark' 
                  ? '1px solid rgba(148, 163, 184, 0.15)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: mode === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.3)' 
                  : '0 8px 24px rgba(0,0,0,0.1)',
                opacity: notification.read ? 0.7 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'dark' 
                    ? '0 12px 32px rgba(0,0,0,0.4)' 
                    : '0 12px 32px rgba(0,0,0,0.15)',
                },
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      background: getNotificationColor(notification.type),
                      boxShadow: getNotificationShadow(notification.type),
                      flexShrink: 0,
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: notification.read ? 500 : 600,
                          color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                          fontSize: '1.1rem',
                        }}>
                          {notification.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {!notification.read && (
                            <Chip
                              label="New"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                          
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, notification.id)}
                            sx={{
                              color: mode === 'dark' ? 'rgba(241, 245, 249, 0.6)' : 'rgba(30, 41, 59, 0.6)',
                              '&:hover': {
                                color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                                background: mode === 'dark' ? 'rgba(241, 245, 249, 0.1)' : 'rgba(30, 41, 59, 0.1)',
                              },
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ 
                        color: mode === 'dark' ? 'rgba(241, 245, 249, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                        mb: 2,
                        lineHeight: 1.5,
                      }}>
                        {notification.message}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ 
                          color: mode === 'dark' ? 'rgba(241, 245, 249, 0.5)' : 'rgba(30, 41, 59, 0.5)',
                        }}>
                          {formatTimeAgo(notification.timestamp)} • {formatDate(notification.timestamp)}
                        </Typography>
                        
                        {notification.actionUrl && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleNotificationClick(notification)}
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
                            {notification.actionText || 'View Details'}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 160,
            boxShadow: mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 2,
            border: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
            background: mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        {selectedNotification && !notifications.find(n => n.id === selectedNotification)?.read && (
          <MenuItem 
            onClick={() => handleMarkAsRead(selectedNotification)}
            sx={{
              color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
              '&:hover': {
                background: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
              },
            }}
          >
            <CheckCircle fontSize="small" sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => selectedNotification && handleDelete(selectedNotification)}
          sx={{
            color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
            '&:hover': {
              background: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            },
          }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Notifications;
