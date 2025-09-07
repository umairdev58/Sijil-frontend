import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  LinearProgress,
  Collapse,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import apiService from '../services/api';
import { CustomerOutstanding } from '../types';
import BeautifulDownloadButton from '../components/BeautifulDownloadButton';
import BeautifulRefreshButton from '../components/BeautifulRefreshButton';

const CustomerOutstandingPage: React.FC = () => {
  const [customerOutstanding, setCustomerOutstanding] = useState<CustomerOutstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    status: '',
  });

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalOutstanding: 0,
    totalCustomers: 0,
    overdueCustomers: 0,
    partiallyPaidCustomers: 0,
    unpaidCustomers: 0,
  });

  const fetchCustomerOutstanding = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getCustomerOutstanding({
        search: searchQuery,
        minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
        status: filters.status || undefined,
        page: page + 1,
        limit: rowsPerPage,
      });
      
      if (response.success) {
        setCustomerOutstanding(response.data);
        setTotalCount(response.pagination.total);
        setSummaryStats(response.summary);
      }
    } catch (error: any) {
      console.error('Error fetching customer outstanding:', error);
      setError(error.response?.data?.message || 'Failed to fetch customer outstanding amounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      
      await apiService.downloadCustomerOutstandingPDF({
        search: searchQuery,
        minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
        status: filters.status || undefined,
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
    setPage(0);
    fetchCustomerOutstanding();
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch data when page or rowsPerPage changes
  useEffect(() => {
    fetchCustomerOutstanding();
  }, [page, rowsPerPage]);

  // Initial data load
  useEffect(() => {
    fetchCustomerOutstanding();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      status: '',
    });
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Outstanding Amounts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track unpaid amounts for each customer
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            disabled={loading}
          >
            Clear
          </Button>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <BeautifulDownloadButton
            onClick={handleDownloadPDF}
            disabled={downloadingPDF || customerOutstanding.length === 0}
            loading={downloadingPDF}
          />
          
          <BeautifulRefreshButton
            onClick={fetchCustomerOutstanding}
            disabled={loading}
          />
        </Stack>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
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
      {!loading && customerOutstanding.length === 0 && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No customers with outstanding amounts found
          </Typography>
        </Paper>
      )}

      {/* Table */}
      {!loading && customerOutstanding.length > 0 && (
        <Paper>
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
                {customerOutstanding.map((customer) => (
                    <TableRow key={customer._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {customer.customerName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                                                 <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                           AED {customer.totalOutstanding.toLocaleString()}
                         </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {customer.invoiceCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="info.main">
                          {customer.unpaidInvoices}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="warning.main">
                          {customer.partiallyPaidInvoices}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="error.main">
                          {customer.overdueInvoices}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(customer.status)}
                          color={getStatusColor(customer.status) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {customer.lastPaymentDate 
                            ? new Date(customer.lastPaymentDate).toLocaleDateString('en-GB')
                            : 'Never'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {new Date(customer.oldestDueDate).toLocaleDateString('en-GB')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
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
