import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Stack, Typography, Card, CardContent, CardHeader, Divider, Button, Alert, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowBack as BackIcon, Edit as EditIcon, LocalShipping as TransportIcon, FlightTakeoff as FreightIcon, ReceiptLong as EFormIcon, AttachMoney as MoneyIcon, SwapHoriz as RateIcon, Inventory2 as ProductIcon, Numbers as ContainerIcon } from '@mui/icons-material';
import apiService from '../services/api';
import { Purchase } from '../types';

const PurchaseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getPurchase(id!);
        if (res.success && res.data) {
          setPurchase(res.data as Purchase);
        } else {
          setError(res.message || 'Failed to load purchase');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load purchase');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    color: '#1e3a8a', // Dark navy blue
  }));

  const StatCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  }));

  const totalAED = useMemo(() => purchase?.totalAED || 0, [purchase]);
  const totalPKR = useMemo(() => purchase?.totalPKR || 0, [purchase]);

  if (loading) return <Box sx={{ p: 2 }}>Loading...</Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!purchase) return null;

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Title variant="h4">Purchase Details</Title>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/purchases')}>Back</Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/purchases/${purchase._id}/edit`)}>Edit</Button>
        </Stack>
      </Stack>

      {/* Top stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
        <StatCard>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography variant="overline" color="text.secondary">Total (PKR)</Typography>
                <Typography variant="h5" fontWeight={700}>PKR {totalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Chip icon={<MoneyIcon />} label="PKR" color="primary" variant="outlined" />
            </Stack>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography variant="overline" color="text.secondary">Transfer Rate</Typography>
                <Typography variant="h5" fontWeight={700}>{purchase.transferRate} PKR/AED</Typography>
              </Stack>
              <Chip icon={<RateIcon />} label="PKR/AED" color="default" variant="outlined" />
            </Stack>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Typography variant="overline" color="text.secondary">Total (AED)</Typography>
                <Typography variant="h5" fontWeight={700}>AED {totalAED.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Chip icon={<MoneyIcon />} label="AED" color="success" variant="outlined" />
            </Stack>
          </CardContent>
        </StatCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
        {/* Left: Details */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <CardHeader title="General" subheader="Container and product information" />
            <Divider />
            <CardContent>
              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary"><ContainerIcon fontSize="small" /> Container</Typography>
                  <Typography fontWeight={600}>{purchase.containerNo}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary"><ProductIcon fontSize="small" /> Product</Typography>
                  <Typography fontWeight={600}>{purchase.product}</Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Quantity</Typography>
                  <Typography fontWeight={600}>{purchase.quantity?.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Rate (PKR)</Typography>
                  <Typography fontWeight={600}>PKR {purchase.rate?.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal (PKR)</Typography>
                  <Typography fontWeight={700}>PKR {purchase.subtotalPKR?.toLocaleString()}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <CardHeader title="Costs" subheader="Breakdown of additional costs" />
            <Divider />
            <CardContent>
              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary"><TransportIcon fontSize="small" /> Transport</Typography>
                  <Typography fontWeight={600}>PKR {purchase.transport?.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary"><FreightIcon fontSize="small" /> Freight</Typography>
                  <Typography fontWeight={600}>PKR {purchase.freight?.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary"><EFormIcon fontSize="small" /> E-Form</Typography>
                  <Typography fontWeight={600}>PKR {purchase.eForm?.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Miscellaneous</Typography>
                  <Typography fontWeight={600}>PKR {purchase.miscellaneous?.toLocaleString()}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Right: Summary */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', position: 'sticky', top: 20 }}>
          <CardHeader title="Summary" subheader="Auto-calculated totals" />
          <Divider />
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Total (PKR)</Typography>
                <Typography fontWeight={700}>PKR {totalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Transfer Rate</Typography>
                <Typography fontWeight={700}>{purchase.transferRate} PKR/AED</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Total (AED)</Typography>
                <Typography fontWeight={700}>AED {totalAED.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PurchaseView;


