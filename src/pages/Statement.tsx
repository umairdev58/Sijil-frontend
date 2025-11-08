import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ContainerStatement, ContainerStatementProduct, ContainerStatementExpense } from '../types';

const Statement: React.FC = () => {
  const [containerNo, setContainerNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statementData, setStatementData] = useState<ContainerStatement | null>(null);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const { mode } = useAppTheme();

  // Sample data structure based on the image
  const [products, setProducts] = useState<ContainerStatementProduct[]>([
    { srNo: 1, product: 'POTATO PAKISTAN', quantity: 1136, unitPrice: 4.50, amountWithoutVAT: 5112.00 },
    { srNo: 2, product: 'POTATO PAKISTAN', quantity: 560, unitPrice: 5.00, amountWithoutVAT: 2800.00 },
    { srNo: 3, product: 'POTATO PAKISTAN', quantity: 2925, unitPrice: 4.75, amountWithoutVAT: 13893.75 },
  ]);

  const [expenses, setExpenses] = useState<ContainerStatementExpense[]>([
    { _id: '1', description: 'Commission 5%', amount: 1277.10 },
    { _id: '2', description: 'UN LOADING', amount: 400.00 },
    { _id: '3', description: 'CLEARANCE CHARGES', amount: 4487.50 },
    { _id: '4', description: 'VAT 5%', amount: 671.39 },
    { _id: '5', description: 'PARKING', amount: 280.00 },
  ]);

  // Group products by product + unitPrice (rate) and aggregate quantity and amount
  const groupedProducts: ContainerStatementProduct[] = useMemo(() => {
    const aggregateMap = new Map<string, { product: string; unitPrice: number; quantity: number; amountWithoutVAT: number }>();
    products.forEach((p) => {
      const key = `${p.product}__${p.unitPrice}`;
      const existing = aggregateMap.get(key);
      if (existing) {
        existing.quantity += p.quantity;
        existing.amountWithoutVAT += p.amountWithoutVAT;
      } else {
        aggregateMap.set(key, {
          product: p.product,
          unitPrice: p.unitPrice,
          quantity: p.quantity,
          amountWithoutVAT: p.amountWithoutVAT,
        });
      }
    });

    // Build array with sequential srNo
    const rows: ContainerStatementProduct[] = Array.from(aggregateMap.values())
      .sort((a, b) => a.unitPrice - b.unitPrice)
      .map((item, index) => ({
        srNo: index + 1,
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amountWithoutVAT: item.amountWithoutVAT,
      }));
    return rows;
  }, [products]);

  // Calculate totals from grouped rows (same totals as original list)
  const totalQuantity = groupedProducts.reduce((sum, product) => sum + product.quantity, 0);
  const grossSale = groupedProducts.reduce((sum, product) => sum + product.amountWithoutVAT, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netSale = grossSale - totalExpenses;

  const handleSearch = async () => {
    if (!containerNo.trim()) {
      setError('Please enter a container number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getContainerStatement(containerNo);
      
      if (response.success && response.data) {
        setStatementData(response.data);
        setProducts(response.data.products || []);
        setExpenses(response.data.expenses || []);
      } else {
        setError(response.message || 'Failed to fetch container statement');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch container statement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) {
      setError('Please fill in both description and amount');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!statementData?._id) {
      setError('No statement loaded');
      return;
    }

    try {
      const response = await apiService.addContainerStatementExpense(statementData._id, {
        description: newExpense.description.trim(),
        amount: amount,
      });

      if (response.success && response.data) {
        setExpenses(response.data.expenses || []);
        setNewExpense({ description: '', amount: '' });
        setError(null);
      } else {
        setError(response.message || 'Failed to add expense');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!statementData?._id) {
      setError('No statement loaded');
      return;
    }

    try {
      const response = await apiService.removeContainerStatementExpense(statementData._id, id);

      if (response.success && response.data) {
        setExpenses(response.data.expenses || []);
        setError(null);
      } else {
        setError(response.message || 'Failed to remove expense');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove expense');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!statementData?.containerNo) return;
    try {
      await apiService.downloadContainerStatementPDF(statementData.containerNo);
    } catch (e: any) {
      // Some download managers/extensions intercept the request and cause a spurious
      // network error in the console while the file still downloads successfully.
      // We suppress the UI error for this specific case.
      // const code = e?.code || e?.response?.status;
      const msg = String(e?.message || '');
      const intercepted = msg.includes('ERR_FAILED') || msg.includes('Network Error');
      if (!intercepted) {
        console.error(e);
        setError('Failed to download statement PDF');
      } else {
        console.warn('Download intercepted by a browser extension; suppressing UI error.');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Container Statement
      </Typography>

      {/* Search Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Container Number"
              value={containerNo}
              onChange={(e) => setContainerNo(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
            {statementData && (
              <>
                <Button
                  variant="outlined"
                  onClick={handlePrint}
                  startIcon={<PrintIcon />}
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
                >
                  Print
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon />}
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
                >
                  Download PDF
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {statementData && (
        <Box>
          {/* Container Info */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={`Container Statement - ${statementData.containerNo}`}
              subheader={`Generated on ${new Date().toLocaleDateString()}`}
            />
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            {/* Product Details Section */}
            <Card>
              <CardHeader title="Product Details" />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>SR #</TableCell>
                        <TableCell>PRODUCT</TableCell>
                        <TableCell align="right">QTY</TableCell>
                        <TableCell align="right">UNIT PRICE</TableCell>
                        <TableCell align="right">Amount Without VAT (AED)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedProducts.map((product) => (
                        <TableRow key={product.srNo}>
                          <TableCell>{product.srNo}</TableCell>
                          <TableCell>{product.product}</TableCell>
                          <TableCell align="right">{product.quantity.toLocaleString()}</TableCell>
                          <TableCell align="right">{product.unitPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">{product.amountWithoutVAT.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                        <TableCell colSpan={2}><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{totalQuantity.toLocaleString()}</strong></TableCell>
                        <TableCell></TableCell>
                        <TableCell align="right"><strong>{grossSale.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Expenses Section */}
            <Card>
              <CardHeader title="Expenses" />
              <CardContent>
                {/* Add New Expense */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Amount (AED)"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddExpense}
                    startIcon={<AddIcon />}
                    fullWidth
                    size="small"
                  >
                    Add Expense
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Expenses List */}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell align="right">{expense.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteExpense(expense._id!)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                        <TableCell><strong>Sub Total</strong></TableCell>
                        <TableCell align="right"><strong>AED {totalExpenses.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</strong></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>

          {/* Final Balance Section */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Final Balance" />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    Gross Sale
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    AED {grossSale.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" color="error">
                    Expenses
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    AED {totalExpenses.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: mode === 'dark' ? 'primary.dark' : 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.contrastText">
                    Net Sale
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
                    AED {netSale.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {loading && <LoadingSpinner size="fullscreen" variant="spinner" message="Loading container statement..." />}
    </Box>
  );
};

export default Statement;
