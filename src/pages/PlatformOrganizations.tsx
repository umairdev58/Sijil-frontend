import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AddBusiness, Business, PauseCircleOutline, PlayCircleOutline } from '@mui/icons-material';
import apiService, { CreateOrganizationPayload } from '../services/api';
import { Organization } from '../types';

const emptyForm: CreateOrganizationPayload = {
  name: '',
  legalName: '',
  trn: '',
  address: '',
  phone: '',
  email: '',
  logoUrl: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

const PlatformOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateOrganizationPayload>(emptyForm);

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOrganizations();
      if (!response.success) throw new Error(response.message || 'Failed to load organizations');
      setOrganizations(response.organizations || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await apiService.createOrganization(form);
      if (!response.success) throw new Error(response.message || 'Failed to create organization');
      setDialogOpen(false);
      setForm(emptyForm);
      await loadOrganizations();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (organization: Organization) => {
    const nextStatus = organization.status === 'active' ? 'suspended' : 'active';
    const action = nextStatus === 'suspended' ? 'suspend' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${organization.name}?`)) return;

    try {
      setError(null);
      await apiService.updateOrganization(organization._id || organization.id!, { status: nextStatus });
      setOrganizations(current => current.map(item =>
        (item._id || item.id) === (organization._id || organization.id)
          ? { ...item, status: nextStatus }
          : item
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} organization`);
    }
  };

  const requiredFieldsPresent = form.name && form.adminName && form.adminEmail && form.adminPassword.length >= 6;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>Organizations</Typography>
          <Typography color="text.secondary">Manage tenants and their initial administrators.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddBusiness />} onClick={() => setDialogOpen(true)}>
          Create Organization
        </Button>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>TRN</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Business sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No organizations found.</Typography>
                </TableCell>
              </TableRow>
            ) : organizations.map(organization => (
              <TableRow key={organization._id || organization.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{organization.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{organization.legalName || '—'}</Typography>
                </TableCell>
                <TableCell>{organization.trn || '—'}</TableCell>
                <TableCell>
                  <Typography variant="body2">{organization.email || '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{organization.phone || ''}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={organization.status === 'active' ? 'Active' : 'Suspended'}
                    color={organization.status === 'active' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color={organization.status === 'active' ? 'warning' : 'success'}
                    startIcon={organization.status === 'active' ? <PauseCircleOutline /> : <PlayCircleOutline />}
                    onClick={() => handleStatusChange(organization)}
                  >
                    {organization.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 2 }}>Organization profile</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField required label="Display Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Legal Name" value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} />
            <TextField label="TRN" value={form.trn} onChange={e => setForm({ ...form, trn: e.target.value })} />
            <TextField label="Organization Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Logo URL" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} />
            <TextField label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} sx={{ gridColumn: { sm: '1 / -1' } }} />
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>Initial administrator</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField required label="Admin Name" value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} />
            <TextField required label="Admin Email" type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} />
            <TextField
              required
              label="Temporary Password"
              type="password"
              value={form.adminPassword}
              onChange={e => setForm({ ...form, adminPassword: e.target.value })}
              helperText="At least 6 characters"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting || !requiredFieldsPresent}>
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlatformOrganizations;
