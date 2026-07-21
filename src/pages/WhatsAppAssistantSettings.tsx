import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, WhatsApp } from '@mui/icons-material';
import apiService, { WhatsAppAuthorizedNumber } from '../services/api';

const emptyForm = { phoneNumber: '', label: '' };

const WhatsAppAssistantSettings: React.FC = () => {
  const [numbers, setNumbers] = useState<WhatsAppAuthorizedNumber[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<WhatsAppAuthorizedNumber | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadNumbers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWhatsAppAuthorizedNumbers();
      setNumbers(response.numbers);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Failed to load authorized numbers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNumbers();
  }, []);

  const openCreateDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (number: WhatsAppAuthorizedNumber) => {
    setEditing(number);
    setForm({ phoneNumber: number.phoneNumber, label: number.label });
    setDialogOpen(true);
  };

  const saveNumber = async () => {
    if (!/^\+?[\d\s()-]{7,20}$/.test(form.phoneNumber.trim())) {
      setError('Enter a valid phone number including country code');
      return;
    }

    try {
      setSaving(true);
      const response = editing
        ? await apiService.updateWhatsAppAuthorizedNumber(editing._id, form)
        : await apiService.createWhatsAppAuthorizedNumber(form);
      setSuccess(response.message);
      setDialogOpen(false);
      await loadNumbers();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Failed to save authorized number');
    } finally {
      setSaving(false);
    }
  };

  const toggleNumber = async (number: WhatsAppAuthorizedNumber) => {
    try {
      const response = await apiService.updateWhatsAppAuthorizedNumber(number._id, {
        isActive: !number.isActive,
      });
      setNumbers((current) => current.map((item) => (
        item._id === number._id ? response.number : item
      )));
      setSuccess(response.message);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Failed to update authorization');
    }
  };

  const deleteNumber = async (number: WhatsAppAuthorizedNumber) => {
    if (!window.confirm(`Remove ${number.label || number.phoneNumber} from the WhatsApp allowlist?`)) {
      return;
    }
    try {
      await apiService.deleteWhatsAppAuthorizedNumber(number._id);
      setNumbers((current) => current.filter((item) => item._id !== number._id));
      setSuccess('WhatsApp number removed successfully');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Failed to remove authorized number');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsApp color="success" />
            <Typography variant="h4" component="h1">WhatsApp Assistant</Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage the phone numbers allowed to retrieve Sijil Record information.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
          Add number
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Use the full international number with country code. Inactive and unlisted numbers cannot run assistant commands.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Phone number</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Added</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && numbers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No WhatsApp numbers have been authorized.
                </TableCell>
              </TableRow>
            )}
            {numbers.map((number) => (
              <TableRow key={number._id}>
                <TableCell>{number.label || '—'}</TableCell>
                <TableCell>+{number.phoneNumber}</TableCell>
                <TableCell>
                  <Switch
                    checked={number.isActive}
                    onChange={() => toggleNumber(number)}
                    inputProps={{ 'aria-label': `Toggle ${number.phoneNumber}` }}
                  />
                </TableCell>
                <TableCell>{new Date(number.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="Edit number" onClick={() => openEditDialog(number)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" aria-label="Delete number" onClick={() => deleteNumber(number)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit authorized number' : 'Add authorized number'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Phone number"
            placeholder="+971501234567"
            value={form.phoneNumber}
            onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
            margin="normal"
            helperText="Include the international country code"
          />
          <TextField
            fullWidth
            label="Label"
            placeholder="Accounts manager"
            value={form.label}
            onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
            margin="normal"
            inputProps={{ maxLength: 80 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={saveNumber} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(success)} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default WhatsAppAssistantSettings;
