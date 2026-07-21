import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Business, Save } from '@mui/icons-material';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Organization } from '../types';

type OrganizationForm = Pick<Organization, 'name' | 'legalName' | 'trn' | 'address' | 'phone' | 'email' | 'logoUrl'>;

const emptyForm: OrganizationForm = {
  name: '',
  legalName: '',
  trn: '',
  address: '',
  phone: '',
  email: '',
  logoUrl: '',
};

const OrganizationSettings: React.FC = () => {
  const { refreshAuth } = useAuth();
  const [form, setForm] = useState<OrganizationForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyOrganization();
        const organization = response.organization || response.data;
        if (!response.success || !organization) throw new Error(response.message || 'Failed to load organization');
        setForm({
          name: organization.name || '',
          legalName: organization.legalName || '',
          trn: organization.trn || '',
          address: organization.address || '',
          phone: organization.phone || '',
          email: organization.email || '',
          logoUrl: organization.logoUrl || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load organization');
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const response = await apiService.updateMyOrganization(form);
      if (!response.success) throw new Error(response.message || 'Failed to update organization');
      await refreshAuth();
      setSuccess('Organization profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ minHeight: 300, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>Organization Settings</Typography>
        <Typography color="text.secondary">Update the company details used across your workspace and documents.</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Business color="primary" />
            <Typography variant="h6">Company Profile</Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
            <TextField required label="Display Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Legal Name" value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} />
            <TextField label="TRN" value={form.trn} onChange={e => setForm({ ...form, trn: e.target.value })} helperText="Displayed on VAT documents" />
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Logo URL" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} />
            <TextField
              label="Address"
              multiline
              minRows={3}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              sx={{ gridColumn: { sm: '1 / -1' } }}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrganizationSettings;
