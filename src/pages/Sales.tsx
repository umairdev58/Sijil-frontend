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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Warning as WarningIcon,
  Security as SecurityIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import apiService from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sales } from '../types';
import BeautifulRefreshButton from '../components/BeautifulRefreshButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ColumnToggle, { ColumnConfig } from '../components/ColumnToggle';
import { useColumnToggle } from '../hooks/useColumnToggle';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [saleToDelete, setSaleToDelete] = useState<Sales | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);
  const { mode } = useAppTheme();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');

  // Column configuration for table
  const defaultColumns: ColumnConfig[] = [
    { id: 'invoiceNumber', label: 'Invoice Number', visible: true, order: 1, required: true },
    { id: 'customer', label: 'Customer', visible: true, order: 2, required: true },
    { id: 'product', label: 'Product', visible: true, order: 3 },
    { id: 'containerNo', label: 'Container No', visible: true, order: 4 },
    { id: 'marka', label: 'Marka', visible: false, order: 5 },
    { id: 'description', label: 'Description', visible: false, order: 6 },
    { id: 'quantity', label: 'Quantity', visible: true, order: 7 },
    { id: 'rate', label: 'Rate', visible: false, order: 8 },
    { id: 'amount', label: 'Amount', visible: true, order: 9, required: true },
    { id: 'receivedAmount', label: 'Received', visible: true, order: 10 },
    { id: 'outstandingAmount', label: 'Outstanding', visible: true, order: 11, required: true },
    { id: 'status', label: 'Status', visible: true, order: 12, required: true },
    { id: 'dueDate', label: 'Due Date', visible: false, order: 13 },
    { id: 'actions', label: 'Actions', visible: true, order: 14, required: true },
  ];

  const {
    columns,
    visibleColumns,
    toggleColumn,
    selectAllColumns,
    selectNoneColumns,
    resetToDefault,
  } = useColumnToggle({
    defaultColumns,
    storageKey: 'sales-table-columns',
    requiredColumns: ['invoiceNumber', 'customer', 'amount', 'outstandingAmount', 'status', 'actions'],
  });

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

  // Remove auto-search on pause; search triggers only on Enter via onKeyDown
  // (Intentionally no useEffect syncing searchInput -> searchQuery)

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

  const handleDeleteClick = (sale: Sales) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
    setDeletePassword('');
  };

  const handleDeleteConfirm = async () => {
    if (!saleToDelete || !deletePassword.trim()) {
      setError('Please enter your admin password');
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await apiService.deleteSale(saleToDelete._id, deletePassword);
      if (response.success) {
        setSales(prev => prev.filter(sale => sale._id !== saleToDelete._id));
        setDeleteDialogOpen(false);
        setSaleToDelete(null);
        setDeletePassword('');
        setError(null);
      } else {
        setError(response.message || 'Failed to delete sale');
      }
    } catch (err: any) {
      console.error('Error deleting sale:', err);
      setError(err.response?.data?.message || 'Failed to delete sale');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSaleToDelete(null);
    setDeletePassword('');
    setError(null);
  };

  // Helper function to get status color
  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'error';
      case 'partially_paid':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to render cell content based on column ID
  const renderCellContent = (sale: Sales, columnId: string) => {
    switch (columnId) {
      case 'invoiceNumber':
        return (
          <Typography variant="body2" fontFamily="monospace">
            {sale.invoiceNumber || 'N/A'}
          </Typography>
        );
      case 'customer':
        return (
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
        );
      case 'product':
        return (
          <Typography variant="body2">
            {sale.product || 'Unknown Product'}
          </Typography>
        );
      case 'containerNo':
        return (
          <Typography variant="body2">
            {sale.containerNo || 'N/A'}
          </Typography>
        );
      case 'marka':
        return (
          <Typography variant="body2">
            {sale.marka || 'N/A'}
          </Typography>
        );
      case 'description':
        return (
          <Typography variant="body2">
            {sale.description || 'N/A'}
          </Typography>
        );
      case 'quantity':
        return (
          <Typography variant="body2">
            {sale.quantity?.toLocaleString() || 'N/A'}
          </Typography>
        );
      case 'rate':
        return (
          <Typography variant="body2">
            {sale.rate ? `AED ${sale.rate.toFixed(2)}` : 'N/A'}
          </Typography>
        );
      case 'amount':
        return (
          <Typography variant="body2" fontWeight="medium">
            AED {(sale.amount || 0).toLocaleString()}
          </Typography>
        );
      case 'receivedAmount':
        return (
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
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        );
      case 'outstandingAmount':
        return (
          <Typography variant="body2" fontWeight="medium" color={sale.outstandingAmount > 0 ? 'error.main' : 'success.main'}>
            AED {(sale.outstandingAmount || 0).toLocaleString()}
          </Typography>
        );
      case 'status':
        return (
          <Chip
            label={sale.status?.replace('_', ' ').toUpperCase() || 'N/A'}
            color={getStatusColor(sale.status) as any}
            size="small"
          />
        );
      case 'dueDate':
        return (
          <Typography variant="body2">
            {sale.dueDate ? new Date(sale.dueDate).toLocaleDateString() : 'N/A'}
          </Typography>
        );
      case 'actions':
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/sales/${sale._id}`)}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Payment">
              <IconButton
                size="small"
                onClick={() => navigate(`/sales/${sale._id}`)}
                disabled={sale.outstandingAmount <= 0}
              >
                <PaymentIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Invoice">
              <IconButton
                size="small"
                onClick={() => window.open(`/api/sales/${sale._id}/print`, '_blank')}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            {user?.role === 'admin' && (
              <Tooltip title="Delete Sale">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(sale)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      default:
        return '-';
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

  // On first mount, hydrate state from URL params if present, then mark hydrated
  useEffect(() => {
    const qp = Object.fromEntries(searchParams.entries());
    const nextFilters = { ...filters } as any;
    let needUpdate = false;

    // Hydrate filters
    const map = ['customer','supplier','containerNo','product','status','startDate','endDate','dueStartDate','dueEndDate','minAmount','maxAmount','minOutstanding','maxOutstanding'] as const;
    map.forEach((key) => {
      if (qp[key] !== undefined) {
        (nextFilters as any)[key] = qp[key] as string;
        needUpdate = true;
      }
    });

    // Hydrate search, pagination
    if (qp.search) { setSearchQuery(qp.search); }
    if (qp.page) { setPage(Math.max(0, parseInt(qp.page) || 0)); }
    if (qp.rows) { setRowsPerPage(Math.max(1, parseInt(qp.rows) || 10)); }

    if (needUpdate) {
      setFilters(nextFilters);
      setDebouncedFilters(nextFilters);
    }

    // Mark hydrated before any fetches so other effects can run with correct state
    setHydratedFromUrl(true);

    fetchCustomers();

    if (qp.newSale === 'true') {
      setShowSuccessNotification(true);
      searchParams.delete('newSale');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch data when pagination changes (only after hydration)
  useEffect(() => {
    if (!hydratedFromUrl) return;
    fetchSales();
  }, [page, rowsPerPage, hydratedFromUrl]);

  // Refetch data when search or filters change
  // Debounce filters by 400ms to reduce fetch churn while typing
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    if (!hydratedFromUrl) return;
    setPage(0);
    fetchSales();
  }, [searchQuery, debouncedFilters, hydratedFromUrl]);

  // Initial fetch once hydrated (covers cases with no further changes)
  useEffect(() => {
    if (!hydratedFromUrl) return;
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydratedFromUrl]);

  // Keep URL in sync with current filter/search/pagination state so that back navigation restores it
  useEffect(() => {
    const qp: any = {};
    const f = debouncedFilters;
    // Only write non-empty filters to keep URL short
    Object.entries(f).forEach(([k, v]) => { if (v) qp[k] = v; });
    if (searchQuery) qp.search = searchQuery;
    if (page) qp.page = String(page);
    if (rowsPerPage !== 10) qp.rows = String(rowsPerPage);
    setSearchParams(qp, { replace: true });
  }, [debouncedFilters, searchQuery, page, rowsPerPage, setSearchParams]);

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
            <ColumnToggle
              columns={columns}
              onColumnToggle={toggleColumn}
              onSelectAll={selectAllColumns}
              onSelectNone={selectNoneColumns}
              onResetToDefault={resetToDefault}
              variant="button"
              size="small"
            />
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
                {visibleColumns.map((column) => (
                  <TableCell 
                    key={column.id}
                    align={['amount', 'receivedAmount', 'outstandingAmount', 'quantity', 'rate'].includes(column.id) ? 'right' : 'left'}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSales.map((sale) => (
                <React.Fragment key={sale._id}>
                  <TableRow>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.id}>
                        {renderCellContent(sale, column.id)}
                      </TableCell>
                    ))}
                  </TableRow>

                                     {/* Expandable Row */}
                   {expandedRows.includes(sale._id) && (
                     <TableRow>
                       <TableCell colSpan={visibleColumns.length} sx={{ py: 2 }}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
            color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
            borderRadius: 3,
            boxShadow: mode === 'dark' 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          borderBottom: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '50%',
              bgcolor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WarningIcon sx={{ 
                color: '#ef4444', 
                fontSize: 28 
              }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                mb: 0.5
              }}>
                Delete Sale Record
              </Typography>
              <Typography variant="body2" sx={{ 
                color: mode === 'dark' ? '#94a3b8' : '#64748b',
                fontWeight: 500
              }}>
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ 
            mb: 3, 
            color: mode === 'dark' ? '#cbd5e1' : '#475569',
            lineHeight: 1.6
          }}>
            Are you sure you want to permanently delete this sale record? This will also remove all associated payment history.
          </Typography>
          
          {saleToDelete && (
            <Card sx={{ 
              mb: 3, 
              bgcolor: mode === 'dark' ? '#334155' : '#f8fafc',
              border: mode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ 
                    bgcolor: mode === 'dark' ? '#3b82f6' : '#2563eb',
                    width: 40,
                    height: 40
                  }}>
                    <ReceiptIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                  }}>
                    Sale Details
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      color: mode === 'dark' ? '#94a3b8' : '#64748b',
                      fontWeight: 500
                    }}>
                      Invoice Number:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                    }}>
                      {saleToDelete.invoiceNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      color: mode === 'dark' ? '#94a3b8' : '#64748b',
                      fontWeight: 500
                    }}>
                      Customer:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                    }}>
                      {saleToDelete.customer}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      color: mode === 'dark' ? '#94a3b8' : '#64748b',
                      fontWeight: 500
                    }}>
                      Amount:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 700,
                      color: mode === 'dark' ? '#10b981' : '#059669',
                      fontSize: '1.1rem'
                    }}>
                      AED {saleToDelete.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
          
          <Box sx={{ 
            p: 2.5, 
            bgcolor: mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)',
            borderRadius: 2,
            border: mode === 'dark' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <SecurityIcon sx={{ 
                color: mode === 'dark' ? '#3b82f6' : '#2563eb',
                fontSize: 20
              }} />
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600,
                color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
              }}>
                Admin Password Verification Required
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="password"
              placeholder="Enter your admin password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              variant="outlined"
              size="medium"
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? '#475569' : '#d1d5db',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? '#64748b' : '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? '#3b82f6' : '#2563eb',
                    borderWidth: 2,
                  },
                  '&.Mui-error fieldset': {
                    borderColor: '#ef4444',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: mode === 'dark' ? '#94a3b8' : '#6b7280',
                  fontWeight: 500,
                },
                '& .MuiInputBase-input': {
                  color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                  fontWeight: 500,
                  py: 1.5,
                },
                '& .MuiFormHelperText-root': {
                  color: mode === 'dark' ? '#f87171' : '#dc2626',
                  fontWeight: 500,
                },
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          gap: 2,
          borderTop: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleteLoading}
            variant="outlined"
            size="large"
            sx={{
              minWidth: 120,
              py: 1.5,
              borderColor: mode === 'dark' ? '#475569' : '#d1d5db',
              color: mode === 'dark' ? '#cbd5e1' : '#6b7280',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                bgcolor: mode === 'dark' ? '#334155' : '#f8fafc',
                borderColor: mode === 'dark' ? '#64748b' : '#9ca3af',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading || !deletePassword.trim()}
            startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            size="large"
            sx={{
              minWidth: 140,
              py: 1.5,
              bgcolor: '#dc2626',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.3)',
              '&:hover': {
                bgcolor: '#b91c1c',
                boxShadow: '0 6px 20px 0 rgba(220, 38, 38, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                bgcolor: mode === 'dark' ? '#374151' : '#d1d5db',
                color: mode === 'dark' ? '#6b7280' : '#9ca3af',
                boxShadow: 'none',
                transform: 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesPage; 