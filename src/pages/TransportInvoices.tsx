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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  ExpandMore as ExpandMoreIcon,
  Assessment as ReportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import apiService from '../services/api';
import { TransportInvoice, TransportPayment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const TransportInvoices: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState<TransportInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Enhanced filters
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(null);
  const [dueDateTo, setDueDateTo] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TransportInvoice | null>(null);
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
  const [paymentHistory, setPaymentHistory] = useState<TransportPayment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [reportGroupBy, setReportGroupBy] = useState<'none' | 'agent' | 'status' | 'month'>('none');
  const [includePayments, setIncludePayments] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getTransportInvoices(
        page + 1,
        rowsPerPage,
        search,
        statusFilter,
        agentFilter,
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
  }, [page, rowsPerPage, search, statusFilter, agentFilter, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (location.search.includes('newInvoice=true')) {
      setSuccess('Transport invoice created successfully!');
    }
  }, [location]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await apiService.deleteTransportInvoice(id);
      setSuccess('Invoice deleted successfully');
      load();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    }
  };

  const handleAddPayment = async () => {
    if (!selectedInvoice || !paymentData.amount) return;
    
    try {
      const res = await apiService.addTransportPayment(selectedInvoice._id, {
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
      setError(e?.message || 'Failed to add payment');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const options = {
        startDate: startDate?.toISOString().split('T')[0] || '',
        endDate: endDate?.toISOString().split('T')[0] || '',
        agent: agentFilter || '',
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
        await apiService.downloadTransportReportPDF(options);
      } else {
        await apiService.downloadTransportReportCSV(options);
      }
      
      setSuccess(`Transport report downloaded successfully as ${reportFormat.toUpperCase()}`);
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

  const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#1e3a8a',
  }));

  const pageTotals = useMemo(() => {
    const totalPKR = rows.reduce((sum, r) => sum + (r.amount_pkr || 0), 0);
    const totalAED = rows.reduce((sum, r) => sum + (r.amount_aed || 0), 0);
    const totalPaidPKR = rows.reduce((sum, r) => sum + (r.paid_amount_pkr || 0), 0);
    const totalOutstandingPKR = rows.reduce((sum, r) => sum + (r.outstanding_amount_pkr || 0), 0);
    return { totalPKR, totalAED, totalPaidPKR, totalOutstandingPKR };
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
    setAgentFilter('');
    setStartDate(null);
    setEndDate(null);
    setMinAmount('');
    setMaxAmount('');
    setDueDateFrom(null);
    setDueDateTo(null);
  };

  const hasActiveFilters = () => {
    return search || statusFilter || agentFilter || startDate || endDate || 
           minAmount || maxAmount || dueDateFrom || dueDateTo;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
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
                Transport Invoices
              </Title>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage and track transport invoice payments
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ReportIcon />}
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
                onClick={() => navigate('/transport-invoices/new')}
                                 sx={{
                   backgroundColor: 'background.paper',
                   color: 'primary.main',
                   '&:hover': { backgroundColor: 'action.hover' },
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
                    {formatCurrency(pageTotals.totalPKR, 'PKR')}
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
                    {formatCurrency(pageTotals.totalAED, 'AED')}
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
                     Paid PKR
                   </Typography>
                   <Typography variant="h5" fontWeight="bold">
                     {formatCurrency(pageTotals.totalPaidPKR, 'PKR')}
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
                    Outstanding PKR
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(pageTotals.totalOutstandingPKR, 'PKR')}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            {/* Basic Search */}
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="Search by invoice number or agent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                color={hasActiveFilters() ? 'primary' : 'inherit'}
              >
                Filters {hasActiveFilters() && `(${Object.values({search, statusFilter, agentFilter, startDate, endDate, minAmount, maxAmount, dueDateFrom, dueDateTo}).filter(Boolean).length})`}
              </Button>
              <Button variant="outlined" onClick={clearFilters} disabled={!hasActiveFilters()}>
                Clear
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>
                Refresh
              </Button>
            </Stack>

            {/* Advanced Filters */}
            {showFilters && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Advanced Filters</Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                        placeholder="Agent"
                        value={agentFilter}
                        onChange={(e) => setAgentFilter(e.target.value)}
                        fullWidth
                      />
                      
                      <TextField
                        placeholder="Min Amount"
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
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        </Paper>

        {/* Invoices Table */}
        <Paper sx={{ overflow: 'hidden' }}>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Agent</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount (PKR)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount (AED)</TableCell>
                                     <TableCell align="right" sx={{ fontWeight: 'bold' }}>Paid (PKR)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Outstanding (PKR)</TableCell>
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
                    <TableCell>{row.agent}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(row.amount_pkr, 'PKR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.amount_aed, 'AED')}
                    </TableCell>
                                         <TableCell align="right">
                       <Typography variant="body2" color="success.main" fontWeight="bold">
                         {formatCurrency(row.paid_amount_pkr, 'PKR')}
                       </Typography>
                     </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {formatCurrency(row.outstanding_amount_pkr, 'PKR')}
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
                        {row.outstanding_amount_pkr > 0 && (
                          <Tooltip title="Add Payment">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedInvoice(row);
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
                            onClick={() => navigate(`/transport-invoices/${row._id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/transport-invoices/${row._id}/edit`)}
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
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
              : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
            color: 'white' 
          }}>
            Add Payment
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Invoice: <strong>{selectedInvoice?.invoice_number}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Agent: <strong>{selectedInvoice?.agent}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Outstanding Amount: <strong>{selectedInvoice ? formatCurrency(selectedInvoice.outstanding_amount_pkr, 'PKR') : ''}</strong>
                </Typography>
              </Box>

              <TextField
                label="Payment Amount (PKR) *"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                inputProps={{ min: 0.01, step: 0.01 }}
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
              sx={{ 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
                  : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' 
              }}
            >
              Add Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment History Dialog */}
        <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
              : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
            color: 'white' 
          }}>
            Payment History - {selectedInvoice?.invoice_number}
          </DialogTitle>
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
          <DialogTitle sx={{ 
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
              : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
                         <AssessmentIcon sx={{ fontSize: 24 }} />
            Generate Transport Report
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={4}>
              {/* Info Card */}
              <Card sx={{ 
                background: theme => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: 2
              }}>
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
                          : `Report will include all ${totalCount} transport invoices`
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
                      onChange={(e) => setReportGroupBy(e.target.value as 'none' | 'agent' | 'status' | 'month')}
                    >
                      <MenuItem value="none">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'text.secondary' }} />
                          <span>No Grouping</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="agent">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                          <span>By Agent</span>
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
              <Card sx={{ 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #451a03 0%, #78350f 100%)'
                  : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid',
                borderColor: 'warning.main',
                borderRadius: 2
              }}>
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
              sx={{ 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                  : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
                    : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                },
                transition: 'all 0.2s ease'
              }}
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

export default TransportInvoices;
