import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  Divider,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Collapse,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import apiService from '../services/api';
import { CustomerOutstanding, ProductOutstanding, OutstandingData } from '../types';
import BeautifulDownloadButton from '../components/BeautifulDownloadButton';
import BeautifulRefreshButton from '../components/BeautifulRefreshButton';
import { useTheme } from '../contexts/ThemeContext';

const CustomerOutstandingPage: React.FC = () => {
  const { mode } = useTheme();
  const [outstandingData, setOutstandingData] = useState<OutstandingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [uniqueProducts, setUniqueProducts] = useState<string[]>([]);

  // Filter states
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    status: '',
    product: '',
    groupBy: 'customer' as 'customer' | 'product',
  });

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalOutstanding: 0,
    totalCustomers: 0,
    overdueCustomers: 0,
    partiallyPaidCustomers: 0,
    unpaidCustomers: 0,
  });

  const fetchCustomerOutstanding = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getCustomerOutstanding({
        search: searchQuery,
        minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
        status: filters.status || undefined,
        product: filters.product || undefined,
        groupBy: filters.groupBy,
        page: page + 1,
        limit: rowsPerPage,
      });
      
      if (response.success) {
        setOutstandingData(response.data);
        setTotalCount(response.pagination.total);
        setSummaryStats(response.summary);
      }
    } catch (error: any) {
      console.error('Error fetching customer outstanding:', error);
      setError(error.response?.data?.message || 'Failed to fetch customer outstanding amounts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page, rowsPerPage]);

  const fetchUniqueProducts = useCallback(async () => {
    try {
      const response = await apiService.getUniqueProducts();
      if (response.success) {
        setUniqueProducts(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching unique products:', error);
    }
  }, []);

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      
      await apiService.downloadCustomerOutstandingPDF({
        search: searchQuery,
        minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
        status: filters.status || undefined,
        product: filters.product || undefined,
        groupBy: filters.groupBy,
      });

      setSuccessMessage('PDF downloaded successfully');
      setShowSuccessNotification(true);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      setError('Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(0);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Auto-search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput.trim());
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Initial data load
  useEffect(() => {
    fetchUniqueProducts();
  }, [fetchUniqueProducts]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchCustomerOutstanding();
  }, [fetchCustomerOutstanding]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      status: '',
      product: '',
      groupBy: 'customer',
    });
    setSearchInput('');
    setSearchQuery('');
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'error';
      case 'partially_paid':
        return 'warning';
      case 'unpaid':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'OVERDUE';
      case 'partially_paid':
        return 'PARTIALLY PAID';
      case 'unpaid':
        return 'UNPAID';
      default:
        return status.toUpperCase();
    }
  };



  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Customer Outstanding Amounts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track unpaid amounts grouped by product
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Outstanding
              </Typography>
                             <Typography variant="h5" component="div" color="error.main" fontWeight="bold">
                 AED {summaryStats.totalOutstanding.toLocaleString()}
               </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h5" component="div">
                {summaryStats.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Overdue Customers
              </Typography>
              <Typography variant="h5" component="div" color="error.main">
                {summaryStats.overdueCustomers}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Partially Paid
              </Typography>
              <Typography variant="h5" component="div" color="warning.main">
                {summaryStats.partiallyPaidCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ 
        p: 2, mb: 3,
        bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
        border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(2,6,23,0.06)',
        borderRadius: 3,
      }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search customers, products, amounts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if ((e as any).key === 'Enter') handleSearch(); }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                backgroundColor: mode === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(2,6,23,0.03)',
                boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.15)',
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 1 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchInput && (
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
          <Stack direction="row" spacing={2}>
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
              onClick={handleClearFilters}
              disabled={loading}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
            >
              Clear
            </Button>
            
            <BeautifulDownloadButton
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || outstandingData.length === 0}
              loading={downloadingPDF}
            />
            
            <BeautifulRefreshButton
              onClick={fetchCustomerOutstanding}
              disabled={loading}
            />
          </Stack>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Group By</InputLabel>
              <Select
                value={filters.groupBy}
                label="Group By"
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
            </FormControl>

            {filters.groupBy === 'product' && (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Product</InputLabel>
                <Select
                  value={filters.product}
                  label="Product"
                  onChange={(e) => handleFilterChange('product', e.target.value)}
                >
                  <MenuItem value="">All Products</MenuItem>
                  {uniqueProducts?.map((product) => (
                    <MenuItem key={product} value={product}>
                      {product}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Min Amount"
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">AED</InputAdornment>,
              }}
              sx={{ minWidth: 150 }}
            />
            
            <TextField
              label="Max Amount"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">AED</InputAdornment>,
              }}
              sx={{ minWidth: 150 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
                <MenuItem value="partially_paid">Partially Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Collapse>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Results */}
      {!loading && outstandingData.length === 0 && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No outstanding amounts found
          </Typography>
        </Paper>
      )}

      {/* Table */}
      {!loading && outstandingData.length > 0 && (
        <Paper>
          {filters.groupBy === 'product' ? (
            // Product Grouped View - Compact and Theme-Consistent
            <Box>
              {outstandingData?.map((productData) => {
                const product = productData as ProductOutstanding;
                return (
                  <Box key={product._id} sx={{ mb: 3 }}>
                    {/* Product Header - Compact */}
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc', 
                      border: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '8px 8px 0 0',
                      mb: 0
                    }}>
                      <Typography variant="h6" fontWeight="600" sx={{ 
                        color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                        mb: 0.5
                      }}>
                        {product.productName}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: mode === 'dark' ? '#94a3b8' : '#64748b',
                        fontSize: '0.875rem'
                      }}>
                        Total Outstanding: AED {product.totalOutstanding.toLocaleString()} | 
                        {product.totalCustomers} Customer{product.totalCustomers !== 1 ? 's' : ''} | 
                        {product.totalInvoices} Invoice{product.totalInvoices !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    {/* Customers Table - Matching Original Style */}
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ 
                              bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc',
                              borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                              fontWeight: 600,
                              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}>
                              Customer Name
                            </TableCell>
                            <TableCell align="right" sx={{ 
                              bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc',
                              borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                              fontWeight: 600,
                              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}>
                              Outstanding Amount
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc',
                              borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                              fontWeight: 600,
                              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}>
                              Invoices
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc',
                              borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                              fontWeight: 600,
                              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}>
                              Unpaid
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc',
                              borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                              fontWeight: 600,
                              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}>
                              Partially Paid
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc',
                              borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                              fontWeight: 600,
                              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}>
                              Overdue
                            </TableCell>
                            <TableCell align="center" sx={{ 
                              bgcolor: mode === 'dark' ? '#1e293b' : '#f8fafc',
                              borderColor: mode === 'dark' ? '#334155' : '#e2e8f0',
                              fontWeight: 600,
                              color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}>
                              Status
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {product.customers?.map((customer) => (
                            <TableRow key={customer._id} hover>
                              <TableCell sx={{ 
                                borderColor: mode === 'dark' ? '#334155' : '#e2e8f0'
                              }}>
                                <Typography variant="body2" fontWeight="500">
                                  {customer.customerName}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                borderColor: mode === 'dark' ? '#334155' : '#e2e8f0'
                              }}>
                                <Typography variant="body2" color="error.main" fontWeight="600">
                                  AED {customer.totalOutstanding.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                borderColor: mode === 'dark' ? '#334155' : '#e2e8f0'
                              }}>
                                <Typography variant="body2">
                                  {customer.invoiceCount}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                borderColor: mode === 'dark' ? '#334155' : '#e2e8f0'
                              }}>
                                <Typography variant="body2" color="info.main">
                                  {customer.unpaidInvoices}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                borderColor: mode === 'dark' ? '#334155' : '#e2e8f0'
                              }}>
                                <Typography variant="body2" color="warning.main">
                                  {customer.partiallyPaidInvoices}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                borderColor: mode === 'dark' ? '#334155' : '#e2e8f0'
                              }}>
                                <Typography variant="body2" color="error.main">
                                  {customer.overdueInvoices}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                borderColor: mode === 'dark' ? '#334155' : '#e2e8f0'
                              }}>
                                <Chip
                                  label={getStatusLabel(customer.status)}
                                  color={getStatusColor(customer.status) as any}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                );
              })}
            </Box>
          ) : (
            // Customer Grouped View (Original)
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Customer Name</strong></TableCell>
                    <TableCell align="right"><strong>Outstanding Amount</strong></TableCell>
                    <TableCell align="center"><strong>Total Invoices</strong></TableCell>
                    <TableCell align="center"><strong>Unpaid</strong></TableCell>
                    <TableCell align="center"><strong>Partially Paid</strong></TableCell>
                    <TableCell align="center"><strong>Overdue</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Last Payment</strong></TableCell>
                    <TableCell align="center"><strong>Oldest Due Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outstandingData?.map((customer) => {
                    const customerData = customer as CustomerOutstanding;
                    return (
                      <TableRow key={customerData._id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {customerData.customerName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                            AED {customerData.totalOutstanding.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {customerData.invoiceCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="info.main">
                            {customerData.unpaidInvoices}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="warning.main">
                            {customerData.partiallyPaidInvoices}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="error.main">
                            {customerData.overdueInvoices}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(customerData.status)}
                            color={getStatusColor(customerData.status) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {customerData.lastPaymentDate 
                              ? new Date(customerData.lastPaymentDate).toLocaleDateString('en-GB')
                              : 'Never'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {new Date(customerData.oldestDueDate).toLocaleDateString('en-GB')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>
      )}

      {/* Success Notification */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={6000}
        onClose={() => setShowSuccessNotification(false)}
      >
        <Alert 
          onClose={() => setShowSuccessNotification(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerOutstandingPage;
