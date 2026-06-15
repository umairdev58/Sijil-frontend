import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  Snackbar,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Money as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  Assessment as ReportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import { FreightInvoice, FreightPayment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import BeautifulRefreshButton from '../components/BeautifulRefreshButton';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { ColumnConfig } from '../components/ColumnToggle';
import { useColumnToggle } from '../hooks/useColumnToggle';
import { getPaymentAmountError, getApiErrorMessage, formatAED } from '../utils/paymentValidation';

const FreightInvoices: React.FC = () => {
  const { mode } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState<FreightInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Enhanced filters
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(null);
  const [dueDateTo, setDueDateTo] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<FreightInvoice | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentType: 'partial' as 'partial' | 'full',
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'check' | 'card' | 'other',
    reference: '',
    notes: '',
    paymentDate: new Date(),
  });

  // Payment history dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [paymentHistory] = useState<FreightPayment[]>([]);
  const [historyLoading] = useState(false);

  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [reportGroupBy, setReportGroupBy] = useState<'none' | 'status' | 'month'>('none');
  const [includePayments, setIncludePayments] = useState(true);

  // Column configuration for table
  const defaultColumns: ColumnConfig[] = [
    { id: 'invoiceNumber', label: 'Invoice Number', visible: true, order: 1, required: true },
    { id: 'containerNo', label: 'Container No', visible: true, order: 2, required: true },
    { id: 'description', label: 'Description', visible: true, order: 3 },
    { id: 'vessel', label: 'Vessel', visible: false, order: 5 },
    { id: 'voyage', label: 'Voyage', visible: false, order: 6 },
    { id: 'port', label: 'Port', visible: false, order: 7 },
    { id: 'amount', label: 'Amount', visible: true, order: 8, required: true },
    { id: 'receivedAmount', label: 'Received', visible: true, order: 9 },
    { id: 'outstandingAmount', label: 'Outstanding', visible: true, order: 10, required: true },
    { id: 'status', label: 'Status', visible: true, order: 11, required: true },
    { id: 'dueDate', label: 'Due Date', visible: false, order: 12 },
    { id: 'actions', label: 'Actions', visible: true, order: 13, required: true },
  ];

  useColumnToggle({
    defaultColumns,
    storageKey: 'freight-invoices-table-columns',
    requiredColumns: ['invoiceNumber', 'containerNo', 'amount', 'outstandingAmount', 'status', 'actions'],
  });

  // Auto-search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput.trim());
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getFreightInvoices(
        page + 1,
        rowsPerPage,
        search,
        statusFilter,
        startDate?.toISOString() || '',
        endDate?.toISOString() || '',
        minAmount || '',
        maxAmount || '',
        dueDateFrom?.toISOString() || '',
        dueDateTo?.toISOString() || ''
      );
      if (res.success) {
        setRows(res.data);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (location.search.includes('newInvoice=true')) {
      setSuccess('Freight invoice created successfully!');
    }
  }, [location]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await apiService.deleteFreightInvoice(id);
      setSuccess('Invoice deleted successfully');
      load();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    }
  };

  const handleAddPayment = async () => {
    if (!selectedInvoice || !paymentData.amount) return;

    const amount = parseFloat(paymentData.amount);
    const validationError = getPaymentAmountError(amount, selectedInvoice.outstanding_amount_aed);
    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    try {
      setPaymentError(null);
      const res = await apiService.addFreightPayment(selectedInvoice._id, {
        amount: parseFloat(paymentData.amount),
        paymentType: paymentData.paymentType,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference,
        notes: paymentData.notes,
        paymentDate: paymentData.paymentDate.toISOString(),
      });
      
      if (res.success) {
        setSuccess('Payment added successfully');
        setPaymentDialogOpen(false);
        setPaymentError(null);
        setSelectedInvoice(null);
        setPaymentData({
          amount: '',
          paymentType: 'partial',
          paymentMethod: 'cash',
          reference: '',
          notes: '',
          paymentDate: new Date(),
        });
        load();
      }
    } catch (e: any) {
      setPaymentError(getApiErrorMessage(e, 'Failed to add payment'));
    }
  };


  const handleGenerateReport = async () => {
    try {
      const options = {
        startDate: startDate?.toISOString().split('T')[0] || '',
        endDate: endDate?.toISOString().split('T')[0] || '',
        status: statusFilter || '',
        minAmount: minAmount || '',
        maxAmount: maxAmount || '',
        dueDateFrom: dueDateFrom?.toISOString().split('T')[0] || '',
        dueDateTo: dueDateTo?.toISOString().split('T')[0] || '',
        format: reportFormat,
        groupBy: reportGroupBy,
        includePayments: includePayments,
      };

      if (reportFormat === 'pdf') {
        await apiService.downloadFreightReportPDF(options);
      } else {
        await apiService.downloadFreightReportCSV(options);
      }
      
      setSuccess(`Freight report downloaded successfully as ${reportFormat.toUpperCase()}`);
      setReportDialogOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partially_paid': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon />;
      case 'partially_paid': return <ScheduleIcon />;
      case 'overdue': return <WarningIcon />;
      default: return <ErrorIcon />;
    }
  };

  const pageTotals = useMemo(() => {
    const totalAED = rows.reduce((sum, r) => sum + (r.amount_aed || 0), 0);
    const totalPaidAED = rows.reduce((sum, r) => sum + (r.paid_amount_aed || 0), 0);
    const totalOutstandingAED = rows.reduce((sum, r) => sum + (r.outstanding_amount_aed || 0), 0);
    const collectionRate = totalAED > 0 ? (totalPaidAED / totalAED) * 100 : 0;
    return { totalAED, totalPaidAED, totalOutstandingAED, collectionRate };
  }, [rows]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: 'PKR' | 'AED') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setStartDate(null);
    setEndDate(null);
    setMinAmount('');
    setMaxAmount('');
    setDueDateFrom(null);
    setDueDateTo(null);
  };

  const hasActiveFilters = () => {
    return search || statusFilter || startDate || endDate || 
           minAmount || maxAmount || dueDateFrom || dueDateTo;
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Freight Invoices
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ReportIcon />}
              onClick={() => setReportDialogOpen(true)}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
            >
              Generate Report
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/freight-invoices/new')}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                bgcolor: mode === 'dark' ? '#8b5cf6' : '#1e3a8a',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: mode === 'dark' ? '#7c3aed' : '#1e40af',
                },
              }}
            >
              New Invoice
            </Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h4" component="div">
                {totalCount}
              </Typography>
              <LinearProgress variant="determinate" value={totalCount > 0 ? 100 : 0} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(pageTotals.totalAED, 'AED')}
              </Typography>
              <LinearProgress variant="determinate" value={85} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Paid Amount
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {formatCurrency(pageTotals.totalPaidAED, 'AED')}
              </Typography>
              <LinearProgress variant="determinate" value={75} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Outstanding Amount
              </Typography>
              <Typography variant="h4" component="div" color="error">
                {formatCurrency(pageTotals.totalOutstandingAED, 'AED')}
              </Typography>
              <LinearProgress variant="determinate" value={pageTotals.collectionRate} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Box>

        <Paper sx={{
          p: 2,
          mb: 3,
          bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
          border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(2,6,23,0.06)',
          borderRadius: 3,
        }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search by invoice number, container, description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if ((e as any).key === 'Enter') setSearch(searchInput.trim()); }}
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
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
              >
                Filters
              </Button>
              <BeautifulRefreshButton
                onClick={load}
                variant="outlined"
                buttonText="Refresh"
              />
            </Stack>
          </Box>

          <Collapse in={showFilters}>
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(2,6,23,0.02)', border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(2,6,23,0.06)', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Advanced Filters
                </Typography>
                <Stack spacing={3}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="unpaid">Unpaid</MenuItem>
                          <MenuItem value="partially_paid">Partially Paid</MenuItem>
                          <MenuItem value="paid">Paid</MenuItem>
                          <MenuItem value="overdue">Overdue</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        placeholder="Min Amount (AED)"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        type="number"
                        fullWidth
                      />
                      
                      <TextField
                        placeholder="Max Amount"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        type="number"
                        fullWidth
                      />
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                      <DatePicker
                        label="From Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{
                          textField: { fullWidth: true },
                        }}
                      />
                      
                      <DatePicker
                        label="To Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{
                          textField: { fullWidth: true },
                        }}
                      />
                      
                      <DatePicker
                        label="Due Date From"
                        value={dueDateFrom}
                        onChange={(newValue) => setDueDateFrom(newValue)}
                        slotProps={{
                          textField: { fullWidth: true },
                        }}
                      />
                      
                      <DatePicker
                        label="Due Date To"
                        value={dueDateTo}
                        onChange={(newValue) => setDueDateTo(newValue)}
                        slotProps={{
                          textField: { fullWidth: true },
                        }}
                      />
                    </Box>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters()}
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
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          </Collapse>
        </Paper>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {rows.length === 0 ? 0 : page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} invoices
          </Typography>
        </Box>

        <Paper>
          {loading && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <LinearProgress />
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}>
                <LoadingSpinner size="small" variant="dots" showMessage={false} />
              </Box>
            </Box>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.paper' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Container</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount (AED)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Paid (AED)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Outstanding (AED)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Invoice Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last Payment</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                                       <TableRow key={row._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {row.invoice_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.container_number || '-'}</TableCell>
                    <TableCell>{row.description || '-'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(row.amount_aed, 'AED')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                       <Typography variant="body2" color="success.main" fontWeight="bold">
                         {formatCurrency(row.paid_amount_aed, 'AED')}
                       </Typography>
                     </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {formatCurrency(row.outstanding_amount_aed, 'AED')}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(row.invoice_date)}</TableCell>
                    <TableCell>{formatDate(row.due_date)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(row.status)}
                        label={row.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(row.status) as any}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.last_payment_date ? formatDate(row.last_payment_date) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {row.outstanding_amount_aed > 0 && (
                          <Tooltip title="Add Payment">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedInvoice(row);
                                setPaymentError(null);
                                setPaymentDialogOpen(true);
                              }}
                            >
                              <MoneyIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/freight-invoices/${row._id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/freight-invoices/${row._id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Add Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => { setPaymentDialogOpen(false); setPaymentError(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              {paymentError && (
                <Alert severity="error" onClose={() => setPaymentError(null)}>
                  {paymentError}
                </Alert>
              )}
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Invoice: <strong>{selectedInvoice?.invoice_number}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Container: <strong>{selectedInvoice?.container_number || 'N/A'}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Outstanding Amount: <strong>{selectedInvoice ? formatCurrency(selectedInvoice.outstanding_amount_aed, 'AED') : ''}</strong>
                </Typography>
              </Box>

              <TextField
                label="Payment Amount (AED) *"
                type="number"
                value={paymentData.amount}
                onChange={(e) => {
                  setPaymentData({ ...paymentData, amount: e.target.value });
                  setPaymentError(null);
                }}
                inputProps={{ min: 0.01, step: 0.01, max: selectedInvoice?.outstanding_amount_aed }}
                error={!!paymentData.amount && parseFloat(paymentData.amount) > (selectedInvoice?.outstanding_amount_aed || 0)}
                helperText={
                  selectedInvoice
                    ? `Maximum payable amount: ${formatAED(selectedInvoice.outstanding_amount_aed)}`
                    : undefined
                }
                required
                fullWidth
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Payment Type *</InputLabel>
                  <Select
                    value={paymentData.paymentType}
                    label="Payment Type *"
                    onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value as 'partial' | 'full' })}
                  >
                    <MenuItem value="partial">Partial</MenuItem>
                    <MenuItem value="full">Full</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Payment Method *</InputLabel>
                  <Select
                    value={paymentData.paymentMethod}
                    label="Payment Method *"
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Reference"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                placeholder="Transaction reference or check number"
                fullWidth
              />

              <TextField
                label="Notes"
                multiline
                rows={2}
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                placeholder="Payment notes"
                fullWidth
              />

              <DatePicker
                label="Payment Date *"
                value={paymentData.paymentDate}
                onChange={(newValue) => setPaymentData({ ...paymentData, paymentDate: newValue || new Date() })}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddPayment}
              variant="contained"
              disabled={!paymentData.amount}
            >
              Add Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment History Dialog */}
        <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Payment History - {selectedInvoice?.invoice_number}</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {historyLoading ? (
              <LinearProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.paper' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Amount (PKR)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Received By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment._id} hover>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(payment.amount, 'PKR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.paymentType.toUpperCase()}
                            size="small"
                            color={payment.paymentType === 'full' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                        <TableCell>
                          {typeof payment.receivedBy === 'object' 
                            ? payment.receivedBy.name 
                            : payment.receivedBy}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Report Generation Dialog */}
        <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ fontSize: 24 }} />
            Generate Freight Report
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={4}>
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ 
                      backgroundColor: 'primary.main', 
                      borderRadius: '50%', 
                      width: 40, 
                      height: 40, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <ReportIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        Report Configuration
                      </Typography>
                      <Typography variant="body2" color="primary.light">
                        {hasActiveFilters() 
                          ? `Report will include ${totalCount} invoices matching your current filters`
                          : `Report will include all ${totalCount} freight invoices`
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Format Selection */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                  Report Format
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: reportFormat === 'pdf' ? '2px solid' : '1px solid',
                      borderColor: reportFormat === 'pdf' ? 'primary.main' : 'divider',
                      backgroundColor: reportFormat === 'pdf' ? 'primary.50' : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50'
                      }
                    }}
                    onClick={() => setReportFormat('pdf')}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <PdfIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        PDF Report
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Professional formatted document
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: reportFormat === 'csv' ? '2px solid' : '1px solid',
                      borderColor: reportFormat === 'csv' ? 'primary.main' : 'divider',
                      backgroundColor: reportFormat === 'csv' ? 'primary.50' : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50'
                      }
                    }}
                    onClick={() => setReportFormat('csv')}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <CsvIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        CSV Export
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Data for spreadsheet analysis
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Report Options */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                  Report Options
                </Typography>
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>Group By</InputLabel>
                    <Select
                      value={reportGroupBy}
                      label="Group By"
                      onChange={(e) => setReportGroupBy(e.target.value as 'none' | 'status' | 'month')}
                    >
                      <MenuItem value="none">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'text.secondary' }} />
                          <span>No Grouping</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="status">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                          <span>By Status</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="month">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'warning.main' }} />
                          <span>By Month</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="body1" fontWeight="bold" gutterBottom>
                      Include Payment Details
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Add payment transaction history to the report
                    </Typography>
                    <ToggleButtonGroup
                      value={includePayments ? 'yes' : 'no'}
                      exclusive
                      onChange={(_, value) => setIncludePayments(value === 'yes')}
                      size="large"
                      sx={{
                        '& .MuiToggleButton-root': {
                          border: '1px solid',
                          borderColor: 'divider',
                          '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark'
                            }
                          },
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }
                      }}
                    >
                      <ToggleButton value="yes" sx={{ px: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                          <span>Yes</span>
                        </Stack>
                      </ToggleButton>
                      <ToggleButton value="no" sx={{ px: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor' }} />
                          <span>No</span>
                        </Stack>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Stack>
              </Box>

              {/* Preview Summary */}
              <Card variant="outlined" sx={{ borderColor: 'warning.main' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ 
                      backgroundColor: 'warning.main', 
                      borderRadius: '50%', 
                      width: 40, 
                      height: 40, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <VisibilityIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight="bold" color="warning.dark">
                        Report Preview
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        {reportFormat.toUpperCase()} format • {reportGroupBy !== 'none' ? `Grouped by ${reportGroupBy}` : 'No grouping'} • {includePayments ? 'With payment details' : 'Without payment details'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setReportDialogOpen(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': { 
                  borderColor: 'action.hover',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              variant="contained"
              startIcon={reportFormat === 'pdf' ? <PdfIcon /> : <CsvIcon />}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
            >
              Generate {reportFormat.toUpperCase()} Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbars */}
        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default FreightInvoices;
