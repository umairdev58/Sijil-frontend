import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  InputAdornment,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ShoppingCart as ProductIcon,
  LocalShipping as TransportIcon,
  FlightTakeoff as FreightIcon,
  ReceiptLong as EFormIcon,
  AttachMoney as MoneyIcon,
  SwapHoriz as RateIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { Purchase } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const defaultForm: Partial<Purchase> = {
  product: '',
  quantity: 1,
  rate: 0,
  transport: 0,
  freight: 0,
  eForm: 0,
  miscellaneous: 0,
  transferRate: 0,
  subtotalPKR: 0,
  totalPKR: 0,
  totalAED: 0,
  notes: '',
};

const PurchaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isNew = id === 'new' || window.location.pathname === '/purchases/new';
  const [form, setForm] = useState<Partial<Purchase>>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || isNew) return;
      try {
        const res = await apiService.getPurchase(id);
        if (res.success && res.data) {
          setForm(res.data as any);
        } else {
          setError(res.message || 'Failed to load purchase');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load purchase');
      }
    };
    load();
  }, [id, isNew]);

  const recalc = useMemo(() => {
    const quantity = Number(form.quantity) || 0;
    const rate = Number(form.rate) || 0; // PKR
    const transport = Number(form.transport) || 0;
    const freight = Number(form.freight) || 0;
    const eForm = Number(form.eForm) || 0;
    const miscellaneous = Number(form.miscellaneous) || 0;
    const transferRate = Number(form.transferRate) || 0; // PKR per AED
    const subtotalPKR = quantity * rate;
    const totalPKR = subtotalPKR + transport + freight + eForm + miscellaneous;
    const totalAED = transferRate > 0 ? totalPKR / transferRate : 0;
    return { subtotalPKR, totalPKR, totalAED };
  }, [form]);

  const setNumeric = (field: keyof Purchase, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val === '' ? '' : Number(val) } as any));
  };

  const handleCancel = () => navigate('/purchases');

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = { ...form, ...recalc };
      if (isNew) {
        const res = await apiService.createPurchase(payload);
        if (res.success) {
          navigate('/purchases?newPurchase=true');
        } else {
          setError(res.message || 'Failed to create purchase');
        }
      } else if (id) {
        const res = await apiService.updatePurchase(id, payload);
        if (res.success) {
          navigate('/purchases');
        } else {
          setError(res.message || 'Failed to update purchase');
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Convert number to words in Indian numbering system using 'lac'
  const numberToIndianWords = (value: number): string => {
    if (!isFinite(value)) return '';
    const n = Math.floor(Math.abs(value));
    if (n === 0) return 'zero';

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const twoDigits = (num: number): string => {
      if (num < 20) return ones[num];
      const t = Math.floor(num / 10);
      const o = num % 10;
      return tens[t] + (o ? ' ' + ones[o] : '');
    };

    const threeDigits = (num: number): string => {
      const h = Math.floor(num / 100);
      const rest = num % 100;
      let res = '';
      if (h) res += ones[h] + ' hundred';
      if (rest) res += (res ? ' ' : '') + twoDigits(rest);
      return res;
    };

    const parts: string[] = [];
    let remaining = n;

    const crore = Math.floor(remaining / 10000000);
    if (crore) {
      parts.push(threeDigits(crore) + ' crore');
      remaining %= 10000000;
    }

    const lac = Math.floor(remaining / 100000);
    if (lac) {
      parts.push(threeDigits(lac) + ' lac');
      remaining %= 100000;
    }

    const thousand = Math.floor(remaining / 1000);
    if (thousand) {
      parts.push(twoDigits(thousand) + ' thousand');
      remaining %= 1000;
    }

    if (remaining) {
      parts.push(threeDigits(remaining));
    }

    return parts.join(' ');
  };

  const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    color: mode === 'dark' ? '#60a5fa' : '#1e3a8a', // Light blue for dark mode, dark navy for light mode
  }));

  const StatCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
    bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
    border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
  }));

  return (
    <Box sx={{ 
      p: { xs: 1, md: 2 },
      minHeight: '100vh',
      bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.3)' : 'background.default',
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Title variant="h4">{isNew ? 'New Purchase' : 'Edit Purchase'}</Title>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<CancelIcon />} 
            onClick={handleCancel} 
            disabled={saving}
            sx={{
              borderColor: mode === 'dark' ? 'rgba(148,163,184,0.3)' : 'rgba(0,0,0,0.23)',
              color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : 'inherit',
              '&:hover': {
                borderColor: mode === 'dark' ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.4)',
                bgcolor: mode === 'dark' ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSave} 
            disabled={saving || !form.product || !form.transferRate || (form.quantity as any) <= 0}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: mode === 'dark' ? '0 4px 12px rgba(59,130,246,0.3)' : '0 4px 12px rgba(59,130,246,0.2)',
              '&:hover': {
                boxShadow: mode === 'dark' ? '0 6px 16px rgba(59,130,246,0.4)' : '0 6px 16px rgba(59,130,246,0.3)',
              }
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Top stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
        <StatCard>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography variant="overline" color="text.secondary">Subtotal (PKR)</Typography>
                <Typography variant="h5" fontWeight={700}>PKR {recalc.subtotalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Chip icon={<MoneyIcon />} label="PKR" color="primary" variant="outlined" />
            </Stack>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography variant="overline" color="text.secondary">Total (PKR)</Typography>
                <Typography variant="h5" fontWeight={700}>PKR {recalc.totalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Chip icon={<MoneyIcon />} label="TOTAL" color="success" variant="outlined" />
            </Stack>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography variant="overline" color="text.secondary">Total (AED)</Typography>
                <Typography variant="h5" fontWeight={700}>AED {recalc.totalAED.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Chip icon={<RateIcon />} label="AED" color="info" variant="outlined" />
            </Stack>
          </CardContent>
        </StatCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
        {/* Left: Form */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <CardHeader title="Purchase Details" subheader="Fill in product, costs, and conversion" />
          <Divider />
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField fullWidth label="Container Number" value={(form as any).containerNo || ''} onChange={(e) => setForm({ ...form, containerNo: e.target.value } as any)} />
              <TextField fullWidth label="Product" value={form.product || ''} onChange={(e) => setForm({ ...form, product: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><ProductIcon fontSize="small" /></InputAdornment> }} />
              <TextField fullWidth label="Quantity" type="number" value={form.quantity as any} onChange={(e) => setNumeric('quantity', e.target.value)} helperText={Number(form.quantity) > 0 ? numberToIndianWords(Number(form.quantity)) : ' '} />
              <TextField fullWidth label="Rate" type="number" value={form.rate as any} onChange={(e) => setNumeric('rate', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} helperText={Number(form.rate) > 0 ? numberToIndianWords(Number(form.rate)) : ' '} />
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>Costs</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Transport"
                type="number"
                value={form.transport as any}
                onChange={(e) => setNumeric('transport', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><TransportIcon fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end">PKR</InputAdornment> }}
                helperText={
                  Number(form.transport) > 0 ? (
                    <Box component="span">
                      {Number(form.transferRate) > 0 ? `≈ AED ${(Number(form.transport) / Number(form.transferRate)).toFixed(2)} · ` : ''}
                      {numberToIndianWords(Number(form.transport))}
                    </Box>
                  ) : ' '
                }
              />
              <TextField
                fullWidth
                label="Freight"
                type="number"
                value={form.freight as any}
                onChange={(e) => setNumeric('freight', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><FreightIcon fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end">PKR</InputAdornment> }}
                helperText={
                  Number(form.freight) > 0 ? (
                    <Box component="span">
                      {Number(form.transferRate) > 0 ? `≈ AED ${(Number(form.freight) / Number(form.transferRate)).toFixed(2)} · ` : ''}
                      {numberToIndianWords(Number(form.freight))}
                    </Box>
                  ) : ' '
                }
              />
              <TextField
                fullWidth
                label="E-Form"
                type="number"
                value={form.eForm as any}
                onChange={(e) => setNumeric('eForm', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EFormIcon fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end">PKR</InputAdornment> }}
                helperText={
                  Number(form.eForm) > 0 ? (
                    <Box component="span">
                      {Number(form.transferRate) > 0 ? `≈ AED ${(Number(form.eForm) / Number(form.transferRate)).toFixed(2)} · ` : ''}
                      {numberToIndianWords(Number(form.eForm))}
                    </Box>
                  ) : ' '
                }
              />
              <TextField
                fullWidth
                label="Miscellaneous"
                type="number"
                value={form.miscellaneous as any}
                onChange={(e) => setNumeric('miscellaneous', e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">PKR</InputAdornment> }}
                helperText={
                  Number(form.miscellaneous) > 0 ? (
                    <Box component="span">
                      {Number(form.transferRate) > 0 ? `≈ AED ${(Number(form.miscellaneous) / Number(form.transferRate)).toFixed(2)} · ` : ''}
                      {numberToIndianWords(Number(form.miscellaneous))}
                    </Box>
                  ) : ' '
                }
              />
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>Conversion</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField fullWidth label="Transfer Rate (PKR per AED)" type="number" value={form.transferRate as any} onChange={(e) => setNumeric('transferRate', e.target.value)} helperText="Example: 78 means 1 AED = 78 PKR" InputProps={{ startAdornment: <InputAdornment position="start"><RateIcon fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end">PKR/AED</InputAdornment> }} />
              <TextField fullWidth label="Subtotal (PKR)" value={recalc.subtotalPKR.toFixed(2)} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} helperText={recalc.subtotalPKR > 0 ? numberToIndianWords(recalc.subtotalPKR) : ' '} />
              <TextField fullWidth label="Total (PKR)" value={recalc.totalPKR.toFixed(2)} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">PKR</InputAdornment> }} helperText={recalc.totalPKR > 0 ? numberToIndianWords(recalc.totalPKR) : ' '} />
              <TextField fullWidth label="Total (AED)" value={recalc.totalAED.toFixed(2)} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">AED</InputAdornment> }} helperText={recalc.totalAED > 0 ? numberToIndianWords(recalc.totalAED) : ' '} />
            </Box>

            <Box sx={{ mt: 2 }}>
              <TextField fullWidth multiline rows={4} label="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><NotesIcon fontSize="small" /></InputAdornment> }} />
            </Box>
          </CardContent>
        </Card>

        {/* Right: Summary */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', position: 'sticky', top: 20 }}>
          <CardHeader title="Summary" subheader="Auto-calculated totals" />
          <Divider />
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={700}>PKR {recalc.subtotalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Total (PKR)</Typography>
                <Typography fontWeight={700}>PKR {recalc.totalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Total (AED)</Typography>
                <Typography fontWeight={700}>AED {recalc.totalAED.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PurchaseDetails;


