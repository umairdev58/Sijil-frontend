import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Chip,
  Collapse,
  TextField,
  InputAdornment,
  Tooltip,
  Fade,
  Slide,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Settings,
  Logout,
  Notifications,
  ExpandMore,
  ExpandLess,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import ThemeToggle from '../ThemeToggle';
import { LayoutDashboard, Users, Building2, User as UserIcon, Receipt as ReceiptIcon, Boxes, BarChart3, Plus, ShoppingCart as CartIcon, ShoppingBag, BookOpen, Truck, Ship, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useSidebarScrollbar } from '../../hooks/useSidebarScrollbar';
import logo from '../../assets/Sijil.jpg';

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

interface AppLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { text: 'Executive Dashboard', icon: <BarChart3 size={20} />, path: '/executive-dashboard' },
  { text: 'Customers', icon: <Users size={20} />, path: '/customers' },
  { text: 'Suppliers', icon: <Building2 size={20} />, path: '/suppliers' },
  { text: 'Users', icon: <UserIcon size={20} />, path: '/users' },
  { text: 'Daily Ledger', icon: <BookOpen size={20} />, path: '/daily-ledger' },
  { text: 'Statement', icon: <FileText size={20} />, path: '/statement' },
];

const salesItems = [
  { text: 'All Sales', path: '/sales', icon: <ReceiptIcon size={18} /> },
  { text: 'New Sale', path: '/sales/new', icon: <Plus size={18} /> },
  { text: 'Sales Report', path: '/sales-report', icon: <BarChart3 size={18} /> },
  { text: 'Customer Outstanding', path: '/customer-outstanding', icon: <ReceiptIcon size={18} />, badge: 5 },
];

const purchaseItems = [
  { text: 'All Purchases', path: '/purchases', icon: <Boxes size={18} /> },
  { text: 'New Purchase', path: '/purchases/new', icon: <Plus size={18} /> },
  { text: 'Purchase Report', path: '/purchase-report', icon: <BarChart3 size={18} /> },
];

const freightItems = [
  { text: 'All Freight Invoices', path: '/freight-invoices', icon: <Ship size={18} /> },
  { text: 'New Freight Invoice', path: '/freight-invoices/new', icon: <Plus size={18} /> },
];

const transportItems = [
  { text: 'All Transport Invoices', path: '/transport-invoices', icon: <Truck size={18} /> },
  { text: 'New Transport Invoice', path: '/transport-invoices/new', icon: <Plus size={18} /> },
];

const dubaiTransportItems = [
  { text: 'All Dubai Transport Invoices', path: '/dubai-transport-invoices', icon: <Truck size={18} /> },
  { text: 'New Dubai Transport Invoice', path: '/dubai-transport-invoices/new', icon: <Plus size={18} /> },
];

const dubaiClearanceItems = [
  { text: 'All Dubai Clearance Invoices', path: '/dubai-clearance-invoices', icon: <Ship size={18} /> },
  { text: 'New Dubai Clearance Invoice', path: '/dubai-clearance-invoices/new', icon: <Plus size={18} /> },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  
  // Use the sidebar scrollbar hook to manage scrollbar visibility
  useSidebarScrollbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [salesPopupAnchor, setSalesPopupAnchor] = useState<null | HTMLElement>(null);
  const [purchasesPopupAnchor, setPurchasesPopupAnchor] = useState<null | HTMLElement>(null);
  const [freightPopupAnchor, setFreightPopupAnchor] = useState<null | HTMLElement>(null);
  const [transportPopupAnchor, setTransportPopupAnchor] = useState<null | HTMLElement>(null);
  const [dubaiTransportPopupAnchor, setDubaiTransportPopupAnchor] = useState<null | HTMLElement>(null);
  const [dubaiClearancePopupAnchor, setDubaiClearancePopupAnchor] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSales, setOpenSales] = useState(location.pathname.startsWith('/sales'));
  const [openPurchases, setOpenPurchases] = useState(location.pathname.startsWith('/purchases'));
  const [openFreight, setOpenFreight] = useState(location.pathname.startsWith('/freight-invoices'));
  const [openTransport, setOpenTransport] = useState(location.pathname.startsWith('/transport-invoices'));
  const [openDubaiTransport, setOpenDubaiTransport] = useState(location.pathname.startsWith('/dubai-transport-invoices'));
  const [openDubaiClearance, setOpenDubaiClearance] = useState(location.pathname.startsWith('/dubai-clearance-invoices'));

  const currentTitle = useMemo(() => {
    if (location.pathname === '/customer-outstanding') return 'Customer Outstanding';
    if (location.pathname === '/daily-ledger') return 'Daily Ledger';
    if (location.pathname === '/executive-dashboard') return 'Executive Dashboard';
    if (location.pathname.startsWith('/sales')) return 'Sales';
    if (location.pathname.startsWith('/purchases')) return 'Purchase';
    if (location.pathname.startsWith('/freight-invoices')) return 'Freight';
    if (location.pathname.startsWith('/transport-invoices')) return 'Transport';
    if (location.pathname.startsWith('/dubai-transport-invoices')) return 'Dubai Transport';
    if (location.pathname.startsWith('/dubai-clearance-invoices')) return 'Dubai Clearance';
    const found = menuItems.find(item => item.path === location.pathname);
    return found?.text || 'Dashboard';
  }, [location.pathname]);

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

  const handleSalesPopupOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (sidebarCollapsed) {
      setSalesPopupAnchor(event.currentTarget);
    } else {
      setOpenSales(!openSales);
    }
  };

  const handleSalesPopupClose = () => {
    setSalesPopupAnchor(null);
  };

  const handlePurchasesPopupOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (sidebarCollapsed) {
      setPurchasesPopupAnchor(event.currentTarget);
    } else {
      setOpenPurchases(!openPurchases);
    }
  };

  const handlePurchasesPopupClose = () => {
    setPurchasesPopupAnchor(null);
  };

  const handleFreightPopupOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (sidebarCollapsed) {
      setFreightPopupAnchor(event.currentTarget);
    } else {
      setOpenFreight(!openFreight);
    }
  };

  const handleFreightPopupClose = () => {
    setFreightPopupAnchor(null);
  };

  const handleTransportPopupOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (sidebarCollapsed) {
      setTransportPopupAnchor(event.currentTarget);
    } else {
      setOpenTransport(!openTransport);
    }
  };

  const handleTransportPopupClose = () => {
    setTransportPopupAnchor(null);
  };

  const handleDubaiTransportPopupOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (sidebarCollapsed) {
      setDubaiTransportPopupAnchor(event.currentTarget);
    } else {
      setOpenDubaiTransport(!openDubaiTransport);
    }
  };

  const handleDubaiTransportPopupClose = () => {
    setDubaiTransportPopupAnchor(null);
  };

  const handleDubaiClearancePopupOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (sidebarCollapsed) {
      setDubaiClearancePopupAnchor(event.currentTarget);
    } else {
      setOpenDubaiClearance(!openDubaiClearance);
    }
  };

  const handleDubaiClearancePopupClose = () => {
    setDubaiClearancePopupAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isSelected = (path: string) => location.pathname === path;

  const drawer = (
      <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      background: mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
        : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%)',
      backdropFilter: 'blur(20px)',
              borderRight: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}>
      {/* Glass overlay effect */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
        left: 0,
          right: 0, 
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none',
      }} />

      {/* Sidebar Header */}
      <Box sx={{ 
        p: 1, 
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        borderBottom: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -50, 
          right: -50, 
          width: 100, 
          height: 100, 
          background: mode === 'dark' 
            ? 'rgba(168, 85, 247, 0.15)' 
            : 'rgba(139, 92, 246, 0.1)', 
          borderRadius: '50%', 
          filter: 'blur(20px)',
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -30, 
          left: -30, 
          width: 60, 
          height: 60, 
          background: mode === 'dark' 
            ? 'rgba(59, 130, 246, 0.15)' 
            : 'rgba(99, 102, 241, 0.1)', 
          borderRadius: '50%', 
          filter: 'blur(15px)',
        }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.3)' 
              : '0 8px 32px rgba(0,0,0,0.1)',
            border: mode === 'dark' 
              ? '2px solid rgba(168, 85, 247, 0.3)' 
              : '2px solid rgba(139, 92, 246, 0.2)',
            background: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
          }}>
            <img 
              src={logo} 
              alt="Sijil Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
          </Box>
          {!sidebarCollapsed && (
            <Fade in={!sidebarCollapsed} timeout={300}>
          <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 800, 
                  letterSpacing: 0.5,
                  color: mode === 'dark' ? '#ffffff' : '#1e293b',
                  textShadow: mode === 'dark' 
                    ? '0 2px 4px rgba(0,0,0,0.3)' 
                    : '0 1px 2px rgba(0,0,0,0.1)',
                }}>
              Sijil
            </Typography>
                <Typography variant="caption" sx={{ 
                  opacity: 0.9, 
                  letterSpacing: 0.5,
                  color: mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.8)' 
                    : 'rgba(30, 41, 59, 0.7)',
                }}>
              Accounting System
            </Typography>
          </Box>
            </Fade>
          )}
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ 
        flex: 1, 
        p: 2, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        {!sidebarCollapsed && (
          <Fade in={!sidebarCollapsed} timeout={300}>
            <Typography variant="overline" sx={{ 
              px: 2, 
              py: 1, 
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)', 
              fontWeight: 600, 
              letterSpacing: 1, 
              flexShrink: 0,
              textShadow: mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
            }}>
          Navigation
        </Typography>
          </Fade>
        )}
        
        <List sx={{ 
          mt: 1, 
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(168, 85, 247, 0.3)',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(168, 85, 247, 0.5)',
          },
        }}>
          {/* Main Menu Items */}
          {menuItems.map((item) => {
            const selected = isSelected(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <Tooltip 
                  title={sidebarCollapsed ? item.text : ''} 
                  placement="right"
                  arrow
                >
                <Box>
                <ListItemButton
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    mx: 0.5,
                    py: 2,
                      px: sidebarCollapsed ? 1 : 3,
                      minHeight: 44,
                    transition: 'all 0.2s ease',
                    background: selected 
                        ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') 
                      : 'transparent',
                      color: selected 
                        ? '#ffffff' 
                        : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                    fontWeight: selected ? 600 : 500,
                      border: '1px solid transparent',
                    '&:hover': {
                        background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit', 
                    minWidth: sidebarCollapsed ? 32 : 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    '& .MuiSvgIcon-root, & svg': { fontSize: 20 }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                    {!sidebarCollapsed && (
                      <Fade in={!sidebarCollapsed} timeout={150}>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '.MuiTypography-root': { 
                        fontWeight: selected ? 600 : 500, 
                        fontSize: 14 
                      } 
                    }} 
                  />
                      </Fade>
                    )}
                </ListItemButton>
                </Box>
                </Tooltip>
              </ListItem>
            );
          })}

          {/* Sales Section */}
          {!sidebarCollapsed && (
            <Fade in={!sidebarCollapsed} timeout={300}>
                          <Typography variant="overline" sx={{ 
              px: 3, 
              py: 0.5, 
              mt: 1,
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)', 
              fontWeight: 600, 
              letterSpacing: 1,
              textShadow: mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
            }}>
              Sales
            </Typography>
            </Fade>
          )}
          
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip 
              title={sidebarCollapsed ? 'Sales' : ''} 
              placement="right"
              arrow
            >
            <Box>
            <ListItemButton
              onClick={handleSalesPopupOpen}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                py: 2,
                  px: sidebarCollapsed ? 1 : 3,
                  minHeight: 44,
                  transition: 'all 0.2s ease',
                  background: openSales 
                    ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') 
                    : 'transparent',
                  color: openSales 
                    ? '#ffffff' 
                    : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                  fontWeight: openSales ? 600 : 500,
                  border: '1px solid transparent',
                  '&:hover': {
                    background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: sidebarCollapsed ? 32 : 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  '& .MuiSvgIcon-root, & svg': { fontSize: 20 }
                }}>
                <CartIcon size={20} />
              </ListItemIcon>
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
              <ListItemText primary="Sales" />
                  </Fade>
                )}
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
              {openSales ? <ExpandLess /> : <ExpandMore />}
                  </Fade>
                )}
            </ListItemButton>
            </Box>
            </Tooltip>
          </ListItem>
          
          {/* Sales Popup Menu for Collapsed Sidebar */}
          <Menu
            anchorEl={salesPopupAnchor}
            open={Boolean(salesPopupAnchor)}
            onClose={handleSalesPopupClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                ml: 1,
                minWidth: 200,
                background: mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.98)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: mode === 'dark' 
                    ? 'rgba(241, 245, 249, 0.9)' 
                    : 'rgba(30, 41, 59, 0.9)',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.6)' 
                      : 'rgba(229, 231, 235, 0.6)',
                    color: mode === 'dark' ? '#ffffff' : '#1e293b',
                  },
                  '&.Mui-selected': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.9)' 
                      : 'rgba(229, 231, 235, 0.9)',
                    color: '#ffffff',
                  },
                },
              },
            }}
          >
            {salesItems.map((item) => {
              const selected = isSelected(item.path);
              return (
                <MenuItem
                  key={item.text}
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    handleSalesPopupClose();
                    setMobileOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <Box sx={{ 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                  {item.badge && (
                    <Badge 
                      badgeContent={item.badge} 
                      color="error" 
                      sx={{ 
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                        }
                      }}
                    />
                  )}
                </MenuItem>
              );
            })}
          </Menu>
          
          <Collapse in={openSales && !sidebarCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ 
              '& .MuiListItem-root': { 
                padding: 0,
                margin: '1px 0'
              },
              '& .MuiListItemButton-root': {
                paddingLeft: 6,
                paddingY: 1.5,
                marginX: 0.5,
                borderRadius: 2,
                background: 'transparent',
                border: '1px solid transparent',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                }
              }
            }}>
              {salesItems.map((sub) => {
                const selected = isSelected(sub.path);
                return (
                  <ListItem key={sub.text} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => {
                        navigate(sub.path);
                        setMobileOpen(false);
                      }}
                      sx={{ 
                        pl: 6, 
                        py: 1.5, 
                        mx: 0.5, 
                        borderRadius: 2,
                        color: selected 
                          ? '#ffffff' 
                          : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                        background: selected ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') : 'transparent',
                        border: '1px solid transparent',
                        '&:hover': {
                          background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'inherit', 
                        minWidth: 32,
                        '& .MuiSvgIcon-root': { fontSize: 18 }
                      }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                      {sub.badge && (
                        <Badge 
                          badgeContent={sub.badge} 
                          color="error" 
                          sx={{ 
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              height: 18,
                              minWidth: 18,
                            }
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          {/* Purchases Section */}
          {!sidebarCollapsed && (
            <Fade in={!sidebarCollapsed} timeout={300}>
                          <Typography variant="overline" sx={{ 
              px: 3, 
              py: 0.5, 
              mt: 1,
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)', 
              fontWeight: 600, 
              letterSpacing: 1,
              textShadow: mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
            }}>
              Purchases
            </Typography>
            </Fade>
          )}
          
          <ListItem disablePadding sx={{ mb: 0.5, mt: 0.5 }}>
            <Tooltip 
              title={sidebarCollapsed ? 'Purchases' : ''} 
              placement="right"
              arrow
            >
            <Box>
            <ListItemButton
              onClick={handlePurchasesPopupOpen}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                py: 2,
                  px: sidebarCollapsed ? 1 : 3,
                  minHeight: 44,
                  transition: 'all 0.2s ease',
                  background: openPurchases 
                    ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') 
                    : 'transparent',
                  color: openPurchases 
                    ? '#ffffff' 
                    : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                  fontWeight: openPurchases ? 600 : 500,
                  border: '1px solid transparent',
                  '&:hover': {
                    background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: sidebarCollapsed ? 32 : 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  '& .MuiSvgIcon-root, & svg': { fontSize: 20 }
                }}>
                <ShoppingBag size={20} />
              </ListItemIcon>
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
                    <ListItemText primary="Purchases" />
                  </Fade>
                )}
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
              {openPurchases ? <ExpandLess /> : <ExpandMore />}
                  </Fade>
                )}
            </ListItemButton>
            </Box>
            </Tooltip>
          </ListItem>
          
          {/* Purchases Popup Menu for Collapsed Sidebar */}
          <Menu
            anchorEl={purchasesPopupAnchor}
            open={Boolean(purchasesPopupAnchor)}
            onClose={handlePurchasesPopupClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                ml: 1,
                minWidth: 200,
                background: mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.98)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: mode === 'dark' 
                    ? 'rgba(241, 245, 249, 0.9)' 
                    : 'rgba(30, 41, 59, 0.9)',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.6)' 
                      : 'rgba(229, 231, 235, 0.6)',
                    color: mode === 'dark' ? '#ffffff' : '#1e293b',
                  },
                  '&.Mui-selected': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.9)' 
                      : 'rgba(229, 231, 235, 0.9)',
                    color: '#ffffff',
                  },
                },
              },
            }}
          >
            {purchaseItems.map((item) => {
              const selected = isSelected(item.path);
              return (
                <MenuItem
                  key={item.text}
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    handlePurchasesPopupClose();
                    setMobileOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <Box sx={{ 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
          
          <Collapse in={openPurchases && !sidebarCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ 
              '& .MuiListItem-root': { 
                padding: 0,
                margin: '1px 0'
              },
              '& .MuiListItemButton-root': {
                paddingLeft: 6,
                paddingY: 1.5,
                marginX: 0.5,
                borderRadius: 2,
                background: 'transparent',
                border: '1px solid transparent',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                }
              }
            }}>
              {purchaseItems.map((sub) => {
                const selected = isSelected(sub.path);
                return (
                  <ListItem key={sub.text} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => {
                        navigate(sub.path);
                        setMobileOpen(false);
                      }}
                      sx={{ 
                        pl: 6, 
                        py: 1.5, 
                        mx: 0.5, 
                        borderRadius: 2,
                        color: selected 
                          ? '#ffffff' 
                          : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                        background: selected ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') : 'transparent',
                        border: '1px solid transparent',
                        '&:hover': {
                          background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'inherit', 
                        minWidth: 32,
                        '& .MuiSvgIcon-root': { fontSize: 18 }
                      }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          {/* Freight Section */}
          {!sidebarCollapsed && (
            <Fade in={!sidebarCollapsed} timeout={300}>
              <Typography variant="overline" sx={{ 
                px: 3, 
                py: 0.5, 
                mt: 1,
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)', 
                fontWeight: 600, 
                letterSpacing: 1,
                textShadow: mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              }}>
                Freight
              </Typography>
            </Fade>
          )}
          
          <ListItem disablePadding sx={{ mb: 0.5, mt: 0.5 }}>
            <Tooltip 
              title={sidebarCollapsed ? 'Freight' : ''} 
              placement="right"
              arrow
            >
            <Box>
            <ListItemButton
              onClick={handleFreightPopupOpen}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                py: 2,
                  px: sidebarCollapsed ? 1 : 3,
                  minHeight: 44,
                  transition: 'all 0.2s ease',
                  background: openFreight 
                    ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') 
                    : 'transparent',
                  color: openFreight 
                    ? '#ffffff' 
                    : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                  fontWeight: openFreight ? 600 : 500,
                  border: '1px solid transparent',
                  '&:hover': {
                    background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: sidebarCollapsed ? 32 : 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  '& .MuiSvgIcon-root, & svg': { fontSize: 20 }
                }}>
                <Ship size={20} />
              </ListItemIcon>
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
                    <ListItemText primary="Freight" />
                  </Fade>
                )}
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
              {openFreight ? <ExpandLess /> : <ExpandMore />}
                  </Fade>
                )}
            </ListItemButton>
            </Box>
            </Tooltip>
          </ListItem>
          
          {/* Freight Popup Menu for Collapsed Sidebar */}
          <Menu
            anchorEl={freightPopupAnchor}
            open={Boolean(freightPopupAnchor)}
            onClose={handleFreightPopupClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                ml: 1,
                minWidth: 200,
                background: mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.98)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: mode === 'dark' 
                    ? 'rgba(241, 245, 249, 0.9)' 
                    : 'rgba(30, 41, 59, 0.9)',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.6)' 
                      : 'rgba(229, 231, 235, 0.6)',
                    color: mode === 'dark' ? '#ffffff' : '#1e293b',
                  },
                  '&.Mui-selected': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.9)' 
                      : 'rgba(229, 231, 235, 0.9)',
                    color: '#ffffff',
                  },
                },
              },
            }}
          >
            {freightItems.map((item) => {
              const selected = isSelected(item.path);
              return (
                <MenuItem
                  key={item.text}
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    handleFreightPopupClose();
                    setMobileOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <Box sx={{ 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
          
          <Collapse in={openFreight && !sidebarCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ 
              '& .MuiListItem-root': { 
                padding: 0,
                margin: '1px 0'
              },
              '& .MuiListItemButton-root': {
                paddingLeft: 6,
                paddingY: 1.5,
                marginX: 0.5,
                borderRadius: 2,
                background: 'transparent',
                border: '1px solid transparent',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                }
              }
            }}>
              {freightItems.map((sub) => {
                const selected = isSelected(sub.path);
                return (
                  <ListItem key={sub.text} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => {
                        navigate(sub.path);
                        setMobileOpen(false);
                      }}
                      sx={{ 
                        pl: 6, 
                        py: 1.5, 
                        mx: 0.5, 
                        borderRadius: 2,
                        color: selected 
                          ? '#ffffff' 
                          : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                        background: selected ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') : 'transparent',
                        border: '1px solid transparent',
                        '&:hover': {
                          background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'inherit', 
                        minWidth: 32,
                        '& .MuiSvgIcon-root': { fontSize: 18 }
                      }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          {/* Transport Section */}
          {!sidebarCollapsed && (
            <Fade in={!sidebarCollapsed} timeout={300}>
              <Typography variant="overline" sx={{ 
                px: 3, 
                py: 0.5, 
                mt: 1,
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)', 
                fontWeight: 600, 
                letterSpacing: 1,
                textShadow: mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              }}>
                Transport
              </Typography>
            </Fade>
          )}
          
          <ListItem disablePadding sx={{ mb: 0.5, mt: 0.5 }}>
            <Tooltip 
              title={sidebarCollapsed ? 'Transport' : ''} 
              placement="right"
              arrow
            >
            <Box>
            <ListItemButton
              onClick={handleTransportPopupOpen}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                py: 2,
                  px: sidebarCollapsed ? 1 : 3,
                  minHeight: 44,
                  transition: 'all 0.2s ease',
                  background: openTransport 
                    ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') 
                    : 'transparent',
                  color: openTransport 
                    ? '#ffffff' 
                    : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                  fontWeight: openTransport ? 600 : 500,
                  border: '1px solid transparent',
                  '&:hover': {
                    background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: sidebarCollapsed ? 32 : 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  '& .MuiSvgIcon-root, & svg': { fontSize: 20 }
                }}>
                <Truck size={20} />
              </ListItemIcon>
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
                    <ListItemText primary="Transport" />
                  </Fade>
                )}
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
              {openTransport ? <ExpandLess /> : <ExpandMore />}
                  </Fade>
                )}
            </ListItemButton>
            </Box>
            </Tooltip>
          </ListItem>
          
          {/* Transport Popup Menu for Collapsed Sidebar */}
          <Menu
            anchorEl={transportPopupAnchor}
            open={Boolean(transportPopupAnchor)}
            onClose={handleTransportPopupClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                ml: 1,
                minWidth: 200,
                background: mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.98)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: mode === 'dark' 
                    ? 'rgba(241, 245, 249, 0.9)' 
                    : 'rgba(30, 41, 59, 0.9)',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.6)' 
                      : 'rgba(229, 231, 235, 0.6)',
                    color: mode === 'dark' ? '#ffffff' : '#1e293b',
                  },
                  '&.Mui-selected': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.9)' 
                      : 'rgba(229, 231, 235, 0.9)',
                    color: '#ffffff',
                  },
                },
              },
            }}
          >
            {transportItems.map((item) => {
              const selected = isSelected(item.path);
              return (
                <MenuItem
                  key={item.text}
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    handleTransportPopupClose();
                    setMobileOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <Box sx={{ 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
          
          <Collapse in={openTransport && !sidebarCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ 
              '& .MuiListItem-root': { 
                padding: 0,
                margin: '1px 0'
              },
              '& .MuiListItemButton-root': {
                paddingLeft: 6,
                paddingY: 1.5,
                marginX: 0.5,
                borderRadius: 2,
                background: 'transparent',
                border: '1px solid transparent',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                }
              }
            }}>
              {transportItems.map((sub) => {
                const selected = isSelected(sub.path);
                return (
                  <ListItem key={sub.text} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => {
                        navigate(sub.path);
                        setMobileOpen(false);
                      }}
                      sx={{ 
                        pl: 6, 
                        py: 1.5, 
                        mx: 0.5, 
                        borderRadius: 2,
                        color: selected 
                          ? '#ffffff' 
                          : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                        background: selected ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') : 'transparent',
                        border: '1px solid transparent',
                        '&:hover': {
                          background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'inherit', 
                        minWidth: 32,
                        '& .MuiSvgIcon-root': { fontSize: 18 }
                      }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          {/* Dubai Transport Section */}
          {!sidebarCollapsed && (
            <Fade in={!sidebarCollapsed} timeout={300}>
              <Typography variant="overline" sx={{ 
                px: 3, 
                py: 0.5, 
                mt: 1,
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)', 
                fontWeight: 600, 
                letterSpacing: 1,
                textShadow: mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              }}>
                Dubai Transport
              </Typography>
            </Fade>
          )}
          
          <ListItem disablePadding sx={{ mb: 0.5, mt: 0.5 }}>
            <Tooltip 
              title={sidebarCollapsed ? 'Dubai Transport' : ''} 
              placement="right"
              arrow
            >
            <Box>
            <ListItemButton
              onClick={handleDubaiTransportPopupOpen}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                py: 2,
                  px: sidebarCollapsed ? 1 : 3,
                  minHeight: 44,
                  transition: 'all 0.2s ease',
                  background: openDubaiTransport 
                    ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') 
                    : 'transparent',
                  color: openDubaiTransport 
                    ? '#ffffff' 
                    : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                  fontWeight: openDubaiTransport ? 600 : 500,
                  border: '1px solid transparent',
                  '&:hover': {
                    background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: sidebarCollapsed ? 32 : 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  '& .MuiSvgIcon-root, & svg': { fontSize: 20 }
                }}>
                <Truck size={20} />
              </ListItemIcon>
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
                    <ListItemText primary="Dubai Transport" />
                  </Fade>
                )}
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
              {openDubaiTransport ? <ExpandLess /> : <ExpandMore />}
                  </Fade>
                )}
            </ListItemButton>
            </Box>
            </Tooltip>
          </ListItem>
          
          {/* Dubai Transport Popup Menu for Collapsed Sidebar */}
          <Menu
            anchorEl={dubaiTransportPopupAnchor}
            open={Boolean(dubaiTransportPopupAnchor)}
            onClose={handleDubaiTransportPopupClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                ml: 1,
                minWidth: 200,
                background: mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.98)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: mode === 'dark' 
                    ? 'rgba(241, 245, 249, 0.9)' 
                    : 'rgba(30, 41, 59, 0.9)',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.6)' 
                      : 'rgba(229, 231, 235, 0.6)',
                    color: mode === 'dark' ? '#ffffff' : '#1e293b',
                  },
                  '&.Mui-selected': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.9)' 
                      : 'rgba(229, 231, 235, 0.9)',
                    color: '#ffffff',
                  },
                },
              },
            }}
          >
            {dubaiTransportItems.map((item) => {
              const selected = isSelected(item.path);
              return (
                <MenuItem
                  key={item.text}
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    handleDubaiTransportPopupClose();
                    setMobileOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <Box sx={{ 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
          
          <Collapse in={openDubaiTransport && !sidebarCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ 
              '& .MuiListItem-root': { 
                padding: 0,
                margin: '1px 0'
              },
              '& .MuiListItemButton-root': {
                paddingLeft: 6,
                paddingY: 1.5,
                marginX: 0.5,
                borderRadius: 2,
                background: 'transparent',
                border: '1px solid transparent',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                }
              }
            }}>
              {dubaiTransportItems.map((sub) => {
                const selected = isSelected(sub.path);
                return (
                  <ListItem key={sub.text} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => {
                        navigate(sub.path);
                        setMobileOpen(false);
                      }}
                      sx={{ 
                        pl: 6, 
                        py: 1.5, 
                        mx: 0.5, 
                        borderRadius: 2,
                        color: selected 
                          ? '#ffffff' 
                          : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                        background: selected ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') : 'transparent',
                        border: '1px solid transparent',
                        '&:hover': {
                          background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'inherit', 
                        minWidth: 32,
                        '& .MuiSvgIcon-root': { fontSize: 18 }
                      }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          {/* Dubai Clearance Section */}
          {!sidebarCollapsed && (
            <Fade in={!sidebarCollapsed} timeout={300}>
              <Typography variant="overline" sx={{ 
                px: 3, 
                py: 0.5, 
                mt: 1,
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)', 
                fontWeight: 600, 
                letterSpacing: 1,
                textShadow: mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
              }}>
                Dubai Clearance
              </Typography>
            </Fade>
          )}
          
          <ListItem disablePadding sx={{ mb: 0.5, mt: 0.5 }}>
            <Tooltip 
              title={sidebarCollapsed ? 'Dubai Clearance' : ''} 
              placement="right"
              arrow
            >
            <Box>
            <ListItemButton
              onClick={handleDubaiClearancePopupOpen}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                py: 2,
                  px: sidebarCollapsed ? 1 : 3,
                  minHeight: 44,
                  transition: 'all 0.2s ease',
                  background: openDubaiClearance 
                    ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') 
                    : 'transparent',
                  color: openDubaiClearance 
                    ? '#ffffff' 
                    : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                  fontWeight: openDubaiClearance ? 600 : 500,
                  border: '1px solid transparent',
                  '&:hover': {
                    background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: sidebarCollapsed ? 32 : 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                  '& .MuiSvgIcon-root, & svg': { fontSize: 20 }
                }}>
                <Ship size={20} />
              </ListItemIcon>
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
                    <ListItemText primary="Dubai Clearance" />
                  </Fade>
                )}
                {!sidebarCollapsed && (
                  <Fade in={!sidebarCollapsed} timeout={300}>
              {openDubaiClearance ? <ExpandLess /> : <ExpandMore />}
                  </Fade>
                )}
            </ListItemButton>
            </Box>
            </Tooltip>
          </ListItem>
          
          {/* Dubai Clearance Popup Menu for Collapsed Sidebar */}
          <Menu
            anchorEl={dubaiClearancePopupAnchor}
            open={Boolean(dubaiClearancePopupAnchor)}
            onClose={handleDubaiClearancePopupClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                ml: 1,
                minWidth: 200,
                background: mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.98)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: mode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.15)' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: mode === 'dark' 
                    ? 'rgba(241, 245, 249, 0.9)' 
                    : 'rgba(30, 41, 59, 0.9)',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.6)' 
                      : 'rgba(229, 231, 235, 0.6)',
                    color: mode === 'dark' ? '#ffffff' : '#1e293b',
                  },
                  '&.Mui-selected': {
                    background: mode === 'dark' 
                      ? 'rgba(31, 41, 55, 0.9)' 
                      : 'rgba(229, 231, 235, 0.9)',
                    color: '#ffffff',
                  },
                },
              },
            }}
          >
            {dubaiClearanceItems.map((item) => {
              const selected = isSelected(item.path);
              return (
                <MenuItem
                  key={item.text}
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    handleDubaiClearancePopupClose();
                    setMobileOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <Box sx={{ 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
          
          <Collapse in={openDubaiClearance && !sidebarCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ 
              '& .MuiListItem-root': { 
                padding: 0,
                margin: '1px 0'
              },
              '& .MuiListItemButton-root': {
                paddingLeft: 6,
                paddingY: 1.5,
                marginX: 0.5,
                borderRadius: 2,
                background: 'transparent',
                border: '1px solid transparent',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                }
              }
            }}>
              {dubaiClearanceItems.map((sub) => {
                const selected = isSelected(sub.path);
                return (
                  <ListItem key={sub.text} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => {
                        navigate(sub.path);
                        setMobileOpen(false);
                      }}
                      sx={{ 
                        pl: 6, 
                        py: 1.5, 
                        mx: 0.5, 
                        borderRadius: 2,
                        color: selected 
                          ? '#ffffff' 
                          : (mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937'),
                        background: selected ? (mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)') : 'transparent',
                        border: '1px solid transparent',
                        '&:hover': {
                          background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'inherit', 
                        minWidth: 32,
                        '& .MuiSvgIcon-root': { fontSize: 18 }
                      }}>
                        {sub.icon}
                      </ListItemIcon>
                      <ListItemText primary={sub.text} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ 
        p: 2, 
        borderTop: mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        {sidebarCollapsed ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton onClick={handleProfileMenuOpen} aria-label="Profile">
              <AccountCircle />
            </IconButton>
          </Box>
        ) : (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          px: 3,
          borderRadius: 2,
            background: 'transparent',
            border: '1px solid transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: mode === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(229,231,235,0.6)',
            }
        }}>
          <Avatar sx={{ 
            width: 28, 
            height: 28, 
              background: mode === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(229, 231, 235, 0.9)',
              color: mode === 'dark' ? '#ffffff' : '#1f2937',
            fontWeight: 600,
              fontSize: 12,
              border: '1px solid transparent',
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
            <Fade in timeout={300}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 500, 
                  color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : '#1f2937',
                  fontSize: 13,
                }}>
              {user?.name || 'User'}
            </Typography>
                <Typography variant="caption" sx={{ 
                  color: mode === 'dark' 
                    ? 'rgba(241, 245, 249, 0.6)' 
                    : 'rgba(30, 41, 59, 0.6)',
                  fontSize: 11,
                }}>
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
            </Fade>
          <IconButton
            size="small"
            onClick={handleProfileMenuOpen}
              sx={{ 
                color: mode === 'dark' 
                  ? 'rgba(241, 245, 249, 0.7)' 
                  : 'rgba(30, 41, 59, 0.7)',
                padding: 0.5,
                '&:hover': {
                  color: mode === 'dark' ? '#ffffff' : '#1f293b',
                  background: 'transparent',
                }
              }}
          >
            <ExpandMore fontSize="small" />
          </IconButton>
        </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Top App Bar - Modern */}
      <AppBar
        position="fixed"
        sx={{
          width: { 
            xs: '100%', 
            sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` 
          },
          ml: { 
            xs: 0, 
            sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` 
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
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} arrow>
              <Box sx={{ 
                bgcolor: 'rgba(139, 92, 246, 0.1)',
                borderRadius: 1,
                p: 0.5,
                '&:hover': { 
                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                },
                transition: 'all 0.2s ease',
              }}>
                <ThemeToggle />
              </Box>
            </Tooltip>

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
              <Badge badgeContent={3} color="error">
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

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { 
            sm: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth 
          }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 1200,
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              borderRight: 'none',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%', 
            sm: `calc(100vw - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` 
          },
          minHeight: '100vh',
          bgcolor: 'background.default',
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          marginLeft: { sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ height: 70 }} />
        <Box sx={{ p: 3 }}>
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
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
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
            minWidth: 300,
            maxHeight: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#8b5cf6' }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
              <ReceiptIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                New Sale Created
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Invoice #INV-001 has been created
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
              <Notifications fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Payment Overdue
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3 invoices are overdue
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main' }}>
              <Users fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                New Customer Added
              </Typography>
              <Typography variant="caption" color="text.secondary">
                John Doe has been registered
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
}; 