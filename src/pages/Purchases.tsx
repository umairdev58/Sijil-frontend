import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TablePagination,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { Purchase } from '../types';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';

 

const PurchasesPage: React.FC = () => {
  const { mode } = useTheme();
  const [rows, setRows] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  // Auto-search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput.trim());
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.getPurchases(page + 1, rowsPerPage, search);
      if (res.success) {
        setRows(res.data);
        setTotalCount(res.pagination?.totalPurchases || 0);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Show success after creating a purchase
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('newPurchase') === 'true') {
      setSuccess('New purchase has been created successfully!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const del = async (id: string) => {
    if (!window.confirm('Delete this purchase?')) return;
    try {
      const res = await apiService.deletePurchase(id);
      if (res.success) {
        setSuccess('Purchase deleted');
        load();
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const Title = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    color: mode === 'dark' ? '#60a5fa' : '#1e3a8a', // Light blue for dark mode, dark navy for light mode
  }));

  const pageTotals = useMemo(() => {
    const totalPKR = rows.reduce((sum, r) => sum + (r.totalPKR || 0), 0);
    const totalAED = rows.reduce((sum, r) => sum + (r.totalAED || 0), 0);
    return { totalPKR, totalAED };
  }, [rows]);

  return (
    <Box sx={{ 
      p: 2,
      minHeight: '100vh',
      bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.3)' : 'background.default',
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Title variant="h4">Purchase</Title>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/purchases/new')}
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
          New Purchase
        </Button>
      </Stack>

      {/* Quick stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
        <Card sx={{ 
          borderRadius: 2, 
          boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
          bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
          border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
        }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Total Purchases</Typography>
            <Typography variant="h5" fontWeight={700}>{totalCount.toLocaleString()}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ 
          borderRadius: 2, 
          boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
          bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
          border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
        }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack>
                <Typography variant="overline" color="text.secondary">Page Total (PKR)</Typography>
                <Typography variant="h5" fontWeight={700}>PKR {pageTotals.totalPKR.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Chip icon={<MoneyIcon />} label="PKR" variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ 
          borderRadius: 2, 
          boxShadow: mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)',
          bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
          border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : 'none',
        }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack>
                <Typography variant="overline" color="text.secondary">Page Total (AED)</Typography>
                <Typography variant="h5" fontWeight={700}>AED {pageTotals.totalAED.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Chip icon={<MoneyIcon />} label="AED" color="success" variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* List and search */}
      <Paper sx={{ 
        p: 2,
        bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'background.paper',
        border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(2,6,23,0.06)',
        borderRadius: 3,
      }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search containers, products, suppliers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if ((e as any).key === 'Enter') setSearch(searchInput.trim()); }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                backgroundColor: mode === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(2,6,23,0.03)',
                boxShadow: 'inset 0 0 0 1px rgba(148,163,184,0.15)',
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 1 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchInput && (
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            disabled={loading}
            sx={{ 
              borderRadius: 999, 
              textTransform: 'none', 
              fontWeight: 600,
              borderColor: mode === 'dark' ? 'rgba(148,163,184,0.3)' : 'rgba(0,0,0,0.23)',
              color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : 'inherit',
              '&:hover': {
                borderColor: mode === 'dark' ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.4)',
                bgcolor: mode === 'dark' ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            Clear
          </Button>
        </Box>
        {loading && <LinearProgress sx={{ mb: 1 }} />}
        <TableContainer>
          <Table size="small" sx={{
            '& thead th': { 
              fontWeight: 700, 
              bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.8)' : 'grey.100',
              color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : 'inherit',
              borderBottom: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(0,0,0,0.12)',
            },
            '& tbody tr:hover': { 
              bgcolor: mode === 'dark' ? 'rgba(15,23,42,0.4)' : 'grey.50' 
            },
            '& tbody tr': {
              borderBottom: mode === 'dark' ? '1px solid rgba(148,163,184,0.1)' : '1px solid rgba(0,0,0,0.08)',
            }
          }}>
            <TableHead>
              <TableRow>
                <TableCell>Container</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Rate (PKR)</TableCell>
                <TableCell align="right">Transport</TableCell>
                <TableCell align="right">Freight</TableCell>
                <TableCell align="right">E-Form</TableCell>
                <TableCell align="right">Misc</TableCell>
                <TableCell align="right">PKR Total</TableCell>
                <TableCell align="right">AED Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>
                    <Chip label={r.containerNo} color="primary" variant="outlined" size="small" sx={{ fontFamily: 'monospace' }} />
                  </TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell align="right">{r.quantity}</TableCell>
                  <TableCell align="right">{r.rate?.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.transport?.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.freight?.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.eForm?.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.miscellaneous?.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.totalPKR?.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.totalAED?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/purchases/${r._id}`)}><VisibilityIcon /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/purchases/${r._id}/edit`)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => del(r._id)}><DeleteIcon /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2" color="text.secondary">No purchases found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{
            borderTop: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(0,0,0,0.12)',
            '& .MuiTablePagination-toolbar': {
              color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : 'inherit',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : 'inherit',
            },
            '& .MuiTablePagination-select': {
              color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : 'inherit',
            },
            '& .MuiIconButton-root': {
              color: mode === 'dark' ? 'rgba(241,245,249,0.9)' : 'inherit',
            },
          }}
        />
      </Paper>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchasesPage;


