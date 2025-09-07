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
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  Print as PrintIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { Snackbar } from '@mui/material';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Sales } from '../types';
import BeautifulRefreshButton from '../components/BeautifulRefreshButton';
import LoadingSpinner from '../components/LoadingSpinner';

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sales[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [filteredStats, setFilteredStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalReceived: 0,
    totalOutstanding: 0,
    collectionRate: 0,
    unpaidCount: 0,
    paidCount: 0,
    partiallyPaidCount: 0,
    overdueCount: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const navigate = useNavigate();
  const { mode } = useAppTheme();
  const [searchInput, setSearchInput] = useState('');

  // Filter states with default current month filter
  const getCurrentMonthDates = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    };
  };

  const currentMonthDates = getCurrentMonthDates();
  
  const [filters, setFilters] = useState({
    customer: '',
    supplier: '',
    containerNo: '',
    product: '',
    status: '',
    startDate: currentMonthDates.startDate,
    endDate: currentMonthDates.endDate,
    dueStartDate: '',
    dueEndDate: '',
    minAmount: '',
    maxAmount: '',
    minOutstanding: '',
    maxOutstanding: '',
  });

  // Debounced filters to prevent refetching on every keystroke
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce search input updates to reduce API calls
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Date presets
  const applyLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    setFilters((f) => ({
      ...f,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }));
  };
  const applyThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFilters((f) => ({
      ...f,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }));
  };
  const applyYTD = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    setFilters((f) => ({
      ...f,
      startDate: start.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }));
  };

  // Use overall statistics from backend instead of calculating from current page data

  const getStatusBadge = (status: string | undefined | null) => {
    if (!status) {
      return <Chip label="Unknown" color="default" size="small" />;
    }
    
    switch (status.toLowerCase()) {
      case "paid":
        return <Chip label="Paid" color="success" size="small" />;
      case "partially_paid":
        return <Chip label="Partially Paid" color="warning" size="small" />;
      case "unpaid":
        return <Chip label="Unpaid" color="info" size="small" />;
      case "overdue":
        return <Chip label="Overdue" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  const toggleRowExpansion = (saleId: string) => {
    setExpandedRows((prev) => 
      prev.includes(saleId) 
        ? prev.filter((id) => id !== saleId) 
        : [...prev, saleId]
    );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const apiFilters: any = {
        page: page + 1, // Backend uses 1-based pagination
        limit: rowsPerPage,
        search: searchQuery,
        customer: debouncedFilters.customer,
        supplier: debouncedFilters.supplier,
        containerNo: debouncedFilters.containerNo,
        product: debouncedFilters.product,
        status: debouncedFilters.status && debouncedFilters.status !== 'not_paid' ? debouncedFilters.status : undefined,
        statuses: debouncedFilters.status === 'not_paid' ? 'unpaid,partially_paid,overdue' : undefined,
        startDate: debouncedFilters.startDate,
        endDate: debouncedFilters.endDate,
        dueStartDate: debouncedFilters.dueStartDate,
        dueEndDate: debouncedFilters.dueEndDate,
        minAmount: debouncedFilters.minAmount ? parseFloat(debouncedFilters.minAmount) : undefined,
        maxAmount: debouncedFilters.maxAmount ? parseFloat(debouncedFilters.maxAmount) : undefined,
        minOutstanding: debouncedFilters.minOutstanding ? parseFloat(debouncedFilters.minOutstanding) : undefined,
        maxOutstanding: debouncedFilters.maxOutstanding ? parseFloat(debouncedFilters.maxOutstanding) : undefined,
      };
      
      const response = await apiService.getSales(apiFilters);
      if (response.success) {
        setSales(response.data);
        setTotalSalesCount(response.pagination?.totalSales || 0);
        
        // Use filtered statistics from backend (reflects current filter state)
        if (response.filteredStatistics) {
          const stats = response.filteredStatistics;
          setFilteredStats({
            totalSales: stats.totalCount || 0,
            totalAmount: stats.totalSales || 0,
            totalReceived: stats.totalReceived || 0,
            totalOutstanding: stats.totalOutstanding || 0,
            collectionRate: stats.totalSales > 0 ? ((stats.totalReceived || 0) / stats.totalSales) * 100 : 0,
            unpaidCount: stats.unpaidCount || 0,
            paidCount: stats.paidCount || 0,
            partiallyPaidCount: stats.partiallyPaidCount || 0,
            overdueCount: stats.overdueCount || 0
          });
        }
      } else {
        setError('Failed to fetch sales');
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await apiService.getCustomers();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        const response = await apiService.deleteSale(id);
        if (response.success) {
          setSales(prev => prev.filter(sale => sale._id !== id));
      } else {
          setError('Failed to delete sale');
        }
    } catch (err) {
        console.error('Error deleting sale:', err);
        setError('Failed to delete sale');
      }
    }
  };

  const handleEdit = (sale: Sales) => {
    navigate(`/sales/${sale._id}/edit`);
  };

  const handleView = (sale: Sales) => {
    navigate(`/sales/${sale._id}`);
  };

  const handleAddPayment = (sale: Sales) => {
    navigate(`/sales/${sale._id}?mode=addPayment`);
  };

  // Use sales directly since filtering is now done on the server
  const paginatedSales = sales;

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    
    // Check if we're coming from creating a new sale
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('newSale') === 'true') {
      setShowSuccessNotification(true);
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Refetch data when pagination changes
  useEffect(() => {
    fetchSales();
  }, [page, rowsPerPage]);

  // Refetch data when search or filters change
  // Debounce filters by 400ms to reduce fetch churn while typing
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    setPage(0);
    fetchSales();
  }, [searchQuery, debouncedFilters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner size="large" variant="dots" message="Loading sales data..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
              Sales Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => navigate('/sales-report')}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
          >
            Sales Report
          </Button>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/sales/new')}
            sx={{
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              bgcolor: mode === 'dark' ? '#8b5cf6' : '#1e3a8a',
              color: '#ffffff',
              '&:hover': {
                bgcolor: mode === 'dark' ? '#7c3aed' : '#1e40af',
              }
            }}
          >
            New Sale
          </Button>
        </Stack>
      </Box>

        {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
                Total Sales
            </Typography>
            <Typography variant="h4" component="div">
              {filteredStats.totalSales}
            </Typography>
            <LinearProgress variant="determinate" value={85} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Outstanding Amount
            </Typography>
            <Typography variant="h4" component="div" color="error">
              AED {filteredStats.totalOutstanding.toLocaleString()}
            </Typography>
            <LinearProgress variant="determinate" value={55} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Received Amount
            </Typography>
            <Typography variant="h4" component="div" color="success.main">
              AED {filteredStats.totalReceived.toLocaleString()}
            </Typography>
            <LinearProgress variant="determinate" value={75} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
                Collection Rate
            </Typography>
            <Typography variant="h4" component="div" color="primary">
              {filteredStats.collectionRate.toFixed(1)}%
            </Typography>
            <LinearProgress variant="determinate" value={filteredStats.collectionRate} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
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
            placeholder="Search sales, customers, container, product..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if ((e as any).key === 'Enter') setSearchQuery(searchInput.trim()); }}
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
                    <IconButton size="small" onClick={() => { setSearchInput(''); setSearchQuery(''); }}>
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
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
                >
              Filters
          </Button>
            <BeautifulRefreshButton 
              onClick={fetchSales} 
              variant="outlined"
              buttonText="Refresh"
            />
          </Stack>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 2, bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(2,6,23,0.02)', border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(2,6,23,0.06)', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Filters
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip label="This Month" onClick={applyThisMonth} clickable color="primary" variant="outlined" />
              <Chip label="Last 7 Days" onClick={applyLast7Days} clickable variant="outlined" />
              <Chip label="YTD" onClick={applyYTD} clickable variant="outlined" />
              <Chip label={filters.status ? `Status: ${filters.status.replace('_',' ')}` : 'Any Status'} onClick={() => setFilters({ ...filters, status: '' })} onDelete={filters.status ? () => setFilters({ ...filters, status: '' }) : undefined} variant={filters.status ? 'filled' : 'outlined'} color={filters.status ? 'secondary' : 'default'} />
            </Stack>
            
            {/* Basic Filters */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Customer"
                value={filters.customer}
                onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
              />
              <TextField
                fullWidth
                label="Supplier"
                value={filters.supplier}
                onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
              />
              <TextField
                fullWidth
                label="Container No"
                value={filters.containerNo}
                onChange={(e) => setFilters({ ...filters, containerNo: e.target.value })}
              />
              <TextField
                fullWidth
                label="Product"
                value={filters.product}
                onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              />
            </Box>

            {/* Status and Date Filters */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="not_paid">Not Paid (Unpaid, Partially Paid, Overdue)</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partially_paid">Partially Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="date"
                label="Invoice Date From"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="Invoice Date To"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="Due Date From"
                value={filters.dueStartDate}
                onChange={(e) => setFilters({ ...filters, dueStartDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Amount Filters */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Min Amount"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Max Amount"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Min Outstanding"
                value={filters.minOutstanding}
                onChange={(e) => setFilters({ ...filters, minOutstanding: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Max Outstanding"
                value={filters.maxOutstanding}
                onChange={(e) => setFilters({ ...filters, maxOutstanding: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
              />
            </Box>

            {/* Filter Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setFilters({
                  customer: '',
                  supplier: '',
                  containerNo: '',
                  product: '',
                  status: '',
                  startDate: '',
                  endDate: '',
                  dueStartDate: '',
                  dueEndDate: '',
                  minAmount: '',
                  maxAmount: '',
                  minOutstanding: '',
                  maxOutstanding: '',
                })}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
              >
                Clear All Filters
              </Button>
              <Button
                variant="contained"
                onClick={() => setShowFilters(false)}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
              >
                Apply Filters
              </Button>
            </Box>
            </Paper>
          </Box>
        </Collapse>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {Math.min((page * rowsPerPage) + 1, totalSalesCount)} - {Math.min((page + 1) * rowsPerPage, totalSalesCount)} of {totalSalesCount} sales
        </Typography>
        {sales.length === 0 && totalSalesCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setFilters({
                customer: '',
                supplier: '',
                containerNo: '',
                product: '',
                status: '',
                startDate: '',
                endDate: '',
                dueStartDate: '',
                dueEndDate: '',
                minAmount: '',
                maxAmount: '',
                minOutstanding: '',
                maxOutstanding: '',
              });
              setSearchQuery('');
            }}
          >
            Clear All Filters
          </Button>
        )}
      </Box>

      {/* Sales Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                                  {paginatedSales.map((sale) => (
                <React.Fragment key={sale._id}>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {sale.invoiceNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {sale.customer ? sale.customer.charAt(0).toUpperCase() : 'C'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {sale.customer || 'Unknown Customer'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {sale.containerNo || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {sale.product || 'Unknown Product'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        AED {(sale.amount || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="success.main">
                            Received:
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            AED {(sale.receivedAmount || 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="error">
                            Outstanding:
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            AED {(sale.outstandingAmount || 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={sale.amount ? ((sale.receivedAmount || 0) / sale.amount) * 100 : 0}
                          sx={{ height: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sale.status)}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Print Invoice">
                          <IconButton size="small" onClick={() => apiService.printInvoice(sale._id)}>
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleView(sale)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Payment">
                          <IconButton 
                            size="small" 
                            onClick={() => handleAddPayment(sale)}
                            color="primary"
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(sale)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(sale._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                        </TableCell>
                      </TableRow>

                                     {/* Expandable Row */}
                   {expandedRows.includes(sale._id) && (
                     <TableRow>
                       <TableCell colSpan={7} sx={{ py: 2 }}>
                         <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                           <Typography variant="h6" gutterBottom>
                             Payment Details
                           </Typography>
                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                             <Box>
                               <Typography variant="subtitle2" gutterBottom>
                                    Payment History
                               </Typography>
                               <Typography variant="body2" color="textSecondary">
                                 No payments received yet
                               </Typography>
                             </Box>
                             <Box>
                               <Typography variant="subtitle2" gutterBottom>
                                    Payment Details
                               </Typography>
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                 <Typography variant="body2">Payment Terms:</Typography>
                                 <Typography variant="body2" fontWeight="medium">Net 30</Typography>
                               </Box>
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                 <Typography variant="body2">Due Date:</Typography>
                                 <Typography variant="body2" fontWeight="medium">
                                   {sale.dueDate || 'N/A'}
                                 </Typography>
                               </Box>
                               {(sale.outstandingAmount || 0) > 0 && (
                                 <Alert severity="warning" sx={{ mt: 2 }}>
                                   Outstanding Balance: AED {(sale.outstandingAmount || 0).toLocaleString()}
                                 </Alert>
                               )}
                             </Box>
                           </Box>
                         </Paper>
                          </TableCell>
                        </TableRow>
                   )}
                </React.Fragment>
                  ))}
                </TableBody>
              </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalSalesCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        />
      </Paper>
      
      {/* Success Notification */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={6000}
        onClose={() => setShowSuccessNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSuccessNotification(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          New sale has been created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesPage; 