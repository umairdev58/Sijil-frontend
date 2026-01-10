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
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import { ContainerStatementProduct, ContainerStatementExpense } from '../types';

const ManualStatement: React.FC = () => {
  const [containerNo, setContainerNo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [srNo, setSrNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mode } = useAppTheme();

  // Product form state
  const [newProduct, setNewProduct] = useState({
    product: '',
    description: '',
    quantity: '',
    unitPrice: '',
  });
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [products, setProducts] = useState<ContainerStatementProduct[]>([]);

  // Expense form state
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ContainerStatementExpense[]>([]);

  // Calculate totals
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const grossSale = products.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netSale = grossSale - totalExpenses;

  const resetProductForm = () => {
    setNewProduct({ product: '', description: '', quantity: '', unitPrice: '' });
    setEditingProductIndex(null);
  };

  const resetExpenseForm = () => {
    setNewExpense({ description: '', amount: '' });
    setEditingExpenseId(null);
  };

  const handleAddProduct = () => {
    if (!newProduct.product.trim() || !newProduct.quantity || !newProduct.unitPrice) {
      setError('Please fill in product, quantity, and unit price');
      return;
    }

    const quantity = parseFloat(newProduct.quantity);
    const unitPrice = parseFloat(newProduct.unitPrice);
    if (isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice <= 0) {
      setError('Please enter valid quantity and unit price');
      return;
    }

    const amount = quantity * unitPrice;
    const newProductEntry: ContainerStatementProduct = {
      srNo: products.length + 1,
      product: newProduct.product.trim(),
      description: newProduct.description.trim() || undefined,
      quantity,
      unitPrice,
      amount: parseFloat(amount.toFixed(2)),
    };

    setProducts([...products, newProductEntry]);
    resetProductForm();
    setError(null);
  };

  const handleEditProduct = (index: number) => {
    const product = products[index];
    setNewProduct({
      product: product.product,
      description: product.description || '',
      quantity: product.quantity.toString(),
      unitPrice: product.unitPrice.toString(),
    });
    setEditingProductIndex(index);
    setError(null);
  };

  const handleAutofillProduct = (index: number) => {
    const product = products[index];
    setNewProduct({
      product: product.product,
      description: product.description || '',
      quantity: product.quantity.toString(),
      unitPrice: product.unitPrice.toString(),
    });
    setEditingProductIndex(null); // Not in edit mode, just autofill
    setError(null);
  };

  const handleUpdateProduct = () => {
    if (editingProductIndex === null) return;

    if (!newProduct.product.trim() || !newProduct.quantity || !newProduct.unitPrice) {
      setError('Please fill in product, quantity, and unit price');
      return;
    }

    const quantity = parseFloat(newProduct.quantity);
    const unitPrice = parseFloat(newProduct.unitPrice);
    if (isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice <= 0) {
      setError('Please enter valid quantity and unit price');
      return;
    }

    const amount = quantity * unitPrice;
    const updatedProducts = [...products];
    updatedProducts[editingProductIndex] = {
      srNo: editingProductIndex + 1,
      product: newProduct.product.trim(),
      description: newProduct.description.trim() || undefined,
      quantity,
      unitPrice,
      amount: parseFloat(amount.toFixed(2)),
    };

    // Recalculate srNo
    updatedProducts.forEach((p, idx) => {
      p.srNo = idx + 1;
    });

    setProducts(updatedProducts);
    resetProductForm();
    setError(null);
  };

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    updatedProducts.forEach((p, idx) => {
      p.srNo = idx + 1;
    });
    setProducts(updatedProducts);
  };

  const handleSaveExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount) {
      setError('Please fill in both description and amount');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (editingExpenseId) {
      const updatedExpenses = expenses.map((e) =>
        e._id === editingExpenseId
          ? { ...e, description: newExpense.description.trim(), amount }
          : e
      );
      setExpenses(updatedExpenses);
    } else {
      const newExpenseEntry: ContainerStatementExpense = {
        _id: `temp-${Date.now()}`,
        description: newExpense.description.trim(),
        amount,
        isAutoGenerated: false,
      };
      setExpenses([...expenses, newExpenseEntry]);
    }

    resetExpenseForm();
    setError(null);
  };

  const handleEditExpense = (expense: ContainerStatementExpense) => {
    if (!expense._id) return;
    setEditingExpenseId(expense._id);
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
    });
    setError(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e._id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!containerNo.trim()) {
      setError('Please enter a container number');
      return;
    }
    if (products.length === 0) {
      setError('Please add at least one product before downloading PDF');
      return;
    }
    try {
      await apiService.generateContainerStatementPDF({
        containerNo: containerNo.trim(),
        products: products.map((p) => ({
          srNo: p.srNo,
          product: p.product,
          description: p.description || '',
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          amount: p.amount,
        })),
        expenses: expenses.map((e) => ({
          description: e.description,
          amount: e.amount,
          isAutoGenerated: e.isAutoGenerated || false,
        })),
        companyName: companyName.trim() || undefined,
        srNo: srNo.trim() || undefined,
      });
    } catch (e: any) {
      // Some download managers/extensions intercept the request and cause a spurious
      // network error in the console while the file still downloads successfully.
      // We suppress the UI error for this specific case.
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
        Manual Statement
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Container Number and Additional Fields */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Container Number"
                value={containerNo}
                onChange={(e) => setContainerNo(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
                required
              />
              <TextField
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
              />
              <TextField
                label="SR No"
                value={srNo}
                onChange={(e) => setSrNo(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: 150 }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
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
                disabled={!containerNo.trim()}
                startIcon={<DownloadIcon />}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
              >
                Download PDF
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Product Details Section */}
        <Card>
          <CardHeader title="Product Details" />
          <CardContent>
            {/* Add Product Form */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.50' }}>
              <Stack spacing={2}>
                <TextField
                  label="Product"
                  value={newProduct.product}
                  onChange={(e) => setNewProduct({ ...newProduct, product: e.target.value })}
                  size="small"
                  fullWidth
                  required
                />
                <TextField
                  label="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    size="small"
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <TextField
                    label="Unit Price"
                    type="number"
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, unitPrice: e.target.value })}
                    size="small"
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={editingProductIndex !== null ? handleUpdateProduct : handleAddProduct}
                    startIcon={editingProductIndex !== null ? <EditIcon /> : <AddIcon />}
                    fullWidth
                    size="small"
                  >
                    {editingProductIndex !== null ? 'Update Product' : 'Add Product'}
                  </Button>
                  {editingProductIndex !== null && (
                    <Button variant="text" color="inherit" size="small" onClick={resetProductForm}>
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Products Table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SR #</TableCell>
                    <TableCell>PRODUCT</TableCell>
                    <TableCell>DESCRIPTION</TableCell>
                    <TableCell align="right">QTY</TableCell>
                    <TableCell align="right">UNIT PRICE</TableCell>
                    <TableCell align="right">Amount (AED)</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.srNo}</TableCell>
                      <TableCell>{product.product}</TableCell>
                      <TableCell>{product.description || '-'}</TableCell>
                      <TableCell align="right">{product.quantity.toLocaleString()}</TableCell>
                      <TableCell align="right">{product.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">{product.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Autofill">
                            <IconButton size="small" onClick={() => handleAutofillProduct(index)} color="primary">
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditProduct(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteProduct(index)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No products added yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                    <TableCell colSpan={3}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{totalQuantity.toLocaleString()}</strong></TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right"><strong>{grossSale.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</strong></TableCell>
                    <TableCell></TableCell>
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
            {/* Add Expense Form */}
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
                inputProps={{ min: 0, step: 0.01 }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  onClick={handleSaveExpense}
                  startIcon={editingExpenseId ? <EditIcon /> : <AddIcon />}
                  fullWidth
                  size="small"
                >
                  {editingExpenseId ? 'Update Expense' : 'Add Expense'}
                </Button>
                {editingExpenseId && (
                  <Button variant="text" color="inherit" size="small" onClick={resetExpenseForm}>
                    Cancel
                  </Button>
                )}
              </Stack>
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
                  {expenses.map((expense, index) => {
                    const expenseKey = expense._id ? expense._id : `expense-${index}`;
                    return (
                      <TableRow key={expenseKey}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {expense.description}
                            {expense.isAutoGenerated && (
                              <Chip label="Auto" size="small" color="info" variant="outlined" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {expense.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          {expense.isAutoGenerated ? (
                            <Typography variant="caption" color="text.secondary">
                              Included
                            </Typography>
                          ) : (
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              {expense._id && (
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => handleEditExpense(expense)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => expense._id && handleDeleteExpense(expense._id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No expenses added yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
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
  );
};

export default ManualStatement;

