import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Box,
  Chip,
  IconButton,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
} from '@mui/material';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  People,
  ShoppingCart,
  AttachMoney,
  AccountBalance,
  MoreVert,
  TrendingUp,
  TrendingDown,
  Warning,
  ArrowForward,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import apiService from '../services/api';

interface DashboardStats {
  totalSales: number;
  totalReceived: number;
  totalOutstanding: number;
  totalCount: number;
  unpaidCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  overdueCount: number;
}

interface MonthlyStats {
  month: string;
  sales: number;
  received: number;
  growth: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  growth?: number;
  loading?: boolean;
  progress?: number;
  total?: number;
}

interface CustomerOutstanding {
  _id: string;
  customerName: string;
  totalOutstanding: number;
  invoiceCount: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  growth, 
  loading = false,
  progress,
  total
}) => {
  const { mode } = useTheme();
  if (loading) {
    return (
      <Card sx={{ 
        borderLeft: '4px solid',
        borderLeftColor: color,
        boxShadow: mode === 'dark' 
          ? '0px 2px 10px rgba(0, 0, 0, 0.3)' 
          : '0px 2px 10px rgba(0, 0, 0, 0.05)',
        height: '100%',
        minHeight: 140,
        background: mode === 'dark' ? '#1e293b' : '#ffffff',
      }}>
        <CardContent>
          <Box display="flex" alignItems="center">
            <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={32} />
              {progress !== undefined && (
                <Skeleton variant="rectangular" width="100%" height={8} sx={{ mt: 1, borderRadius: 4 }} />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      borderLeft: '4px solid',
      borderLeftColor: color,
      boxShadow: mode === 'dark' 
        ? '0px 2px 10px rgba(0, 0, 0, 0.3)' 
        : '0px 2px 10px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      height: '100%',
      minHeight: 140,
      background: mode === 'dark' ? '#1e293b' : '#ffffff',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: mode === 'dark' 
          ? '0px 4px 20px rgba(0, 0, 0, 0.4)' 
          : '0px 4px 20px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Avatar sx={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
            color: color,
            width: 56,
            height: 56,
            mr: 2,
            border: `2px solid ${color}30`
          }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 500, fontSize: '0.75rem' }}
            >
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {value}
            </Typography>
            
            {growth !== undefined && (
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                {growth >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: growth >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600
                  }}
                >
                  {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                </Typography>
              </Box>
            )}

            {progress !== undefined && total !== undefined && (
              <Box sx={{ mt: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {progress}/{total}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(progress / total) * 100} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: `${color}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: color,
                      borderRadius: 3
                    }
                  }} 
                />
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { mode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [outstandingCustomers, setOutstandingCustomers] = useState<CustomerOutstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '1m' | 'ytd'>('1m');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await apiService.getSalesStatistics();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

        // Fetch monthly series for chart based on selected range
        const monthlyResponse = await apiService.getTimeSeries(dateRange);
        if (monthlyResponse.success) {
          const series = monthlyResponse.data as Array<{ month: string; sales: number; received: number }>;
          const withGrowth: MonthlyStats[] = series.map((item, idx) => {
            const prev = idx > 0 ? series[idx - 1] : undefined;
            const growth = prev && prev.sales > 0 ? ((item.sales - prev.sales) / prev.sales) * 100 : 0;
            return { ...item, growth } as MonthlyStats;
          });
          setMonthlyStats(withGrowth);
        }

        // Fetch top customers with outstanding dues
        const outstandingResponse = await apiService.getCustomerOutstanding({
          page: 1,
          limit: 5,
          sortBy: 'totalOutstanding',
          sortOrder: 'desc'
        });
        if (outstandingResponse.success) {
          setOutstandingCustomers(outstandingResponse.data);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newRange: '7d' | '1m' | 'ytd' | null,
  ) => {
    if (newRange !== null) {
      setDateRange(newRange);
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  const statusData = stats ? [
    { name: 'Paid', value: stats.paidCount, color: '#10b981' },
    { name: 'Partially Paid', value: stats.partiallyPaidCount, color: '#6366f1' },
    { name: 'Unpaid', value: stats.unpaidCount, color: '#8b5cf6' },
    { name: 'Overdue', value: stats.overdueCount, color: '#ef4444' },
  ] : [];

  const chartData = monthlyStats.length > 0 ? monthlyStats : [
    { month: 'Jan', sales: 0, received: 0, growth: 0 },
    { month: 'Feb', sales: 0, received: 0, growth: 0 },
    { month: 'Mar', sales: 0, received: 0, growth: 0 },
    { month: 'Apr', sales: 0, received: 0, growth: 0 },
    { month: 'May', sales: 0, received: 0, growth: 0 },
    { month: 'Jun', sales: 0, received: 0, growth: 0 },
  ];

  const totalOutstanding = outstandingCustomers.reduce((sum, customer) => sum + customer.totalOutstanding, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
            letterSpacing: '-0.5px'
          }}>
            Dashboard Overview
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/executive-dashboard')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: mode === 'dark' ? 'rgba(148,163,184,0.3)' : 'rgba(30,58,138,0.3)',
              color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
              '&:hover': {
                borderColor: '#8b5cf6',
                backgroundColor: mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
              }
            }}
          >
            Executive Dashboard
          </Button>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={handleDateRangeChange}
            size="small"
            sx={{
              backgroundColor: mode === 'dark' ? 'rgba(30,41,59,0.6)' : 'rgba(30,58,138,0.06)',
              borderRadius: 999,
              p: 0.5,
              boxShadow: mode === 'dark'
                ? 'inset 0 0 0 1px rgba(148,163,184,0.15)'
                : 'inset 0 0 0 1px rgba(2,6,23,0.08)',
              '& .MuiToggleButtonGroup-grouped': {
                margin: '0 4px',
                border: 0,
                '&:not(:first-of-type)': {
                  borderRadius: 999,
                },
                '&:first-of-type': {
                  borderRadius: 999,
                },
              },
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 700,
                letterSpacing: 0.2,
                px: 2.25,
                py: 0.75,
                minWidth: 110,
                color: mode === 'dark' ? 'rgba(241,245,249,0.8)' : '#0b1220',
                borderRadius: 999,
                border: 'none',
                transition: 'all .2s ease',
                '&:not(.Mui-selected):hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(30,58,138,0.12)',
                },
                '&.Mui-selected': {
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  boxShadow: '0 6px 16px rgba(139, 92, 246, 0.35)',
                  border: '1px solid rgba(139, 92, 246, 0.45)',
                  '&:hover': {
                    backgroundColor: '#7c3aed',
                  },
                },
                '&.Mui-focusVisible': {
                  outline: '2px solid rgba(250, 204, 21, 0.5)',
                  outlineOffset: 2,
                },
              },
            }}
          >
            <ToggleButton value="7d">Last 7 Days</ToggleButton>
            <ToggleButton value="1m">Last Month</ToggleButton>
            <ToggleButton value="ytd">YTD</ToggleButton>
          </ToggleButtonGroup>
        <Chip 
          label={`Last updated: ${new Date().toLocaleString()}`} 
          size="small"
          sx={{ 
            backgroundColor: 'action.selected',
            color: 'text.secondary'
          }}
        />
        </Stack>
      </Box>
      
      {/* Statistics Cards - Modern Layout */}
                <Box sx={{
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 3 
      }}>
        <StatCard
          title="TOTAL SALES"
          value={loading ? '' : `AED ${stats?.totalSales.toLocaleString() || '0'}`}
          icon={<ShoppingCart />}
          color="#1e3a8a"
          growth={12.5}
          loading={loading}
        />

        <StatCard
          title="TOTAL RECEIVED"
          value={loading ? '' : `AED ${stats?.totalReceived.toLocaleString() || '0'}`}
          icon={<AttachMoney />}
          color="#059669"
          growth={8.2}
          loading={loading}
        />

        <StatCard
          title="OUTSTANDING"
          value={loading ? '' : `AED ${stats?.totalOutstanding.toLocaleString() || '0'}`}
          icon={<AccountBalance />}
          color="#dc2626"
          growth={-5.1}
          loading={loading}
        />

        <StatCard
          title="TOTAL INVOICES"
          value={loading ? '' : stats?.totalCount || 0}
          icon={<People />}
          color="#ffd700"
          loading={loading}
          progress={stats?.paidCount || 0}
          total={stats?.totalCount || 0}
        />
              </Box>
  
      {/* Charts Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3, 
        mb: 3 
      }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          height: '100%',
          minHeight: 400
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a' }}>
                Sales Status Distribution
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          {loading ? (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner size="large" variant="pulse" message="Loading chart data..." />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => 
                    `${name}\n${value} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} invoices`, 'Count']}
                  contentStyle={{
                    borderRadius: '8px',
                    boxShadow: mode === 'dark' 
                      ? '0px 2px 10px rgba(0, 0, 0, 0.3)' 
                      : '0px 2px 10px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    backgroundColor: mode === 'dark' ? '#1e293b' : '#fff',
                    color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          </Paper>
  
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          height: '100%',
          minHeight: 400
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: mode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
                Monthly Sales vs Received
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          {loading ? (
            <Box sx={{ height: 300 }}>
              <Skeleton variant="rectangular" width="100%" height="100%" />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'text.secondary' }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fill: 'text.secondary' }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px',
                    boxShadow: mode === 'dark' 
                      ? '0px 2px 10px rgba(0, 0, 0, 0.3)' 
                      : '0px 2px 10px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    backgroundColor: mode === 'dark' ? '#1e293b' : '#fff',
                    color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                  }}
                  formatter={(value) => [`AED ${value?.toLocaleString()}`, 'Amount']}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#8b5cf6" 
                  name="Sales" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                />
                <Bar 
                  dataKey="received" 
                  fill="#10b981" 
                  name="Received" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={200}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
          </Paper>
      </Box>

      {/* Customer Outstanding Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
        gap: 3, 
        mb: 3 
      }}>
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          height: 400,
          background: mode === 'dark' ? '#1e293b' : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
        }}>
            <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexShrink: 0
          }}>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                mb: 0.5
              }}>
                Top Customers with Outstanding Dues
              </Typography>
              <Typography variant="body2" sx={{ 
                color: mode === 'dark' ? '#94a3b8' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Warning sx={{ fontSize: 16, color: '#ef4444' }} />
                Total Outstanding: AED {totalOutstanding.toLocaleString()}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                '&:hover': {
                  borderColor: '#ef4444',
                  backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                }
              }}
              onClick={() => window.location.href = '/customer-outstanding'}
            >
              View All
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              overflow: 'hidden'
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : outstandingCustomers.length > 0 ? (
            <List sx={{ 
              p: 0, 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: mode === 'dark' ? '#334155' : '#f1f5f9',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: mode === 'dark' ? '#64748b' : '#cbd5e1',
                borderRadius: '3px',
                '&:hover': {
                  background: mode === 'dark' ? '#94a3b8' : '#94a3b8',
                },
              },
            }}>
              {outstandingCustomers.map((customer, index) => (
                <React.Fragment key={customer._id}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: mode === 'dark' ? '#ef4444' : '#fef2f2',
                        color: mode === 'dark' ? '#ffffff' : '#ef4444',
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {customer.customerName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ 
                          fontWeight: 500,
                          color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }}>
                          {customer.customerName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ 
                          color: mode === 'dark' ? '#94a3b8' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <span>{customer.invoiceCount} invoices</span>
                          <span>•</span>
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>
                            AED {customer.totalOutstanding.toLocaleString()}
                          </span>
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < outstandingCustomers.length - 1 && (
                    <Divider sx={{ 
                      my: 1,
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              flex: 1,
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              color: mode === 'dark' ? '#94a3b8' : '#64748b'
            }}>
              <AccountBalance sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                No outstanding dues
              </Typography>
              <Typography variant="body2">
                All customers are up to date with payments
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ 
          p: 3, 
              borderRadius: 2,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          height: '100%',
          minHeight: 400,
          background: mode === 'dark' ? '#1e293b' : '#ffffff',
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
            }}>
              Quick Stats
            </Typography>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
          {loading ? (
            <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 2 
            }}>
              <Box sx={{ 
                p: 2,
                background: 'linear-gradient(135deg, #10b98120 0%, #10b98140 100%)',
                borderRadius: 2,
                textAlign: 'center',
                border: '1px solid #10b98130'
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                  color: '#10b981'
                }}>
                  {stats?.paidCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#10b981',
                  fontWeight: 500
                }}>
                  Paid Invoices
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.totalCount ? (stats.paidCount / stats.totalCount) * 100 : 0} 
                  sx={{ 
                    mt: 1, 
                    height: 4, 
                    borderRadius: 2,
                    backgroundColor: '#10b98120',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#10b981',
                      borderRadius: 2
                    }
                  }} 
                />
              </Box>
              <Box sx={{ 
                p: 2,
                background: 'linear-gradient(135deg, #6366f120 0%, #6366f140 100%)',
                borderRadius: 2,
                textAlign: 'center',
                border: '1px solid #6366f130'
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: '#6366f1'
                }}>
                  {stats?.partiallyPaidCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ 
                  color: '#6366f1',
                fontWeight: 500
              }}>
                Partially Paid
              </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.totalCount ? (stats.partiallyPaidCount / stats.totalCount) * 100 : 0} 
                  sx={{ 
                    mt: 1, 
                    height: 4, 
                    borderRadius: 2,
                    backgroundColor: '#6366f120',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#6366f1',
                      borderRadius: 2
                    }
                  }} 
                />
            </Box>
            <Box sx={{ 
              p: 2,
                background: 'linear-gradient(135deg, #8b5cf620 0%, #8b5cf640 100%)',
              borderRadius: 2,
                textAlign: 'center',
                border: '1px solid #8b5cf630'
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                  color: '#8b5cf6'
              }}>
                  {stats?.unpaidCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ 
                  color: '#8b5cf6',
                fontWeight: 500
              }}>
                Unpaid Invoices
              </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.totalCount ? (stats.unpaidCount / stats.totalCount) * 100 : 0} 
                  sx={{ 
                    mt: 1, 
                    height: 4, 
                    borderRadius: 2,
                    backgroundColor: '#8b5cf620',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#8b5cf6',
                      borderRadius: 2
                    }
                  }} 
                />
            </Box>
            <Box sx={{ 
              p: 2,
                background: 'linear-gradient(135deg, #ef444420 0%, #ef444440 100%)',
              borderRadius: 2,
                textAlign: 'center',
                border: '1px solid #ef444430'
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                  color: '#ef4444'
              }}>
                  {stats?.overdueCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ 
                  color: '#ef4444',
                fontWeight: 500
              }}>
                Overdue Invoices
              </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.totalCount ? (stats.overdueCount / stats.totalCount) * 100 : 0} 
                  sx={{ 
                    mt: 1, 
                    height: 4, 
                    borderRadius: 2,
                    backgroundColor: '#ef444420',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ef4444',
                      borderRadius: 2
                    }
                  }} 
                />
              </Box>
            </Box>
          )}
      </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 