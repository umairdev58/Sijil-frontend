import React, { useEffect, useState, useCallback } from 'react';
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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api';
import { styled } from '@mui/material/styles';

const FreightInvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    invoice_number: '',
    description: '',
    container_number: '',
    amount_aed: '',
    invoice_date: new Date(),
    due_date: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getFreightInvoice(id!);
      if (res.success && res.data) {
        const invoice = res.data;
        setFormData({
          invoice_number: invoice.invoice_number,
          description: invoice.description || '',
          container_number: invoice.container_number || '',
          amount_aed: invoice.amount_aed.toString(),
          invoice_date: new Date(invoice.invoice_date),
          due_date: new Date(invoice.due_date),
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      loadInvoice();
    }
  }, [isEditing, loadInvoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoice_number || !formData.amount_aed) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const data = {
        invoice_number: formData.invoice_number,
        description: formData.description,
        container_number: formData.container_number,
        amount_aed: parseFloat(formData.amount_aed),
        invoice_date: formData.invoice_date.toISOString(),
        due_date: formData.due_date.toISOString(),
      };

      if (isEditing) {
        await apiService.updateFreightInvoice(id!, data);
        setSuccess('Freight invoice updated successfully!');
      } else {
        await apiService.createFreightInvoice(data);
        setSuccess('Freight invoice created successfully!');
        navigate('/freight-invoices?newInvoice=true');
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

  if (loading) {
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
            onClick={() => navigate('/freight-invoices')}
            sx={{ color: 'primary.main' }}
          >
            Back
          </Button>
          <Title variant="h4">
            {isEditing ? 'Edit Freight Invoice' : 'New Freight Invoice'}
          </Title>
        </Stack>

        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Invoice Number *"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label="Shipment / Container Number"
                value={formData.container_number}
                onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />

              <TextField
                fullWidth
                label="Amount (AED) *"
                type="number"
                value={formData.amount_aed}
                onChange={(e) => setFormData({ ...formData, amount_aed: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />

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

              <Box>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/freight-invoices')}
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

export default FreightInvoiceForm;
