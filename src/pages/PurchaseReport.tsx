import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
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
  Tabs,
  Tab,
  Collapse,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface PurchaseReportData {
  summary: {
    totalPurchases: number;
    totalPKR: number;
    totalAED: number;
    averageCost: number;
    totalTransport: number;
    totalFreight: number;
    totalEForm: number;
    totalMiscellaneous: number;
    productBreakdown: Record<string, number>;
    monthlyBreakdown: Record<string, any>;
  };
  purchases: any[];
  groupedData?: Record<string, any>;
}

const PurchaseReportPage: React.FC = () => {
  const { mode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<PurchaseReportData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [purchasesPage, setPurchasesPage] = useState(0);
  const [purchasesRowsPerPage, setPurchasesRowsPerPage] = useState(10);

  // Report options state
  const [reportOptions, setReportOptions] = useState({
    startDate: '',
    endDate: '',
    containerNo: '',
    product: '',
    groupBy: 'none' as 'none' | 'product' | 'month' | 'week',
    format: 'json' as 'json' | 'csv' | 'pdf'
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.generatePurchaseReport(reportOptions);
      if (response.success) {
        setReportData(response.report);
        setPurchasesPage(0);
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
      await apiService.downloadPurchaseReport({
        ...reportOptions,
        format
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
      containerNo: '',
      product: '',
      groupBy: 'none',
      format: 'json'
    });
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!reportData) return [];

    if (reportOptions.groupBy === 'product') {
      return Object.entries(reportData.summary.productBreakdown).map(([product, count]) => ({
        name: product,
        value: count,
        total: count
      }));
    }

    if (reportOptions.groupBy === 'month') {
      return Object.entries(reportData.summary.monthlyBreakdown).map(([month, data]) => ({
        name: month,
        purchases: data.count,
        totalPKR: data.totalPKR,
        totalAED: data.totalAED
      }));
    }

    return [];
  };

  const chartData = prepareChartData();

  return (
    <Box sx={{ 
      p: 3,
      minHeight: '100vh',
      bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.3)' : 'background.default',
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReportIcon sx={{ fontSize: 32, color: mode === 'dark' ? '#60a5fa' : '#3ca12c' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: mode === 'dark' ? '#60a5fa' : '#2d3748' }}>
            Purchase Report
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderRadius: 2 }}
          >
            Filters
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadReport('csv')}
            sx={{ borderRadius: 2 }}
          >
            Export CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PdfIcon />}
            onClick={() => handleDownloadReport('pdf')}
            sx={{ borderRadius: 2, bgcolor: '#ff4444', color: 'white', '&:hover': { bgcolor: '#cc0000' } }}
          >
            Export PDF
          </Button>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleGenerateReport}
            disabled={loading}
            sx={{ bgcolor: '#3ca12c', '&:hover': { bgcolor: '#338f27' }, borderRadius: 2 }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </Box>

      {/* Filters Panel */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
            Report Filters
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 200 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={reportOptions.startDate ? new Date(reportOptions.startDate) : null}
                  onChange={(date) => setReportOptions(prev => ({
                    ...prev,
                    startDate: date ? date.toISOString().split('T')[0] : ''
                  }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={reportOptions.endDate ? new Date(reportOptions.endDate) : null}
                  onChange={(date) => setReportOptions(prev => ({
                    ...prev,
                    endDate: date ? date.toISOString().split('T')[0] : ''
                  }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <TextField
                fullWidth
                size="small"
                label="Container No"
                value={reportOptions.containerNo}
                onChange={(e) => setReportOptions(prev => ({ ...prev, containerNo: e.target.value }))}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <TextField
                fullWidth
                size="small"
                label="Product"
                value={reportOptions.product}
                onChange={(e) => setReportOptions(prev => ({ ...prev, product: e.target.value }))}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Group By</InputLabel>
                <Select
                  value={reportOptions.groupBy}
                  label="Group By"
                  onChange={(e) => setReportOptions(prev => ({ ...prev, groupBy: e.target.value as any }))}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Report Content */}
      {reportData && !loading && (
        <>
          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Card sx={{ 
              borderRadius: 2, 
              bgcolor: mode === 'dark' ? 'rgba(59,130,246,0.8)' : '#4299e1', 
              color: 'white', 
              minWidth: 200, 
              flex: 1,
              boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {reportData.summary.totalPurchases}
                </Typography>
                <Typography variant="body2">Total Purchases</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              borderRadius: 2, 
              bgcolor: mode === 'dark' ? 'rgba(34,197,94,0.8)' : '#48bb78', 
              color: 'white', 
              minWidth: 200, 
              flex: 1,
              boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  PKR {reportData.summary.totalPKR.toLocaleString()}
                </Typography>
                <Typography variant="body2">Total PKR</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              borderRadius: 2, 
              bgcolor: mode === 'dark' ? 'rgba(249,115,22,0.8)' : '#ed8936', 
              color: 'white', 
              minWidth: 200, 
              flex: 1,
              boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  AED {reportData.summary.totalAED.toLocaleString()}
                </Typography>
                <Typography variant="body2">Total AED</Typography>
              </CardContent>
            </Card>
            <Card sx={{ 
              borderRadius: 2, 
              bgcolor: mode === 'dark' ? 'rgba(239,68,68,0.8)' : '#f56565', 
              color: 'white', 
              minWidth: 200, 
              flex: 1,
              boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
              border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  AED {reportData.summary.averageCost.toLocaleString()}
                </Typography>
                <Typography variant="body2">Average Cost</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tabs */}
          <Paper sx={{ 
            borderRadius: 2,
            bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
            border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
            boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
          }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: mode === 'dark' ? 'rgba(241,245,249,0.7)' : 'inherit',
                  '&.Mui-selected': {
                    color: mode === 'dark' ? '#60a5fa' : 'primary.main',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: mode === 'dark' ? '#60a5fa' : 'primary.main',
                },
              }}
            >
              <Tab icon={<TableIcon />} label="Table View" />
              <Tab icon={<BarChartIcon />} label="Charts" />
            </Tabs>
            <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.12)' }} />

            {/* Table View */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Container No</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Rate (PKR)</TableCell>
                        <TableCell align="right">Total PKR</TableCell>
                        <TableCell align="right">Total AED</TableCell>
                        <TableCell>Created Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.purchases
                        .slice(purchasesPage * purchasesRowsPerPage, purchasesPage * purchasesRowsPerPage + purchasesRowsPerPage)
                        .map((purchase) => (
                          <TableRow key={purchase._id}>
                            <TableCell>{purchase.containerNo}</TableCell>
                            <TableCell>{purchase.product}</TableCell>
                            <TableCell align="right">{purchase.quantity}</TableCell>
                            <TableCell align="right">PKR {purchase.rate.toLocaleString()}</TableCell>
                            <TableCell align="right">PKR {purchase.totalPKR.toLocaleString()}</TableCell>
                            <TableCell align="right">AED {purchase.totalAED.toLocaleString()}</TableCell>
                            <TableCell>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={reportData.purchases.length}
                  page={purchasesPage}
                  onPageChange={(e, newPage) => setPurchasesPage(newPage)}
                  rowsPerPage={purchasesRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setPurchasesRowsPerPage(parseInt(e.target.value, 10));
                    setPurchasesPage(0);
                  }}
                />
              </Box>
            )}

            {/* Charts View */}
            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                {reportOptions.groupBy === 'product' && (
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Paper sx={{ p: 3, borderRadius: 2, flex: 1, minWidth: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Purchases by Product</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                    <Paper sx={{ p: 3, borderRadius: 2, flex: 1, minWidth: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Purchases by Product (Bar)</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Box>
                )}

                {reportOptions.groupBy === 'month' && (
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Paper sx={{ p: 3, borderRadius: 2, flex: 1, minWidth: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Purchases by Month</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="purchases" stroke="#8884d8" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Paper>
                    <Paper sx={{ p: 3, borderRadius: 2, flex: 1, minWidth: 400 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Total AED by Month</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="totalAED" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Box>
                )}

                {reportOptions.groupBy === 'none' && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                      Select a grouping option to view charts
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default PurchaseReportPage;
