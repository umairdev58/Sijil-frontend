import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Divider,
  Stack,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import apiService from '../services/api';
import { DailyLedger, LedgerEntry } from '../types';
import BeautifulDownloadButton from '../components/BeautifulDownloadButton';
import BeautifulRefreshButton from '../components/BeautifulRefreshButton';

const DailyLedgerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyLedger, setDailyLedger] = useState<DailyLedger | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Dialog states
  const [openLedgerDialog, setOpenLedgerDialog] = useState(false);
  const [openEntryDialog, setOpenEntryDialog] = useState(false);
  const [openCloseDialog, setOpenCloseDialog] = useState(false);
  
  // Form states
  const [ledgerForm, setLedgerForm] = useState({
    opening_cash: '',
    opening_bank: '',
    notes: ''
  });
  
  const [entryForm, setEntryForm] = useState({
    type: 'receipt' as 'receipt' | 'payment',
    mode: 'cash' as 'cash' | 'bank',
    description: '',
    amount: ''
  });

  // Load daily ledger data
  const loadDailyLedger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiService.getDailyLedger(dateStr);
      
      if (response.success) {
        setDailyLedger(response.data.ledger);
        setEntries(response.data.entries);
      } else {
        setDailyLedger(null);
        setEntries([]);
      }
    } catch (error: any) {
      console.error('Error loading daily ledger:', error);
      setError(error.response?.data?.message || 'Failed to load daily ledger');
      setDailyLedger(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Load data when date changes
  useEffect(() => {
    loadDailyLedger();
  }, [loadDailyLedger]);

  // Create or update daily ledger
  const handleCreateLedger = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiService.createOrUpdateDailyLedger({
        date: dateStr,
        opening_cash: parseFloat(ledgerForm.opening_cash) || 0,
        opening_bank: parseFloat(ledgerForm.opening_bank) || 0,
        notes: ledgerForm.notes
      });
      
      if (response.success) {
        setSuccessMessage(response.message || 'Daily ledger created successfully');
        setOpenLedgerDialog(false);
        loadDailyLedger();
        setLedgerForm({ opening_cash: '', opening_bank: '', notes: '' });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create daily ledger');
    }
  };

  // Add ledger entry
  const handleAddEntry = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiService.addLedgerEntry({
        ledger_date: dateStr,
        type: entryForm.type,
        mode: entryForm.mode,
        description: entryForm.description,
        amount: parseFloat(entryForm.amount)
      });
      
      if (response.success) {
        setSuccessMessage('Entry added successfully');
        setOpenEntryDialog(false);
        loadDailyLedger();
        setEntryForm({ type: 'receipt', mode: 'cash', description: '', amount: '' });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add entry');
    }
  };

  // Delete ledger entry
  const handleDeleteEntry = async (entryId: string) => {
    try {
      const response = await apiService.deleteLedgerEntry(entryId);
      
      if (response.success) {
        setSuccessMessage('Entry deleted successfully');
        loadDailyLedger();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  // Close daily ledger
  const handleCloseLedger = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiService.closeDailyLedger(dateStr);
      
      if (response.success) {
        setSuccessMessage('Daily ledger closed successfully');
        setOpenCloseDialog(false);
        loadDailyLedger();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to close daily ledger');
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await apiService.exportDailyLedgerPDF(dateStr);
      setSuccessMessage('PDF exported successfully');
    } catch (error: any) {
      setError('Failed to export PDF');
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = {
      receipts_cash: 0,
      receipts_bank: 0,
      payments_cash: 0,
      payments_bank: 0
    };

    entries.forEach(entry => {
      if (entry.type === 'receipt') {
        if (entry.mode === 'cash') {
          totals.receipts_cash += entry.amount;
        } else {
          totals.receipts_bank += entry.amount;
        }
      } else {
        if (entry.mode === 'cash') {
          totals.payments_cash += entry.amount;
        } else {
          totals.payments_bank += entry.amount;
        }
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Daily Ledger
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage daily cash and bank transactions
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <BeautifulRefreshButton 
              onClick={loadDailyLedger} 
              disabled={loading}
            />
            <BeautifulDownloadButton 
              onClick={handleExportPDF}
              disabled={!dailyLedger}
              tooltipText="Export to PDF"
            />
          </Stack>
        </Box>

        {/* Date Selection */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newDate) => newDate && setSelectedDate(newDate)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={() => setOpenLedgerDialog(true)}
                disabled={dailyLedger?.is_closed}
                startIcon={<AddIcon />}
              >
                {dailyLedger ? 'Update Opening Balances' : 'Create Daily Ledger'}
              </Button>
            </Box>
            {dailyLedger && !dailyLedger.is_closed && (
              <Box>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => setOpenCloseDialog(true)}
                  startIcon={<LockIcon />}
                >
                  Close Ledger
                </Button>
              </Box>
            )}
            {dailyLedger && !dailyLedger.is_closed && (
              <Box>
                <Fab
                  color="primary"
                  size="small"
                  onClick={() => setOpenEntryDialog(true)}
                  sx={{ boxShadow: 2 }}
                >
                  <AddIcon />
                </Fab>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Daily Ledger Summary */}
        {dailyLedger && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            {/* Opening Balances */}
            <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Opening Balances
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Cash:</Typography>
                      <Typography variant="h6" color="primary">
                        AED {dailyLedger.opening_cash.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Bank:</Typography>
                      <Typography variant="h6" color="primary">
                        AED {dailyLedger.opening_bank.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Closing Balances */}
            <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Closing Balances
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Cash:</Typography>
                      <Typography variant="h6" color="success.main">
                        AED {dailyLedger.closing_cash.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Bank:</Typography>
                      <Typography variant="h6" color="success.main">
                        AED {dailyLedger.closing_bank.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Transaction Summary */}
        {dailyLedger && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            {/* Receipts */}
            <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Receipts
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Cash:</Typography>
                      <Typography>AED {totals.receipts_cash.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Bank:</Typography>
                      <Typography>AED {totals.receipts_bank.toLocaleString()}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        AED {(totals.receipts_cash + totals.receipts_bank).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Payments */}
            <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="error.main">
                    Payments
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Cash:</Typography>
                      <Typography>AED {totals.payments_cash.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Bank:</Typography>
                      <Typography>AED {totals.payments_bank.toLocaleString()}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        AED {(totals.payments_cash + totals.payments_bank).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Ledger Entries Table */}
        {dailyLedger && (
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Ledger Entries ({entries.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No entries found for this date
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry._id} hover>
                        <TableCell>
                          {format(parseISO(entry.created_at), 'HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.type.toUpperCase()}
                            color={entry.type === 'receipt' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.mode.toUpperCase()}
                            color={entry.mode === 'cash' ? 'warning' : 'info'}
                            size="small"
                            icon={entry.mode === 'cash' ? <MoneyIcon /> : <BankIcon />}
                          />
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell align="right">
                          <Typography
                            color={entry.type === 'receipt' ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            AED {entry.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {entry.reference_type === 'manual' ? (
                            <Chip label="Manual" size="small" variant="outlined" />
                          ) : (
                            <Chip label="Auto" size="small" color="primary" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {entry.reference_type === 'manual' && !dailyLedger.is_closed && (
                            <Tooltip title="Delete Entry">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteEntry(entry._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Create/Update Ledger Dialog */}
        <Dialog open={openLedgerDialog} onClose={() => setOpenLedgerDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dailyLedger ? 'Update Opening Balances' : 'Create Daily Ledger'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Opening Cash Balance"
                type="number"
                value={ledgerForm.opening_cash}
                onChange={(e) => setLedgerForm({ ...ledgerForm, opening_cash: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                label="Opening Bank Balance"
                type="number"
                value={ledgerForm.opening_bank}
                onChange={(e) => setLedgerForm({ ...ledgerForm, opening_bank: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={ledgerForm.notes}
                onChange={(e) => setLedgerForm({ ...ledgerForm, notes: e.target.value })}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLedgerDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateLedger} variant="contained">
              {dailyLedger ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Entry Dialog */}
        <Dialog open={openEntryDialog} onClose={() => setOpenEntryDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Ledger Entry</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={entryForm.type}
                  label="Type"
                  onChange={(e) => setEntryForm({ ...entryForm, type: e.target.value as 'receipt' | 'payment' })}
                >
                  <MenuItem value="receipt">Receipt</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select
                  value={entryForm.mode}
                  label="Mode"
                  onChange={(e) => setEntryForm({ ...entryForm, mode: e.target.value as 'cash' | 'bank' })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={entryForm.description}
                onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Amount"
                type="number"
                value={entryForm.amount}
                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                }}
                fullWidth
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEntryDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddEntry} 
              variant="contained"
              disabled={!entryForm.description || !entryForm.amount}
            >
              Add Entry
            </Button>
          </DialogActions>
        </Dialog>

        {/* Close Ledger Dialog */}
        <Dialog open={openCloseDialog} onClose={() => setOpenCloseDialog(false)}>
          <DialogTitle>Close Daily Ledger</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to close the daily ledger for {format(selectedDate, 'MMMM dd, yyyy')}?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCloseDialog(false)}>Cancel</Button>
            <Button onClick={handleCloseLedger} variant="contained" color="warning">
              Close Ledger
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default DailyLedgerPage;
