import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ceilToTwoDecimals } from '../lib/utils';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Autocomplete,
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  LocalShipping as ShippingIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import WarningDialog from '../components/ui/WarningDialog';
import { Payment } from '../types';
import { styled } from '@mui/material/styles';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AutocompleteTextField from '../components/AutocompleteTextField';

const decimalInputRegex = /^\d*(?:\.\d*)?$/;

const normalizeDecimalInput = (value: string) => value.replace(/,/g, '.');

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

const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [sale, setSale] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningText, setWarningText] = useState<React.ReactNode>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentType: 'partial' as 'partial' | 'full',
    paymentMethod: 'cash',
    reference: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
    discount: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deletePaymentDialogOpen, setDeletePaymentDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [deletePaymentPassword, setDeletePaymentPassword] = useState('');
  const [deletePaymentLoading, setDeletePaymentLoading] = useState(false);
  
  // Utility function to validate ObjectId format
  const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  const isNewSale = id === 'new' || window.location.pathname === '/sales/new';
  const isEditMode = window.location.pathname.includes('/edit');
  const isFormMode = isNewSale || isEditMode;
  
  // Check if we're in addPayment mode
  const urlParams = new URLSearchParams(window.location.search);
  const isAddPaymentMode = urlParams.get('mode') === 'addPayment';
  const { mode } = useAppTheme();
  const { user } = useAuth();

  const totalDiscount = useMemo(() => {
    try {
      return (payments || []).reduce((sum, p) => sum + (Number(p?.discount) || 0), 0);
    } catch {
      return 0;
    }
  }, [payments]);

  const runValidation = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!sale?.customer) errors.customer = 'Customer is required';
    if (!sale?.quantity || sale.quantity === '' || Number(sale.quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (!sale?.rate || sale.rate === '' || Number(sale.rate) <= 0) errors.rate = 'Rate must be greater than 0';
    if (!sale?.invoiceDate) errors.invoiceDate = 'Invoice date is required';
    if (!sale?.dueDate || String(sale.dueDate).trim() === '') errors.dueDate = 'Due date is required';

    // If editing and invoice number required by your rule, ensure present
    if (!isNewSale && (!sale?.invoiceNumber || String(sale.invoiceNumber).trim() === '')) {
      errors.invoiceNumber = 'Invoice number is required when editing';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchData = useCallback(async () => {
    if (isNewSale) {
        const today = new Date().toISOString().split('T')[0];
        const tenDaysLater = (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().split('T')[0]; })();
        setSale({
          customer: '',
          supplier: '',
          product: '',
          containerNo: '',
          marka: '',
          description: '',
          quantity: '',
          rate: '',
          vatPercentage: '',
          discount: '',
          amount: 0,
          receivedAmount: 0,
          outstandingAmount: 0,
          status: 'unpaid',
          invoiceNumber: '',
          invoiceDate: today,
          dueDate: tenDaysLater,
          notes: ''
        });
        setLoading(false);
        return;
      }

    if (!id || id === 'new') {
      setError('Invalid sale ID');
      setLoading(false);
      return;
    }

    if (!isValidObjectId(id)) {
      setError('Invalid sale ID format');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [saleRes, payRes] = await Promise.all([
        apiService.getSale(id),
        apiService.getPaymentHistory(id)
      ]);

      if (saleRes.success && saleRes.sale) {
        setSale(saleRes.sale);
      } else {
        setError('Failed to load sale data');
      }

      if (payRes.success && payRes.payments) {
        setPayments(payRes.payments);
      }
    } catch (err) {
      setError('Failed to load sale details');
    } finally {
      setLoading(false);
    }
  }, [id, isNewSale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isAddPaymentMode) {
      setShowPaymentForm(true);
    }
  }, [isAddPaymentMode, isNewSale]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [custRes, suppRes, prodRes] = await Promise.all([
          apiService.getCustomers({ fetchAll: true }),
          (apiService as any).getSuppliers ? (apiService as any).getSuppliers(1, 100) : Promise.resolve({ success: true, data: [] }),
          apiService.getProducts({ all: true })
        ]);
        if (custRes?.success && custRes.data) setCustomers(custRes.data);
        if (suppRes?.success && (suppRes as any).data) setSuppliers((suppRes as any).data);
        if (prodRes?.success && prodRes.data) setProducts(prodRes.data);
      } catch (e) {
        console.warn('Failed to load customers/suppliers/products');
      }
    };
    if (isFormMode) loadLookups();
  }, [isFormMode]);

  const addDays = (dateString: string, days: number) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleInputChange = (field: string, value: any) => {
    setSale((prev: any) => {
      let updatedSale: any = { ...prev, [field]: value };

      // Auto-adjust due date when invoice date changes, unless user modified due date manually
      if (field === 'invoiceDate') {
        const newAutoDue = addDays(value, 10);
        const prevAutoDue = addDays(prev.invoiceDate, 10);
        if (!prev.dueDate || prev.dueDate === prevAutoDue) {
          updatedSale.dueDate = newAutoDue;
        }
      }

      // Clear field error on change
      if (fieldErrors[field]) {
        const next = { ...fieldErrors };
        delete next[field];
        setFieldErrors(next);
      }
      
      // Recalculate amounts when quantity, rate, VAT percentage, or discount changes
      if (['quantity', 'rate', 'vatPercentage', 'discount'].includes(field)) {
        const quantity = field === 'quantity' ? (value === '' ? 0 : value) : (prev.quantity === '' ? 0 : prev.quantity || 0);
        const rate = field === 'rate' ? (value === '' ? 0 : value) : (prev.rate === '' ? 0 : prev.rate || 0);
        const vatPercentage = field === 'vatPercentage' ? (value === '' ? 0 : value) : (prev.vatPercentage === '' ? 0 : prev.vatPercentage || 0);
        const discount = field === 'discount' ? (value === '' ? 0 : value) : (prev.discount === '' ? 0 : prev.discount || 0);
        
        const subtotal = ceilToTwoDecimals(Number(quantity) * Number(rate));
        const vatAmount = ceilToTwoDecimals((subtotal * Number(vatPercentage)) / 100);
        const amount = ceilToTwoDecimals(subtotal + vatAmount - Number(discount));
        const outstandingAmount = ceilToTwoDecimals(amount - (Number(prev.receivedAmount) || 0));
        
        updatedSale.amount = amount;
        updatedSale.outstandingAmount = outstandingAmount;
        updatedSale.vatAmount = vatAmount;
      }
      
      if (field === 'receivedAmount') {
        updatedSale.outstandingAmount = ceilToTwoDecimals((prev.amount || 0) - Number(value));
      }
      
      return updatedSale;
    });
  };

  const handleSave = async () => {
    // Frontend validation first
    if (!runValidation()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Frontend validation: VAT requires customer TRN
      const vatPct = Number(sale.vatPercentage === '' ? 0 : sale.vatPercentage || 0);
      if (vatPct > 0) {
        const selectedCustomer = customers.find((c) => c.ename === sale.customer);
        if (!selectedCustomer || !selectedCustomer.trn || selectedCustomer.trn.trim() === '') {
          setWarningText(
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                This sale includes VAT. A valid customer TRN is required to proceed.
              </Typography>
              <Typography variant="body2">
                Please update the customer's TRN in the Customers page, then return to create this VAT sale.
              </Typography>
            </Box>
          );
          setWarningOpen(true);
          setSaving(false);
          return;
        }
      }

      // Prepare sale data for API - convert empty strings to undefined for optional fields
      const saleData = {
        ...sale,
        vatPercentage: sale.vatPercentage === '' ? undefined : parseFloat(sale.vatPercentage),
        discount: sale.discount === '' ? undefined : parseFloat(sale.discount),
        quantity: parseFloat(sale.quantity),
        rate: parseFloat(sale.rate)
      };

      if (isNewSale) {
        const response = await apiService.createSale(saleData);
        if (response.success && response.data) {
          // Preserve query params from location.search and add newSale=true
          const queryParams = new URLSearchParams(location.search);
          queryParams.set('newSale', 'true');
          const queryString = queryParams.toString();
          navigate(queryString ? `/sales?${queryString}` : '/sales?newSale=true');
        } else {
          setError(response.message || 'Failed to create sale');
        }
      } else {
        const response = await apiService.updateSale(id!, saleData);
        if (response.success && response.sale) {
          // Preserve query params from location.search when navigating back to sales page
          const queryString = location.search;
          navigate(queryString ? `/sales${queryString}` : '/sales');
        } else {
          setError(response.message || 'Failed to update sale');
        }
      }
    } catch (err: any) {
      // Parse server-side validation errors gracefully
      const serverMsg: string = err?.response?.data?.message || err?.response?.data?.error || err?.message || '';
      const isDuplicateInvoice = /invoice number.*exists|already exists/i.test(serverMsg);
      if (isDuplicateInvoice) {
        setFieldErrors((prev) => ({ ...prev, invoiceNumber: 'Invoice number already exists. Please use a different number.' }));
        setError(null); // don't show generic alert
      } else if (err?.response?.status === 400) {
        // Map common field errors if provided in backend (optional)
        const details = err?.response?.data?.details;
        if (details && typeof details === 'object') {
          setFieldErrors(details as Record<string, string>);
          setError(null);
        } else {
          setError(serverMsg || 'Validation failed. Please review the form.');
        }
      } else {
        setError(serverMsg || 'Failed to save sale');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isNewSale) {
      navigate(`/sales${location.search}`);
    } else if (isEditMode) {
      // When canceling from edit mode, go back to sales page with filters preserved
      navigate(`/sales${location.search}`);
    } else {
      // When canceling from view mode, go back to detail view with query params preserved
      navigate(`/sales/${id}${location.search}`);
    }
  };

  const handlePaymentInputChange = (field: string, value: any) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddPayment = async () => {
    try {
      setSaving(true);
      setError(null);

      const paymentData = {
        amount: parseFloat(paymentForm.amount),
        paymentType: paymentForm.paymentType as 'partial' | 'full',
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
        paymentDate: paymentForm.paymentDate,
        discount: paymentForm.discount === '' ? 0 : parseFloat(paymentForm.discount)
      };

      const response = await apiService.addPayment(id!, paymentData);
      
      if (response.success) {
        const payRes = await apiService.getPaymentHistory(id!);
        if (payRes.success && payRes.payments) {
          setPayments(payRes.payments);
        }
        // Update sale totals/outstanding using API response to reflect discount and payments
        if ((response as any).sale) {
          setSale((response as any).sale);
        } else {
          // Fallback: refetch sale if not present
          try {
            const saleRes = await apiService.getSale(id!);
            if (saleRes.success && saleRes.sale) setSale(saleRes.sale);
          } catch {}
        }
        setPaymentForm({
          amount: '',
          paymentType: 'partial' as 'partial' | 'full',
          paymentMethod: 'cash',
          reference: '',
          notes: '',
          paymentDate: new Date().toISOString().split('T')[0],
          discount: ''
        });
        setShowPaymentForm(false);
        navigate(`/sales/${id}`);
      } else {
        setError(response.message || 'Failed to add payment');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to add payment: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeletePaymentDialogOpen(true);
    setDeletePaymentPassword('');
  };

  const handleDeletePaymentConfirm = async () => {
    if (!paymentToDelete || !deletePaymentPassword.trim()) {
      setError('Please enter your admin password');
      return;
    }

    setDeletePaymentLoading(true);
    try {
      const response = await apiService.deletePayment(id!, paymentToDelete._id!, deletePaymentPassword);
      if (response.success) {
        setPayments(response.payments || []);
        // Update sale with recalculated amounts after deletion
        if ((response as any).sale) {
          setSale((prev: any) => ({ ...prev, ...(response as any).sale }));
        } else {
          try {
            const saleRes = await apiService.getSale(id!);
            if (saleRes.success && saleRes.sale) setSale(saleRes.sale);
          } catch {}
        }
        setDeletePaymentDialogOpen(false);
        setPaymentToDelete(null);
        setDeletePaymentPassword('');
        setError(null);
      } else {
        setError(response.message || 'Failed to delete payment');
      }
    } catch (err: any) {
      console.error('Error deleting payment:', err);
      setError(err.response?.data?.message || 'Failed to delete payment');
    } finally {
      setDeletePaymentLoading(false);
    }
  };

  const handleDeletePaymentCancel = () => {
    setDeletePaymentDialogOpen(false);
    setPaymentToDelete(null);
    setDeletePaymentPassword('');
    setError(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <CheckIcon color="success" />;
      case 'unpaid':
        return <ErrorIcon color="error" />;
      case 'partially_paid':
        return <PendingIcon color="warning" />;
      case 'overdue':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="info" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!sale) return null;

  if (isFormMode) {
    return (
      <Box sx={{ bgcolor: mode === 'dark' ? '#0f172a' : '#f9fafb', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            Back to Sales
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : isNewSale ? 'Create Sale' : 'Update Sale'}
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {isNewSale ? 'Create New Sale' : 'Edit Sale'}
          </Typography>
          
          {isNewSale && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You can manually enter an invoice number or leave it blank to auto-generate one.
            </Alert>
          )}
          
          {!isNewSale && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You can modify the invoice number. Make sure it's unique.
            </Alert>
          )}
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Invoice Number"
              value={sale.invoiceNumber || ''}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              placeholder={isNewSale ? "Leave blank to auto-generate" : "Enter invoice number"}
              helperText={fieldErrors.invoiceNumber || (isNewSale ? "Enter custom invoice number or leave blank for auto-generation" : "Invoice number must be unique")}
              error={Boolean(fieldErrors.invoiceNumber)}
              required={!isNewSale}
            />
            <Autocomplete
              fullWidth
              options={customers}
              getOptionLabel={(option) => option?.ename || ''}
              isOptionEqualToValue={(option, value) => option?._id === value?._id}
              value={customers.find((c) => c.ename === sale?.customer) || null}
              onChange={(_, value) => handleInputChange('customer', value?.ename || '')}
              inputValue={sale?.customer || ''}
              onInputChange={(_, value, reason) => {
                if (reason === 'reset') return;
                handleInputChange('customer', value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  required
                  error={Boolean(fieldErrors.customer)}
                  helperText={fieldErrors.customer}
                />
              )}
              noOptionsText="No customer found"
            />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                label="Supplier"
                value={sale.supplier || ''}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
              >
                {suppliers.map((s) => (
                  <MenuItem key={s._id} value={s.ename}>{s.ename}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              fullWidth
              options={products.filter(p => p.isActive)}
              getOptionLabel={(option) => option?.name || ''}
              isOptionEqualToValue={(option, value) => option?._id === value?._id}
              value={products.find((p) => p.name === sale?.product) || null}
              onChange={(_, value) => handleInputChange('product', value?.name || '')}
              inputValue={sale?.product || ''}
              onInputChange={(_, value, reason) => {
                if (reason === 'reset') return;
                handleInputChange('product', value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product"
                  error={Boolean(fieldErrors.product)}
                  helperText={fieldErrors.product}
                />
              )}
              noOptionsText="No product found"
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">{option.name}</Typography>
                    {option.category && (
                      <Typography variant="caption" color="text.secondary">
                        {typeof option.category === 'object' ? option.category.name : 'Category'}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
            />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
            <AutocompleteTextField
              fullWidth
              label="Container Number"
              field="containerNo"
              value={sale.containerNo || ''}
              onChange={(value) => handleInputChange('containerNo', value)}
            />
            <AutocompleteTextField
              fullWidth
              label="Marka"
              field="marka"
              value={sale.marka || ''}
              onChange={(value) => handleInputChange('marka', value)}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
            <AutocompleteTextField
              fullWidth
              label="Description"
              field="description"
              value={sale.description || ''}
              onChange={(value) => handleInputChange('description', value)}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={sale.status || 'unpaid'}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="unpaid">Unpaid</MenuItem>
                <MenuItem value="partially_paid">Partially Paid</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mt: 3 }}>
            <TextField
              fullWidth
              label="Quantity"
              value={sale.quantity || ''}
              onChange={(e) => {
                const rawValue = e.target.value;
                const normalized = normalizeDecimalInput(rawValue);
                if (normalized === '' || decimalInputRegex.test(normalized)) {
                  handleInputChange('quantity', normalized);
                }
              }}
              required
              error={Boolean(fieldErrors.quantity)}
              helperText={fieldErrors.quantity || ''}
              inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' }}
            />
            <TextField
              fullWidth
              label="Rate (AED)"
              value={sale.rate || ''}
              onChange={(e) => {
                const rawValue = e.target.value;
                const normalized = normalizeDecimalInput(rawValue);
                const parsed = Number(normalized);
                if (normalized === '' || (decimalInputRegex.test(normalized) && !Number.isNaN(parsed) && parsed >= 0)) {
                  handleInputChange('rate', normalized);
                }
              }}
              required
              error={Boolean(fieldErrors.rate)}
              helperText={fieldErrors.rate || ''}
              inputProps={{ min: 0, step: '0.01', inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' }}
            />
            <TextField
              fullWidth
              label="VAT Percentage (%)"
              value={sale.vatPercentage || ''}
              onChange={(e) => {
                const rawValue = e.target.value;
                const normalized = normalizeDecimalInput(rawValue);
                const parsed = Number(normalized);
                if (
                  normalized === '' ||
                  (decimalInputRegex.test(normalized) && !Number.isNaN(parsed) && parsed >= 0 && parsed <= 100)
                ) {
                  handleInputChange('vatPercentage', normalized);
                }
              }}
              inputProps={{ min: 0, max: 100, step: '0.01', inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' }}
            />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mt: 3 }}>
            <TextField
              fullWidth
              label="Subtotal (AED)"
              value={ceilToTwoDecimals((sale.quantity === '' ? 0 : sale.quantity || 0) * (sale.rate === '' ? 0 : sale.rate || 0))}
              InputProps={{ readOnly: true }}
              inputProps={{ inputMode: 'decimal' }}
              helperText="Quantity × Rate"
            />
            <TextField
              fullWidth
              label="Final Amount (AED)"
              value={ceilToTwoDecimals(sale.amount || 0)}
              InputProps={{ readOnly: true }}
              inputProps={{ inputMode: 'decimal' }}
              helperText="Subtotal + VAT - Discount"
            />
            <TextField
              fullWidth
              label="Outstanding Amount (AED)"
              value={ceilToTwoDecimals(sale.outstandingAmount || 0)}
              InputProps={{ readOnly: true }}
              inputProps={{ inputMode: 'decimal' }}
              helperText="Auto-calculated"
            />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Invoice Date"
              value={sale.invoiceDate || ''}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              error={Boolean(fieldErrors.invoiceDate)}
              helperText={fieldErrors.invoiceDate || ''}
            />
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              value={sale.dueDate || ''}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              error={Boolean(fieldErrors.dueDate)}
              helperText={fieldErrors.dueDate || ''}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes"
              value={sale.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </Box>
        </Paper>
        <WarningDialog
          open={warningOpen}
          onClose={() => setWarningOpen(false)}
          title="TRN Required for VAT"
          description={warningText}
          primaryAction={{
            label: 'Go to Customers',
            onClick: () => {
              setWarningOpen(false);
              navigate('/customers');
            },
            color: 'warning',
            variant: 'contained',
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: mode === 'dark' ? '#0f172a' : '#f9fafb', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/sales${location.search}`)}
          sx={{ color: 'primary.main', fontWeight: 600 }}
        >
          Back to Sales
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/sales/${id}/edit${location.search}`)}
        >
          Edit Sale
        </Button>
      </Stack>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Main Invoice Section */}
        <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
          <DetailCard sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
                <Box>
                  <Typography variant="h3" fontWeight={700} gutterBottom>
                    Invoice #{sale.invoiceNumber}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getStatusIcon(sale.status)}
                    <StatusChip
                      label={sale.status?.replace('_', ' ').toUpperCase()}
                      className={sale.status?.toLowerCase().replace(' ', '_')}
                    />
                  </Stack>
                </Box>
                <Tooltip title="Invoice Date">
                  <Chip
                    icon={<DateIcon />}
                    label={new Date(sale.invoiceDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Tooltip>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                    <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Customer Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={sale.customer}
                        secondary="Customer Name"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={sale.supplier}
                        secondary="Supplier"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </Box>

                <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                    <ShippingIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Shipping Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={sale.containerNo}
                        secondary="Container Number"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={sale.product}
                        secondary="Product"
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                <DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Description
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography>{sale.description || 'No description provided'}</Typography>
              </Paper>
            </CardContent>
          </DetailCard>

          {/* Payment History Section */}
          <DetailCard>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  <PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Payment History
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  onClick={() => setShowPaymentForm(true)}
                  disabled={sale?.outstandingAmount <= 0}
                  size="small"
                  sx={{
                    borderColor: sale?.outstandingAmount <= 0 ? 'grey.400' : 'primary.main',
                    color: sale?.outstandingAmount <= 0 ? 'grey.600' : 'primary.main',
                    '&:hover': {
                      borderColor: sale?.outstandingAmount <= 0 ? 'grey.400' : 'primary.dark',
                      bgcolor: sale?.outstandingAmount <= 0 ? 'transparent' : 'primary.light',
                    }
                  }}
                >
                  {sale?.outstandingAmount <= 0 ? 'Invoice Already Paid' : 'Add Payment'}
                </Button>
              </Box>

              {payments.length > 0 ? (
                <List>
                  {payments.map((payment) => (
                    <PaymentCard key={payment._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ReceiptIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight={600}>
                              AED {payment.amount?.toLocaleString()}
                            </Typography>
                            <Chip
                              label={payment.paymentType?.toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                          <Chip
                            icon={<DateIcon fontSize="small" />}
                            label={new Date(payment.paymentDate).toLocaleDateString()}
                            size="small"
                          />
                        </Stack>

                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Method: {payment.paymentMethod}
                            </Typography>
                            {payment.reference && (
                              <Typography variant="body2" color="text.secondary">
                                Ref: {payment.reference}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Received by: {typeof payment.receivedBy === 'object'
                                ? payment.receivedBy.name
                                : payment.receivedBy}
                            </Typography>
                            {payment.notes && (
                              <Typography variant="body2" color="text.secondary">
                                Notes: {payment.notes}
                              </Typography>
                            )}
                          </Box>
                          {user?.role === 'admin' && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Tooltip title="Delete Payment">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeletePaymentClick(payment)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </PaymentCard>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No payment history available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </DetailCard>

          {/* Add Payment Form */}
          {showPaymentForm && (
            <DetailCard>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  <PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Add Payment
                </Typography>

                {/* Payment Status Alert */}
                {sale && (
                  <Alert 
                    severity={sale.outstandingAmount <= 0 ? "success" : sale.outstandingAmount < sale.amount ? "info" : "warning"}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {sale.outstandingAmount <= 0 
                        ? "✅ This invoice is fully paid" 
                        : `💰 Outstanding Amount: AED ${sale.outstandingAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
                      }
                    </Typography>
                    {sale.outstandingAmount > 0 && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Total Amount: AED {sale.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })} | 
                        Received: AED {sale.receivedAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                      </Typography>
                    )}
                  </Alert>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <TextField
                    label="Amount (AED)"
                    type="text"
                    value={paymentForm.amount}
                    onChange={(e) => handlePaymentInputChange('amount', e.target.value)}
                    fullWidth
                    required
                    disabled={sale?.outstandingAmount <= 0}
                    inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' }}
                    helperText={
                      sale?.outstandingAmount > 0 
                        ? `Amount + Discount must be <= AED ${sale.outstandingAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
                        : "This invoice is already fully paid"
                    }
                    error={(() => {
                      const amt = parseFloat(paymentForm.amount || '0') || 0;
                      const disc = parseFloat(paymentForm.discount || '0') || 0;
                      return sale?.outstandingAmount > 0 && (amt + disc) > sale.outstandingAmount;
                    })()}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Payment Type</InputLabel>
                    <Select
                      value={paymentForm.paymentType}
                      onChange={(e) => handlePaymentInputChange('paymentType', e.target.value)}
                      label="Payment Type"
                    >
                      <MenuItem value="partial">Partial Payment</MenuItem>
                      <MenuItem value="full">Full Payment</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => handlePaymentInputChange('paymentMethod', e.target.value)}
                      label="Payment Method"
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="cheque">Cheque</MenuItem>
                      <MenuItem value="credit_card">Credit Card</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Payment Date"
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => handlePaymentInputChange('paymentDate', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    label="Reference"
                    value={paymentForm.reference}
                    onChange={(e) => handlePaymentInputChange('reference', e.target.value)}
                    fullWidth
                    placeholder="Transaction ID, cheque number, etc."
                  />

                  <TextField
                    label="Discount (AED)"
                    type="text"
                    value={paymentForm.discount}
                    onChange={(e) => handlePaymentInputChange('discount', e.target.value)}
                    fullWidth
                    inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' }}
                    placeholder="Optional discount amount"
                    helperText={
                      sale?.outstandingAmount > 0 
                        ? `Amount + Discount must be <= AED ${sale.outstandingAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
                        : undefined
                    }
                  />

                  <TextField
                    label="Notes"
                    value={paymentForm.notes}
                    onChange={(e) => handlePaymentInputChange('notes', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Additional notes about the payment"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddPayment}
                    disabled={
                      saving || 
                      (!(paymentForm.amount && parseFloat(paymentForm.amount) > 0) && !(paymentForm.discount && parseFloat(paymentForm.discount) > 0)) ||
                      sale?.outstandingAmount <= 0 ||
                      (() => {
                        const amt = parseFloat(paymentForm.amount || '0') || 0;
                        const disc = parseFloat(paymentForm.discount || '0') || 0;
                        return sale?.outstandingAmount > 0 && (amt + disc) > sale.outstandingAmount;
                      })()
                    }
                    startIcon={<PaymentIcon />}
                    sx={{
                      bgcolor: sale?.outstandingAmount <= 0 ? 'grey.400' : 'primary.main',
                      '&:hover': {
                        bgcolor: sale?.outstandingAmount <= 0 ? 'grey.400' : 'primary.dark',
                      }
                    }}
                  >
                    {saving 
                      ? 'Adding Payment...' 
                      : sale?.outstandingAmount <= 0 
                        ? 'Invoice Already Paid' 
                        : 'Add Payment'
                    }
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowPaymentForm(false);
                      navigate(`/sales/${id}`);
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </DetailCard>
          )}
        </Box>

        {/* Summary Section */}
        <Box sx={{ flex: '1 1 35%', minWidth: 0 }}>
          <DetailCard sx={{ position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Invoice Summary
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`AED ${sale.amount?.toLocaleString()}`}
                    secondary="Total Amount"
                    primaryTypographyProps={{ fontWeight: 600, variant: 'h5' }}
                  />
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem>
                  <ListItemText
                    primary={`AED ${sale.rate?.toLocaleString()}`}
                    secondary="Rate"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`${sale.vatPercentage === '' ? 0 : sale.vatPercentage || 0}%`}
                    secondary="VAT Percentage"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`AED ${sale.vatAmount?.toLocaleString()}`}
                    secondary="VAT Amount"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`AED ${totalDiscount.toLocaleString()}`}
                    secondary="Discount"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={sale.quantity}
                    secondary="Quantity"
                  />
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem>
                  <ListItemText
                    primary={`AED ${sale.receivedAmount?.toLocaleString()}`}
                    secondary="Received Amount"
                    primaryTypographyProps={{ color: 'success.main', fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`AED ${sale.outstandingAmount?.toLocaleString()}`}
                    secondary="Outstanding"
                    primaryTypographyProps={{ color: 'error.main', fontWeight: 600 }}
                  />
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem>
                  <ListItemIcon>
                    <DateIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={sale.dueDate
                      ? new Date(sale.dueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'N/A'}
                    secondary="Due Date"
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 600
                  }}
                >
                  {sale.customer?.[0]?.toUpperCase()}
                </Avatar>
              </Box>
            </CardContent>
          </DetailCard>
        </Box>
      </Box>

      {/* Delete Payment Confirmation Dialog */}
      <Dialog
        open={deletePaymentDialogOpen}
        onClose={handleDeletePaymentCancel}
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
              <DeleteIcon sx={{ 
                color: '#ef4444', 
                fontSize: 24 
              }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                mb: 0.5
              }}>
                Delete Payment Transaction
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
            Are you sure you want to permanently delete this payment transaction? This will also update the invoice's outstanding amount.
          </Typography>
          
          {paymentToDelete && (
            <Card sx={{ 
              mb: 3, 
              bgcolor: mode === 'dark' ? '#334155' : '#f8fafc',
              border: mode === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
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
                      AED {paymentToDelete.amount?.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      color: mode === 'dark' ? '#94a3b8' : '#64748b',
                      fontWeight: 500
                    }}>
                      Payment Type:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                    }}>
                      {paymentToDelete.paymentType?.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      color: mode === 'dark' ? '#94a3b8' : '#64748b',
                      fontWeight: 500
                    }}>
                      Date:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
                    }}>
                      {new Date(paymentToDelete.paymentDate).toLocaleDateString()}
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
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: mode === 'dark' ? '#f1f5f9' : '#1e293b' }}>
              Admin Password Verification:
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Enter your admin password"
              value={deletePaymentPassword}
              onChange={(e) => setDeletePaymentPassword(e.target.value)}
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
            onClick={handleDeletePaymentCancel} 
            disabled={deletePaymentLoading}
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
            onClick={handleDeletePaymentConfirm}
            color="error"
            variant="contained"
            disabled={deletePaymentLoading || !deletePaymentPassword.trim()}
            startIcon={deletePaymentLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
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
            {deletePaymentLoading ? 'Deleting...' : 'Delete Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SaleDetails;