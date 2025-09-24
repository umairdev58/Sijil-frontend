import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ReportData {
  summary: {
    totalSales: number;
    totalAmount: number;
    totalReceived: number;
    totalOutstanding: number;
    statusBreakdown: Record<string, number>;
  };
  sales: any[];
  payments?: any[];
  groupedData?: Record<string, any>;
  trends?: any[];
}

const SalesReportPage: React.FC = () => {
  const { mode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [expandedSaleIds, setExpandedSaleIds] = useState<string[]>([]);
  const [salesPage, setSalesPage] = useState(0);
  const [salesRowsPerPage, setSalesRowsPerPage] = useState(10);

  // Report options state
  const [reportOptions, setReportOptions] = useState({
    startDate: '',
    endDate: '',
    customer: '',
    supplier: '',
    containerNo: '',
    status: '',
    statuses: '',
    groupBy: 'none' as 'none' | 'customer' | 'supplier' | 'status' | 'month' | 'week' | 'container',
    includePayments: true, // Enable by default to show transactions
    format: 'json' as 'json' | 'csv' | 'pdf'
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partially_paid': return 'warning';
      case 'unpaid': return 'info';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.generateSalesReport({
        ...reportOptions,
        includePayments: reportOptions.includePayments ? 'true' : 'false',
      });
      if (response.success) {
        setReportData(response.report);
        setExpandedSaleIds([]);
        setSalesPage(0);
      } else {
        setError('Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (format: 'csv' | 'pdf') => {
    try {
      const { format: _, ...downloadOptions } = reportOptions;
      await apiService.downloadSalesReport({
        ...downloadOptions,
        format,
        includePayments: reportOptions.includePayments ? 'true' : 'false',
      });
    } catch (err) {
      console.error('Error downloading report:', err);
      setError('Failed to download report');
    }
  };

  const handleClearFilters = () => {
    setReportOptions({
      startDate: '',
      endDate: '',
      customer: '',
      supplier: '',
      containerNo: '',
      status: '',
      statuses: '',
      groupBy: 'none',
      includePayments: true, // Keep payments enabled by default
      format: 'json'
    });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = reportOptions.statuses ? reportOptions.statuses.split(',') : [];
    let newStatuses: string[];
    
    if (checked) {
      newStatuses = [...currentStatuses, status];
    } else {
      newStatuses = currentStatuses.filter(s => s !== status);
    }
    
    setReportOptions(prev => ({ ...prev, statuses: newStatuses.join(',') }));
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!reportData) return { statusData: [], trendData: [], groupedData: [] };

    // Status breakdown for pie chart
    const statusData = Object.entries(reportData.summary.statusBreakdown).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      status
    }));

    // Monthly trend data (if available)
    const trendData = reportData.trends || [];

    // Grouped data for bar chart
    const groupedData = reportData.groupedData ? 
      Object.entries(reportData.groupedData).map(([key, data]) => ({
        name: key,
        amount: data.totalAmount || 0,
        received: data.totalReceived || 0,
        outstanding: data.totalOutstanding || 0,
        count: data.count || 0
      })) : [];

    return { statusData, trendData, groupedData };
  };

  const { statusData, trendData, groupedData } = prepareChartData();

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return amount ? `AED ${amount.toLocaleString()}` : 'AED 0';
  };

  // Helper function to format date
  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Helper function to group payments by sale ID
  const groupPaymentsBySale = () => {
    if (!reportData?.payments) return {};
    
    const grouped: Record<string, any[]> = {};
    reportData.payments.forEach((payment: any) => {
      if (!grouped[payment.saleId]) {
        grouped[payment.saleId] = [];
      }
      grouped[payment.saleId].push(payment);
    });
    
    return grouped;
  };

  // Helper function to get payments for a specific sale
  const getPaymentsForSale = (saleId: string) => {
    const groupedPayments: Record<string, any[]> = groupPaymentsBySale();
    return groupedPayments[saleId] || [];
  };

  const toggleSaleExpansion = (saleId: string) => {
    setExpandedSaleIds((prev) =>
      prev.includes(saleId) ? prev.filter((id) => id !== saleId) : [...prev, saleId]
    );
  };

  const handleChangeSalesPage = (_: unknown, newPage: number) => setSalesPage(newPage);
  const handleChangeSalesRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalesRowsPerPage(parseInt(e.target.value, 10));
    setSalesPage(0);
  };

  return (
    <Box sx={{ 
      bgcolor: mode === 'dark' ? '#0f172a' : '#f8fafb', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 3, 
        py: 2, 
        bgcolor: mode === 'dark' ? '#1e293b' : '#fff', 
        borderBottom: mode === 'dark' ? '1px solid #334155' : '1px solid #eee', 
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            ml: 3,
            color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
          }}>
            Sales Report
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
          >
            Filters
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadReport('csv')}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
          >
            Export CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PdfIcon />}
            onClick={() => handleDownloadReport('pdf')}
            sx={{ 
              borderRadius: 999, 
              textTransform: 'none', 
              fontWeight: 600,
              bgcolor: '#ff4444', 
              color: 'white', 
              '&:hover': { bgcolor: '#cc0000' } 
            }}
          >
            Export PDF
          </Button>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleGenerateReport}
            disabled={loading}
            sx={{ 
              bgcolor: '#3ca12c', 
              '&:hover': { bgcolor: '#338f27' }, 
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </Box>

      {/* Filters Panel */}
      <Collapse in={showFilters}>
        <Paper sx={{ 
          mx: 3, 
          p: 3, 
          mb: 3, 
          bgcolor: mode === 'dark' ? '#1e293b' : '#f8f9fa',
          boxShadow: mode === 'dark' 
            ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
            : '0 2px 10px rgba(0, 0, 0, 0.05)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Report Filters</Typography>
            <Button 
              startIcon={<ClearIcon />} 
              onClick={handleClearFilters}
              size="small"
            >
              Clear All
            </Button>
          </Box>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={reportOptions.startDate ? new Date(reportOptions.startDate) : null}
                onChange={(date) => setReportOptions(prev => ({ 
                  ...prev, 
                  startDate: date ? date.toISOString().split('T')[0] : '' 
                }))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={reportOptions.endDate ? new Date(reportOptions.endDate) : null}
                onChange={(date) => setReportOptions(prev => ({ 
                  ...prev, 
                  endDate: date ? date.toISOString().split('T')[0] : '' 
                }))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
              <TextField
                label="Customer"
                value={reportOptions.customer}
                onChange={(e) => setReportOptions(prev => ({ ...prev, customer: e.target.value }))}
                fullWidth
                size="small"
              />
              <TextField
                label="Supplier"
                value={reportOptions.supplier}
                onChange={(e) => setReportOptions(prev => ({ ...prev, supplier: e.target.value }))}
                fullWidth
                size="small"
              />
              <TextField
                label="Container Number"
                value={reportOptions.containerNo}
                onChange={(e) => setReportOptions(prev => ({ ...prev, containerNo: e.target.value }))}
                fullWidth
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Group By</InputLabel>
                <Select
                  value={reportOptions.groupBy}
                  onChange={(e) => setReportOptions(prev => ({ ...prev, groupBy: e.target.value as any }))}
                  label="Group By"
                >
                  <MenuItem value="none">No Grouping</MenuItem>
                  <MenuItem value="customer">By Customer</MenuItem>
                  <MenuItem value="supplier">By Supplier</MenuItem>
                  <MenuItem value="container">By Container</MenuItem>
                  <MenuItem value="status">By Status</MenuItem>
                  <MenuItem value="month">By Month</MenuItem>
                  <MenuItem value="week">By Week</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportOptions.includePayments}
                    onChange={(e) => setReportOptions(prev => ({ ...prev, includePayments: e.target.checked }))}
                  />
                }
                label="Include Payment Details"
              />
            </Box>

            {/* Status Filters */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Status Filter</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {['unpaid', 'partially_paid', 'paid', 'overdue'].map((status) => (
                  <FormControlLabel
                    key={status}
                    control={
                      <Checkbox
                        checked={reportOptions.statuses?.includes(status) || false}
                        onChange={(e) => handleStatusChange(status, e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Chip
                        label={status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(status) as any}
                        size="small"
                      />
                    }
                  />
                ))}
              </Box>
            </Box>
          </LocalizationProvider>
        </Paper>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mx: 3, mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {reportData && (
        <Box sx={{ px: 3 }}>
          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {reportData.summary.totalSales}
                </Typography>
                <Typography variant="body2">
                  Total Sales
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  AED {reportData.summary.totalAmount?.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Total Amount
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  AED {reportData.summary.totalReceived?.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Total Received
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  AED {reportData.summary.totalOutstanding?.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Total Outstanding
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tabs for different views */}
          <Paper sx={{ 
          mb: 3,
          bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
          boxShadow: mode === 'dark' 
            ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
            : '0 2px 10px rgba(0, 0, 0, 0.05)',
        }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Overview" icon={<ViewIcon />} />
              <Tab label="Charts" icon={<BarChartIcon />} />
              <Tab label="Sales Data" icon={<TableIcon />} />
              {reportData.payments && reportData.payments.length > 0 && (
                <Tab label="Payment Details" icon={<TableIcon />} />
              )}
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
              {/* Status Breakdown */}
              <Paper sx={{ 
                p: 3,
                bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                boxShadow: mode === 'dark' 
                  ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="h6" gutterBottom>
                  Status Breakdown
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* Grouped Data */}
              {groupedData.length > 0 && (
                <Paper sx={{ 
                  p: 3,
                  bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  boxShadow: mode === 'dark' 
                    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                    : '0 2px 10px rgba(0, 0, 0, 0.05)',
                }}>
                  <Typography variant="h6" gutterBottom>
                    {reportOptions.groupBy === 'customer' ? 'Customer Breakdown' :
                     reportOptions.groupBy === 'supplier' ? 'Supplier Breakdown' :
                     reportOptions.groupBy === 'status' ? 'Status Breakdown' :
                     reportOptions.groupBy === 'month' ? 'Monthly Breakdown' :
                     reportOptions.groupBy === 'week' ? 'Weekly Breakdown' : 'Grouped Data'}
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="amount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              )}

              {/* Trends */}
              {trendData.length > 0 && (
                <Paper sx={{ 
                  p: 3, 
                  gridColumn: '1 / -1',
                  bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  boxShadow: mode === 'dark' 
                    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                    : '0 2px 10px rgba(0, 0, 0, 0.05)',
                }}>
                  <Typography variant="h6" gutterBottom>
                    Sales Trends
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
              {/* Status Pie Chart */}
              <Paper sx={{ 
                p: 3,
                bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                boxShadow: mode === 'dark' 
                  ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="h6" gutterBottom>
                  Sales by Status
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* Grouped Bar Chart */}
              {groupedData.length > 0 && (
                <Paper sx={{ 
                  p: 3,
                  bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  boxShadow: mode === 'dark' 
                    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                    : '0 2px 10px rgba(0, 0, 0, 0.05)',
                }}>
                  <Typography variant="h6" gutterBottom>
                    {reportOptions.groupBy === 'customer' ? 'Sales by Customer' :
                     reportOptions.groupBy === 'supplier' ? 'Sales by Supplier' :
                     reportOptions.groupBy === 'status' ? 'Sales by Status' :
                     reportOptions.groupBy === 'month' ? 'Sales by Month' :
                     reportOptions.groupBy === 'week' ? 'Sales by Week' : 'Grouped Sales'}
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="amount" fill="#82ca9d" />
                        <Bar dataKey="received" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              )}

              {/* Trends Line Chart */}
              {trendData.length > 0 && (
                <Paper sx={{ 
                  p: 3, 
                  gridColumn: '1 / -1',
                  bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  boxShadow: mode === 'dark' 
                    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                    : '0 2px 10px rgba(0, 0, 0, 0.05)',
                }}>
                  <Typography variant="h6" gutterBottom>
                    Sales Trends Over Time
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="received" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Paper sx={{ 
              p: 3,
              bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
              boxShadow: mode === 'dark' 
                ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                : '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}>
              <Typography variant="h6" gutterBottom>
                Sales Details ({reportData.sales.length} records)
              </Typography>
              <TableContainer component={Paper} sx={{ 
                maxHeight: 600,
                bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
              }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Container</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.sales
                      .slice(salesPage * salesRowsPerPage, salesPage * salesRowsPerPage + salesRowsPerPage)
                      .map((sale: any) => {
                      const salePayments = getPaymentsForSale(sale._id);
                      return (
                        <React.Fragment key={sale._id}>
                          {/* Main Sale Row */}
                          <TableRow 
                            hover 
                            onClick={() => toggleSaleExpansion(sale._id)}
                            sx={{ 
                              cursor: 'pointer', 
                              backgroundColor: expandedSaleIds.includes(sale._id) 
                                ? (mode === 'dark' ? '#334155' : '#eef3ff') 
                                : (mode === 'dark' ? '#1e293b' : '#f8f9fa') 
                            }}
                          >
                            <TableCell>{formatDate(sale.invoiceDate)}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{sale.invoiceNumber}</TableCell>
                            <TableCell>{sale.customer}</TableCell>
                            <TableCell>{sale.containerNo}</TableCell>
                            <TableCell>{sale.product}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(sale.rate || 0)}</TableCell>
                            <TableCell>{sale.quantity || 0}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(sale.amount)}</TableCell>
                          </TableRow>
                          
                          {/* Transaction Rows (expand/collapse) */}
                          {expandedSaleIds.includes(sale._id) && salePayments.length > 0 && (
                            <>
                              <TableRow>
                                <TableCell colSpan={8} sx={{ py: 1, px: 3 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    → Transactions:
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              {salePayments.map((payment: any, index: number) => {
                                 const previousBalance = index === 0 ? sale.amount : 
                                    salePayments.slice(0, index).reduce((sum: number, p: any) => sum - p.amount, sale.amount);
                                 const currentBalance = previousBalance - payment.amount;
                                 
                                 return (
                                   <TableRow key={payment._id} sx={{ 
                                     backgroundColor: mode === 'dark' ? '#334155' : '#ffffff' 
                                   }}>
                                     <TableCell sx={{ pl: 6 }}>{formatDate(payment.paymentDate)}</TableCell>
                                     <TableCell sx={{ pl: 6, color: 'success.main', fontWeight: 600 }}>
                                       AED {payment.amount.toLocaleString()}
                                     </TableCell>
                                     <TableCell sx={{ pl: 6, color: 'text.secondary' }}>
                                       Balance: {formatCurrency(currentBalance)}
                                     </TableCell>
                                     <TableCell sx={{ pl: 6 }}>{payment.paymentMethod || 'N/A'}</TableCell>
                                     <TableCell sx={{ pl: 6 }}>{payment.paymentType || 'N/A'}</TableCell>
                                     <TableCell sx={{ pl: 6 }}>{payment.reference || 'N/A'}</TableCell>
                                     <TableCell sx={{ pl: 6 }}>{payment.notes || 'N/A'}</TableCell>
                                     <TableCell sx={{ pl: 6 }}>-</TableCell>
                                   </TableRow>
                                 );
                               })}
                             </>
                           )}
                         </React.Fragment>
                    )})}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                rowsPerPageOptions={[5, 10, 25, 50]}
                count={reportData.sales.length}
                rowsPerPage={salesRowsPerPage}
                page={salesPage}
                onPageChange={handleChangeSalesPage}
                onRowsPerPageChange={handleChangeSalesRowsPerPage}
              />
            </Paper>
          )}

          {activeTab === 3 && reportData.payments && reportData.payments.length > 0 && (
            <Paper sx={{ 
              p: 3,
              bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
              boxShadow: mode === 'dark' 
                ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                : '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}>
              <Typography variant="h6" gutterBottom>
                Payment Details ({reportData.payments.length} records)
              </Typography>
              <TableContainer component={Paper} sx={{ 
                maxHeight: 600,
                bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sale ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Received By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.payments.map((payment: any) => (
                      <TableRow key={payment._id}>
                        <TableCell>{payment.saleId}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.paymentType}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.reference}</TableCell>
                        <TableCell>{payment.notes}</TableCell>
                        <TableCell>
                          {typeof payment.receivedBy === 'object' && payment.receivedBy !== null
                            ? payment.receivedBy.name
                            : payment.receivedBy || ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {!reportData && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Report Generated
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure your filters and click "Generate Report" to view sales analytics
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ReportIcon />}
            onClick={handleGenerateReport}
            sx={{ bgcolor: '#3ca12c', '&:hover': { bgcolor: '#338f27' } }}
          >
            Generate Report
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SalesReportPage; 