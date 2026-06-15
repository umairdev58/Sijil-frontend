import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  TablePagination,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Money as MoneyIcon,
  Payment as PaymentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import apiService from '../services/api';
import { DubaiTransportInvoice } from '../types';
import BeautifulRefreshButton from '../components/BeautifulRefreshButton';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { getPaymentAmountError, getApiErrorMessage, formatAED } from '../utils/paymentValidation';

const DubaiTransportInvoices: React.FC = () => {
  const { mode } = useAppTheme();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<DubaiTransportInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ total: 0 });
  const [, setStats] = useState<any>(null);

  // Filter states
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState('');
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
  const [selectedInvoice, setSelectedInvoice] = useState<DubaiTransportInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());

  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState<Date | null>(null);
  const [reportEndDate, setReportEndDate] = useState<Date | null>(null);
  const [reportStatus, setReportStatus] = useState('');
  const [reportMinAmount, setReportMinAmount] = useState('');
  const [reportMaxAmount, setReportMaxAmount] = useState('');
  const [reportDueDateFrom, setReportDueDateFrom] = useState<Date | null>(null);
  const [reportDueDateTo, setReportDueDateTo] = useState<Date | null>(null);
  const [reportGroupBy, setReportGroupBy] = useState<'none' | 'status' | 'month'>('none');
  const [includePayments, setIncludePayments] = useState(true);

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
      const res = await apiService.getDubaiTransportInvoices(
        page + 1,
        rowsPerPage,
        search,
        status,
        startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate ? format(endDate, 'yyyy-MM-dd') : '',
        minAmount,
        maxAmount,
        dueDateFrom ? format(dueDateFrom, 'yyyy-MM-dd') : '',
        dueDateTo ? format(dueDateTo, 'yyyy-MM-dd') : ''
      );
      if (res.success) {
        setInvoices(res.data);
        setPagination({ total: res.pagination?.total || 0 });
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, status, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo]);

  const loadStats = useCallback(async () => {
    try {
      const res = await apiService.getDubaiTransportInvoiceStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (e: any) {
      console.error('Failed to load stats:', e);
    }
  }, []);

  useEffect(() => {
    load();
    loadStats();
  }, [load, loadStats]);

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setStartDate(null);
    setEndDate(null);
    setMinAmount('');
    setMaxAmount('');
    setDueDateFrom(null);
    setDueDateTo(null);
    setPage(0);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInvoice || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    const validationError = getPaymentAmountError(amount, selectedInvoice.outstanding_amount_aed);
    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    try {
      setPaymentError(null);
      const paymentData = {
        amount_aed: amount,
        paymentType,
        paymentMethod,
        reference: paymentReference,
        notes: paymentNotes,
        paymentDate: format(paymentDate, 'yyyy-MM-dd')
      };

      const res = await apiService.addDubaiTransportPayment(selectedInvoice._id, paymentData);
      if (res.success) {
        setSuccess('Payment added successfully');
        setPaymentDialogOpen(false);
        setPaymentError(null);
        setSelectedInvoice(null);
        setPaymentAmount('');
        setPaymentType('partial');
        setPaymentMethod('cash');
        setPaymentReference('');
        setPaymentNotes('');
        setPaymentDate(new Date());
        load();
        loadStats();
      } else {
        setError(res.message || 'Failed to add payment');
      }
    } catch (e: any) {
      setPaymentError(getApiErrorMessage(e, 'Failed to add payment'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const res = await apiService.deleteDubaiTransportInvoice(id);
      if (res.success) {
        setSuccess('Invoice deleted successfully');
        load();
        loadStats();
      } else {
        setError(res.message || 'Failed to delete invoice');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleGenerateReport = async (type: 'pdf' | 'csv') => {
    try {
      const options = {
        startDate: reportStartDate ? format(reportStartDate, 'yyyy-MM-dd') : undefined,
        endDate: reportEndDate ? format(reportEndDate, 'yyyy-MM-dd') : undefined,
        status: reportStatus || undefined,
        minAmount: reportMinAmount || undefined,
        maxAmount: reportMaxAmount || undefined,
        dueDateFrom: reportDueDateFrom ? format(reportDueDateFrom, 'yyyy-MM-dd') : undefined,
        dueDateTo: reportDueDateTo ? format(reportDueDateTo, 'yyyy-MM-dd') : undefined,
        groupBy: reportGroupBy,
        includePayments
      };

      if (type === 'pdf') {
        await apiService.downloadDubaiTransportReportPDF(options);
      } else {
        await apiService.downloadDubaiTransportReportCSV(options);
      }

      setReportDialogOpen(false);
      setSuccess(`Report downloaded successfully`);
    } catch (e: any) {
      setError('Failed to generate report');
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
      case 'partially_paid': return <CheckCircleOutlineIcon />;
      case 'overdue': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const pageTotals = useMemo(() => {
    return invoices.reduce((acc, invoice) => ({
      totalAmountAED: acc.totalAmountAED + invoice.amount_aed,
      totalPaidAED: acc.totalPaidAED + invoice.paid_amount_aed,
      totalOutstandingAED: acc.totalOutstandingAED + invoice.outstanding_amount_aed
    }), { 
      totalAmountAED: 0, 
      totalPaidAED: 0, 
      totalOutstandingAED: 0 
    });
  }, [invoices]);

  const collectionRate = pageTotals.totalAmountAED > 0
    ? (pageTotals.totalPaidAED / pageTotals.totalAmountAED) * 100
    : 0;

  const hasActiveFilters = () => {
    return search || status || startDate || endDate || 
           minAmount || maxAmount || dueDateFrom || dueDateTo;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dubai Transport Invoices
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => setReportDialogOpen(true)}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
            >
              Generate Report
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dubai-transport-invoices/new')}
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
                {pagination.total}
              </Typography>
              <LinearProgress variant="determinate" value={pagination.total > 0 ? 100 : 0} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(pageTotals.totalAmountAED)}
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
                {formatCurrency(pageTotals.totalPaidAED)}
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
                {formatCurrency(pageTotals.totalOutstandingAED)}
              </Typography>
              <LinearProgress variant="determinate" value={collectionRate} sx={{ mt: 1 }} />
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
              onKeyDown={(e) => { if ((e as any).key === 'Enter') { setPage(0); load(); } }}
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
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
              >
                Filters
              </Button>
              <BeautifulRefreshButton onClick={load} variant="outlined" buttonText="Refresh" />
            </Stack>
          </Box>

          <Collapse in={showFilters}>
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(2,6,23,0.02)', border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(2,6,23,0.06)', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Advanced Filters
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                      <MenuItem value="partially_paid">Partially Paid</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>
                  <DatePicker label="Start Date" value={startDate} onChange={setStartDate} slotProps={{ textField: { fullWidth: true } }} />
                  <DatePicker label="End Date" value={endDate} onChange={setEndDate} slotProps={{ textField: { fullWidth: true } }} />
                  <TextField label="Min Amount" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">AED</InputAdornment> }} />
                  <TextField label="Max Amount" type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">AED</InputAdornment> }} />
                  <DatePicker label="Due Date From" value={dueDateFrom} onChange={setDueDateFrom} slotProps={{ textField: { fullWidth: true } }} />
                  <DatePicker label="Due Date To" value={dueDateTo} onChange={setDueDateTo} slotProps={{ textField: { fullWidth: true } }} />
                </Box>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={handleClearFilters} disabled={!hasActiveFilters()} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                    Clear All Filters
                  </Button>
                  <Button variant="contained" onClick={() => setShowFilters(false)} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                    Apply Filters
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Collapse>
        </Paper>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {invoices.length === 0 ? 0 : page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, pagination.total)} of {pagination.total} invoices
          </Typography>
        </Box>

        <Paper>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Container</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount (AED)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Paid (AED)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Outstanding (AED)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Invoice Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Payment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body1" color="textSecondary">
                          No invoices found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{row.invoice_number}</TableCell>
                        <TableCell>{row.container_number || '-'}</TableCell>
                        <TableCell>{row.description || '-'}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{formatCurrency(row.amount_aed)}</TableCell>
                        <TableCell>{formatCurrency(row.paid_amount_aed)}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium', color: row.outstanding_amount_aed > 0 ? 'error.main' : 'inherit' }}>
                          {formatCurrency(row.outstanding_amount_aed)}
                        </TableCell>
                        <TableCell>{formatDate(row.invoice_date)}</TableCell>
                        <TableCell>{formatDate(row.due_date)}</TableCell>
                        <TableCell>
                          {row.last_payment_date ? formatDate(row.last_payment_date) : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(row.status)}
                            label={row.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(row.status) as any}
                            size="small"
                            sx={{ fontWeight: 'medium' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {row.status !== 'paid' && (
                              <Tooltip title="Add Payment">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedInvoice(row);
                                    setPaymentError(null);
                                    setPaymentDialogOpen(true);
                                  }}
                                  color="primary"
                                >
                                  <CheckCircleOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/dubai-transport-invoices/${row._id}`)}
                                color="info"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print">
                              <IconButton
                                size="small"
                                onClick={() => apiService.printDubaiTransportInvoice(row._id)}
                                color="secondary"
                              >
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/dubai-transport-invoices/${row._id}/edit`)}
                                color="warning"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(row._id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={pagination.total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => { setPaymentDialogOpen(false); setPaymentError(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MoneyIcon color="primary" />
              <Typography variant="h6">Add Payment</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {paymentError && (
                <Alert severity="error" onClose={() => setPaymentError(null)}>
                  {paymentError}
                </Alert>
              )}
              {selectedInvoice && (
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Invoice: <strong>{selectedInvoice.invoice_number}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Outstanding: <strong>{formatAED(selectedInvoice.outstanding_amount_aed)}</strong>
                  </Typography>
                </Box>
              )}
              <TextField
                label="Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value);
                  setPaymentError(null);
                }}
                required
                inputProps={{ min: 0.01, step: 0.01, max: selectedInvoice?.outstanding_amount_aed }}
                error={!!paymentAmount && parseFloat(paymentAmount) > (selectedInvoice?.outstanding_amount_aed || 0)}
                helperText={
                  selectedInvoice
                    ? `Maximum payable amount: ${formatAED(selectedInvoice.outstanding_amount_aed)}`
                    : undefined
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'partial' | 'full')}
                  label="Payment Type"
                >
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="full">Full</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
              <TextField
                label="Notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                multiline
                rows={2}
              />
              <DatePicker
                label="Payment Date"
                value={paymentDate}
                onChange={(newValue) => setPaymentDate(newValue || new Date())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setPaymentDialogOpen(false); setPaymentError(null); }}>Cancel</Button>
            <Button onClick={handlePaymentSubmit} variant="contained" startIcon={<PaymentIcon />}>
              Add Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Report Dialog */}
        <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon sx={{ fontSize: 24 }} color="primary" />
              <Typography variant="h6">Generate Dubai Transport Report</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={reportStartDate}
                onChange={setReportStartDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={reportEndDate}
                onChange={setReportEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="partially_paid">Partially Paid</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Min Amount"
                type="number"
                value={reportMinAmount}
                onChange={(e) => setReportMinAmount(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
              />
              <TextField
                label="Max Amount"
                type="number"
                value={reportMaxAmount}
                onChange={(e) => setReportMaxAmount(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
              />
              <DatePicker
                label="Due Date From"
                value={reportDueDateFrom}
                onChange={setReportDueDateFrom}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Due Date To"
                value={reportDueDateTo}
                onChange={setReportDueDateTo}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Group By</Typography>
              <ToggleButtonGroup
                value={reportGroupBy}
                exclusive
                onChange={(_, value) => value && setReportGroupBy(value)}
              >
                <ToggleButton value="none">None</ToggleButton>
                <ToggleButton value="status">Status</ToggleButton>
                <ToggleButton value="month">Month</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControl>
                <input
                  type="checkbox"
                  checked={includePayments}
                  onChange={(e) => setIncludePayments(e.target.checked)}
                />
                <label style={{ marginLeft: 8 }}>Include Payment Details</label>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setReportDialogOpen(false)}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleGenerateReport('csv')}
              startIcon={<CsvIcon />}
              variant="outlined"
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
            >
              Download CSV
            </Button>
            <Button
              onClick={() => handleGenerateReport('pdf')}
              startIcon={<PdfIcon />}
              variant="contained"
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
            >
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={!!error || !!success}
          autoHideDuration={6000}
          onClose={() => { setError(''); setSuccess(''); }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => { setError(''); setSuccess(''); }}
            severity={error ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default DubaiTransportInvoices;
