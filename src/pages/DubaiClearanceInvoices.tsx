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
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Pagination,
  Accordion,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
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
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { styled, useTheme } from '@mui/material/styles';
import apiService from '../services/api';
import { DubaiClearanceInvoice } from '../types';

const DubaiClearanceInvoices: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<DubaiClearanceInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [, setStats] = useState<any>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [agent, setAgent] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(null);
  const [dueDateTo, setDueDateTo] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<DubaiClearanceInvoice | null>(null);
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
  const [reportAgent, setReportAgent] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [reportMinAmount, setReportMinAmount] = useState('');
  const [reportMaxAmount, setReportMaxAmount] = useState('');
  const [reportDueDateFrom, setReportDueDateFrom] = useState<Date | null>(null);
  const [reportDueDateTo, setReportDueDateTo] = useState<Date | null>(null);
  const [reportGroupBy, setReportGroupBy] = useState<'none' | 'agent' | 'status' | 'month'>('none');
  const [includePayments, setIncludePayments] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getDubaiClearanceInvoices(
        pagination.page,
        pagination.limit,
        search,
        status,
        agent,
        startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate ? format(endDate, 'yyyy-MM-dd') : '',
        minAmount,
        maxAmount,
        dueDateFrom ? format(dueDateFrom, 'yyyy-MM-dd') : '',
        dueDateTo ? format(dueDateTo, 'yyyy-MM-dd') : ''
      );
      if (res.success) {
        setInvoices(res.data);
        setPagination(prev => ({ ...prev, ...res.pagination }));
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status, agent, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo]);

  const loadStats = useCallback(async () => {
    try {
      const res = await apiService.getDubaiClearanceInvoiceStats();
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

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    load();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setAgent('');
    setStartDate(null);
    setEndDate(null);
    setMinAmount('');
    setMaxAmount('');
    setDueDateFrom(null);
    setDueDateTo(null);
    setPagination(prev => ({ ...prev, page: 1 }));
    load();
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInvoice || !paymentAmount) return;

    try {
      const paymentData = {
        amount_aed: parseFloat(paymentAmount),
        paymentType,
        paymentMethod,
        reference: paymentReference,
        notes: paymentNotes,
        paymentDate: format(paymentDate, 'yyyy-MM-dd')
      };

      const res = await apiService.addDubaiClearancePayment(selectedInvoice._id, paymentData);
      if (res.success) {
        setSuccess('Payment added successfully');
        setPaymentDialogOpen(false);
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
      setError(e.response?.data?.message || 'Failed to add payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const res = await apiService.deleteDubaiClearanceInvoice(id);
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
        agent: reportAgent || undefined,
        status: reportStatus || undefined,
        minAmount: reportMinAmount || undefined,
        maxAmount: reportMaxAmount || undefined,
        dueDateFrom: reportDueDateFrom ? format(reportDueDateFrom, 'yyyy-MM-dd') : undefined,
        dueDateTo: reportDueDateTo ? format(reportDueDateTo, 'yyyy-MM-dd') : undefined,
        groupBy: reportGroupBy,
        includePayments
      };

      if (type === 'pdf') {
        await apiService.downloadDubaiClearanceReportPDF(options);
      } else {
        await apiService.downloadDubaiClearanceReportCSV(options);
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

  const formatCurrencyPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const pageTotals = useMemo(() => {
    return invoices.reduce((acc, invoice) => ({
      totalAmountPKR: acc.totalAmountPKR + invoice.amount_pkr,
      totalAmountAED: acc.totalAmountAED + invoice.amount_aed,
      totalPaidPKR: acc.totalPaidPKR + invoice.paid_amount_pkr,
      totalPaidAED: acc.totalPaidAED + invoice.paid_amount_aed,
      totalOutstandingPKR: acc.totalOutstandingPKR + invoice.outstanding_amount_pkr,
      totalOutstandingAED: acc.totalOutstandingAED + invoice.outstanding_amount_aed
    }), { 
      totalAmountPKR: 0, 
      totalAmountAED: 0, 
      totalPaidPKR: 0, 
      totalPaidAED: 0, 
      totalOutstandingPKR: 0, 
      totalOutstandingAED: 0 
    });
  }, [invoices]);

  const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#1e3a8a',
  }));

  const hasActiveFilters = () => {
    return search || status || agent || startDate || endDate || 
           minAmount || maxAmount || dueDateFrom || dueDateTo;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        {/* Header Section */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
            : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
          color: 'white' 
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Title variant="h4" sx={{ color: 'white', mb: 1 }}>
                Dubai Clearance Invoices
              </Title>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage and track Dubai clearance invoice payments
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => setReportDialogOpen(true)}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Generate Report
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/dubai-clearance-invoices/new')}
                                 sx={{
                   backgroundColor: theme.palette.background.paper,
                   color: theme.palette.primary.main,
                   '&:hover': { backgroundColor: theme.palette.action.hover },
                 }}
              >
                New Invoice
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Card sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total PKR
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrencyPKR(pageTotals.totalAmountPKR)}
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total AED
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(pageTotals.totalAmountAED)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Paid Amount
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(pageTotals.totalPaidAED)}
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Outstanding
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(pageTotals.totalOutstandingAED)}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                color={hasActiveFilters() ? 'primary' : 'inherit'}
              >
                Filters {hasActiveFilters() && <Chip label="Active" size="small" color="primary" sx={{ ml: 1 }} />}
              </Button>
              <Button variant="outlined" onClick={handleClearFilters} startIcon={<RefreshIcon />}>
                Clear
              </Button>
            </Box>

            {showFilters && (
              <Accordion expanded={showFilters} sx={{ mt: 2 }}>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
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
                      label="Agent"
                      value={agent}
                      onChange={(e) => setAgent(e.target.value)}
                      fullWidth
                    />

                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={{ textField: { fullWidth: true } }}
                    />

                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={setEndDate}
                      slotProps={{ textField: { fullWidth: true } }}
                    />

                    <TextField
                      label="Min Amount"
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                      }}
                    />

                    <TextField
                      label="Max Amount"
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                      }}
                    />

                    <DatePicker
                      label="Due Date From"
                      value={dueDateFrom}
                      onChange={setDueDateFrom}
                      slotProps={{ textField: { fullWidth: true } }}
                    />

                    <DatePicker
                      label="Due Date To"
                      value={dueDateTo}
                      onChange={setDueDateTo}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <TableContainer>
              <Table>
                <TableHead>
                                     <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount (PKR)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount (AED)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Paid (PKR)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Paid (AED)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Outstanding (PKR)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Outstanding (AED)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Invoice Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Payment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        <Typography variant="body1" color="textSecondary">
                          No invoices found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{row.invoice_number}</TableCell>
                        <TableCell>{row.agent}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{formatCurrencyPKR(row.amount_pkr)}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{formatCurrency(row.amount_aed)}</TableCell>
                        <TableCell>{formatCurrencyPKR(row.paid_amount_pkr)}</TableCell>
                        <TableCell>{formatCurrency(row.paid_amount_aed)}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium', color: row.outstanding_amount_pkr > 0 ? 'error.main' : 'inherit' }}>
                          {formatCurrencyPKR(row.outstanding_amount_pkr)}
                        </TableCell>
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
                                onClick={() => navigate(`/dubai-clearance-invoices/${row._id}`)}
                                color="info"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print">
                              <IconButton
                                size="small"
                                onClick={() => apiService.printDubaiClearanceInvoice(row._id)}
                                color="secondary"
                              >
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/dubai-clearance-invoices/${row._id}/edit`)}
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

            {/* Page Totals */}
            {invoices.length > 0 && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', 
                borderRadius: 1,
                border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.primary">
                  Page Totals:
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Typography color="text.primary">
                    Total Amount: {formatCurrencyPKR(pageTotals.totalAmountPKR)} / {formatCurrency(pageTotals.totalAmountAED)}
                  </Typography>
                  <Typography color="text.primary">
                    Total Paid: {formatCurrencyPKR(pageTotals.totalPaidPKR)} / {formatCurrency(pageTotals.totalPaidAED)}
                  </Typography>
                  <Typography color="text.primary">
                    Total Outstanding: {formatCurrencyPKR(pageTotals.totalOutstandingPKR)} / {formatCurrency(pageTotals.totalOutstandingAED)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(_, page) => setPagination(prev => ({ ...prev, page }))}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MoneyIcon color="primary" />
              <Typography variant="h6">Add Payment</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
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
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
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
              <Typography variant="h6">Generate Dubai Clearance Report</Typography>
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
              <TextField
                label="Agent"
                value={reportAgent}
                onChange={(e) => setReportAgent(e.target.value)}
                fullWidth
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
                <ToggleButton value="agent">Agent</ToggleButton>
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

export default DubaiClearanceInvoices;
