import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';
import apiService from '../services/api';
import { DubaiTransportInvoice } from '../types';

const DubaiTransportInvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount_aed: '',
    conversion_rate: '',
    agent: '',
    invoice_date: new Date(),
    due_date: new Date()
  });

  // Auto-calculated PKR amount
  const amountPKR = useMemo(() => {
    const aed = parseFloat(formData.amount_aed) || 0;
    const rate = parseFloat(formData.conversion_rate) || 0;
    return rate > 0 ? aed * rate : 0;
  }, [formData.amount_aed, formData.conversion_rate]);

  useEffect(() => {
    if (isEditing) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await apiService.getDubaiTransportInvoice(id!);
      if (res.success && res.data) {
        const invoice = res.data;
        setFormData({
          amount_aed: invoice.amount_aed.toString(),
          conversion_rate: invoice.conversion_rate.toString(),
          agent: invoice.agent,
          invoice_date: new Date(invoice.invoice_date),
          due_date: new Date(invoice.due_date)
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount_aed || !formData.conversion_rate || !formData.agent) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const data = {
        amount_aed: parseFloat(formData.amount_aed),
        conversion_rate: parseFloat(formData.conversion_rate),
        agent: formData.agent,
        invoice_date: format(formData.invoice_date, 'yyyy-MM-dd'),
        due_date: format(formData.due_date, 'yyyy-MM-dd'),
      };

      if (isEditing) {
        await apiService.updateDubaiTransportInvoice(id!, data);
        setSuccess('Dubai Transport invoice updated successfully!');
      } else {
        await apiService.createDubaiTransportInvoice(data);
        setSuccess('Dubai Transport invoice created successfully!');
        navigate('/dubai-transport-invoices?newInvoice=true');
        return;
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#1e3a8a',
  }));

  const formatCurrency = (amount: number, currency: 'PKR' | 'AED') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading && isEditing) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dubai-transport-invoices')}
            sx={{ color: 'primary.main' }}
          >
            Back
          </Button>
          <Title variant="h4">
            {isEditing ? 'Edit Dubai Transport Invoice' : 'New Dubai Transport Invoice'}
          </Title>
        </Stack>

        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Amount AED and Conversion Rate */}
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Amount (AED) *"
                    type="number"
                    value={formData.amount_aed}
                    onChange={(e) => setFormData({ ...formData, amount_aed: e.target.value })}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Conversion Rate (PKR per AED) *"
                    type="number"
                    value={formData.conversion_rate}
                    onChange={(e) => setFormData({ ...formData, conversion_rate: e.target.value })}
                    inputProps={{ min: 0.000001, step: 0.000001 }}
                    required
                    helperText="e.g., 78 PKR = 1 AED"
                  />
                </Box>
              </Stack>

              {/* Auto-calculated PKR Amount */}
              <Box>
                <Card sx={{ backgroundColor: 'background.paper' }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Calculated Amount (PKR)
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(amountPKR, 'PKR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Agent */}
              <Box>
                <TextField
                  fullWidth
                  label="Agent *"
                  value={formData.agent}
                  onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                  required
                />
              </Box>

              {/* Invoice Date and Due Date */}
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    label="Invoice Date *"
                    value={formData.invoice_date}
                    onChange={(newValue) => setFormData({ ...formData, invoice_date: newValue || new Date() })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    label="Due Date *"
                    value={formData.due_date}
                    onChange={(newValue) => setFormData({ ...formData, due_date: newValue || new Date() })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </Box>
              </Stack>

              {/* Submit Button */}
              <Box>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dubai-transport-invoices')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                    sx={{
                      backgroundColor: 'primary.main',
                      '&:hover': { backgroundColor: '#1e40af' },
                    }}
                  >
                    {saving ? 'Saving...' : (isEditing ? 'Update Invoice' : 'Create Invoice')}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </form>
        </Paper>

        {/* Notifications */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default DubaiTransportInvoiceForm;
