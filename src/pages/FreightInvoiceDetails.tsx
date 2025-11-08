import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  List,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import apiService from '../services/api';
import { FreightInvoice, FreightPayment } from '../types';
import { styled } from '@mui/material/styles';

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  textTransform: 'uppercase',
  padding: theme.spacing(0.5),
  '&.paid': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark
  },
  '&.unpaid': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark
  },
  '&.partially_paid': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark
  },
  '&.overdue': {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.error.contrastText
  }
}));

const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px 0 rgba(0,0,0,0.1)'
  }
}));

const PaymentCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.01)'
  }
}));

const FreightInvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<FreightInvoice | null>(null);
  const [payments, setPayments] = useState<FreightPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial');

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getFreightInvoice(id!);
      if (response.success && response.data) {
        setInvoice(response.data);
      } else {
        setError('Failed to fetch invoice details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPayments = useCallback(async () => {
    try {
      const response = await apiService.getFreightPaymentHistory(id!);
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch payments:', err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInvoice();
      fetchPayments();
    }
  }, [id, fetchInvoice, fetchPayments]);

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      const response = await apiService.addFreightPayment(id!, {
        amount: parseFloat(paymentAmount),
        paymentDate: paymentDate.toISOString(),
        note: paymentNote,
        paymentType
      });

      if (response.success) {
        setSuccess('Payment added successfully');
        setPaymentDialogOpen(false);
        setPaymentAmount('');
        setPaymentNote('');
        setPaymentType('partial');
        fetchInvoice();
        fetchPayments();
      } else {
        setError(response.message || 'Failed to add payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add payment');
    }
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

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'PPP');
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
      case 'paid': return <CheckIcon />;
      case 'partially_paid': return <PendingIcon />;
      case 'overdue': return <ErrorIcon />;
      default: return <PendingIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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

  if (!invoice) {
    return (
      <Alert severity="error">
        Invoice not found
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => navigate('/freight-invoices')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              Freight Invoice Details
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentDialogOpen(true)}
              disabled={invoice.status === 'paid'}
            >
              Add Payment
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/freight-invoices/${id}/edit`)}
            >
              Edit Invoice
            </Button>
          </Stack>
        </Box>

        {/* Success Notification */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Invoice Details */}
          <Box>
            <DetailCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Invoice Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Invoice Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {invoice.invoice_number}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <StatusChip
                      label={invoice.status.replace('_', ' ')}
                      color={getStatusColor(invoice.status) as any}
                      icon={getStatusIcon(invoice.status)}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Invoice Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(invoice.invoice_date)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1">
                      {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Agent
                    </Typography>
                    <Typography variant="body1">
                      {invoice.agent}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </DetailCard>

            {/* Amount Details */}
            <DetailCard sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Amount Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Amount (AED)
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {formatCurrency(invoice.amount_aed)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Amount (PKR)
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {formatCurrencyPKR(invoice.amount_pkr)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Paid Amount (AED)
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {formatCurrency(invoice.paid_amount_aed || 0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Outstanding (AED)
                    </Typography>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      {formatCurrency(invoice.outstanding_amount_aed || 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </DetailCard>
          </Box>

          {/* Payment History */}
          <Box>
            <DetailCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment History
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {payments.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No payments recorded yet
                  </Typography>
                ) : (
                  <List>
                    {payments.map((payment, index) => (
                      <PaymentCard key={payment._id} sx={{ mb: 2 }}>
                        <CardContent sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {formatCurrency(payment.amount)}
                            </Typography>
                            <Chip
                              label={payment.paymentType}
                              size="small"
                              color={payment.paymentType === 'full' ? 'success' : 'warning'}
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(payment.paymentDate)}
                          </Typography>
                          {payment.notes && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {payment.notes}
                            </Typography>
                          )}
                        </CardContent>
                      </PaymentCard>
                    ))}
                  </List>
                )}
              </CardContent>
            </DetailCard>
          </Box>
        </Box>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PaymentIcon color="primary" />
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
              <DatePicker
                label="Payment Date"
                value={paymentDate}
                onChange={(newValue) => setPaymentDate(newValue || new Date())}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'partial' | 'full')}
                  label="Payment Type"
                >
                  <MenuItem value="partial">Partial Payment</MenuItem>
                  <MenuItem value="full">Full Payment</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Note"
                multiline
                rows={3}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPayment}
              variant="contained"
              disabled={!paymentAmount}
            >
              Add Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default FreightInvoiceDetails;
