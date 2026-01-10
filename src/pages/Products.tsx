import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { Product, Category } from '../types';
import apiService from '../services/api';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
}));

const ToolbarPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderRadius: 8,
}));

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    unit: 'piece',
    isActive: true,
  });

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p?.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [products]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiService.getCategories({ all: true });
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const options: any = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm
      };
      if (categoryFilter) {
        options.category = categoryFilter;
      }
      const response = await apiService.getProducts(options);
      if (response.success && response.data) {
        const validProducts = response.data.filter((p: any) => p && typeof p._id === 'string');
        // Debug: Log first product to see category structure
        if (validProducts.length > 0 && categories.length > 0) {
          console.log('Sample product category structure:', {
            product: validProducts[0].name,
            category: validProducts[0].category,
            categoryType: typeof validProducts[0].category,
            categoriesLoaded: categories.length,
            firstCategory: categories[0]
          });
        }
        setProducts(validProducts);
        const paginationTotal = response.pagination?.totalProducts ?? response.pagination?.total ?? validProducts.length;
        setTotalProducts(paginationTotal);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchTerm, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = async () => {
    const term = searchQuery.trim();
    setSearchTerm(term);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleCategoryFilterChange = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        const response = await apiService.updateProduct(editingProduct._id, formData);
        if (response.success && response.data && response.data._id) {
          // Refetch to ensure category is properly populated
          fetchProducts();
        } else {
          fetchProducts();
        }
      } else {
        const response = await apiService.createProduct(formData);
        if (response.success && response.data) {
          // Reset to first page to see the new product
          setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
          // Refetch products to ensure category is properly populated
          fetchProducts();
        }
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await apiService.deleteProduct(id);
        setProducts(prev => prev.filter(p => p._id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    let categoryId = '';
    if (product.category) {
      if (typeof product.category === 'string') {
        categoryId = product.category;
      } else if (product.category._id) {
        categoryId = product.category._id;
      }
    }
    setFormData({
      name: product.name,
      description: product.description || '',
      category: categoryId,
      sku: product.sku || '',
      unit: product.unit || 'piece',
      isActive: product.isActive,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      sku: '',
      unit: 'piece',
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      sku: '',
      unit: 'piece',
      isActive: true,
    });
  };

  const getCategoryName = (category: string | Category | undefined | null): string => {
    if (!category) {
      return 'Unknown';
    }
    
    // Handle object (populated category from backend) - check this first
    if (typeof category === 'object' && category !== null) {
      const catObj = category as any;
      
      // Backend populates category with name, so use it directly
      if (catObj.name && typeof catObj.name === 'string') {
        return catObj.name;
      }
      
      // If no name but has _id, try to find in categories list
      if (catObj._id) {
        const found = categories.find(c => c._id === catObj._id);
        if (found && found.name) {
          return found.name;
        }
      }
    }
    
    // Handle string (category ID)
    if (typeof category === 'string') {
      // Try to find in categories list
      const cat = categories.find(c => c._id === category);
      if (cat && cat.name) {
        return cat.name;
      }
      return 'Unknown';
    }
    
    return 'Unknown';
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 150,
      valueGetter: (params: any) => {
        const category = params.row?.category;
        const categoryName = getCategoryName(category);
        return categoryName;
      },
      renderCell: (params: any) => {
        const category = params.row?.category;
        const categoryName = getCategoryName(category);
        return <span>{categoryName}</span>;
      },
    },
    {
      field: 'sku',
      headerName: 'SKU',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        if (!params.value) return 'N/A';
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row._id)}
        />,
      ],
    },
  ];

  return (
    <PageContainer>
      <Box display="flex" alignItems="baseline" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Products</Typography>
          <Typography variant="body2" color="text.secondary">Manage your product catalog</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Chip label={`Total: ${stats.total}`} color="primary" variant="outlined" />
          <Chip label={`Active: ${stats.active}`} color="success" variant="outlined" />
          <Chip label={`Inactive: ${stats.inactive}`} variant="outlined" />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ToolbarPaper elevation={0} sx={{ mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          placeholder="Search products by name, SKU or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '999px',
              backgroundColor: 'background.paper',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="outlined"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{ ml: { xs: 0, sm: 1 } }}
          >
            Search
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Product
          </Button>
        </Box>
      </ToolbarPaper>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 8, overflow: 'hidden' }} elevation={0}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(model) =>
            setPaginationModel((prev) => ({
              ...prev,
              ...model
            }))
          }
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={totalProducts}
          getRowId={(row) => {
            if (!row || !row._id) {
              console.warn('Invalid row data detected:', row);
              return `invalid-${Date.now()}-${Math.random()}`;
            }
            return row._id;
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'action.hover',
              fontWeight: 700,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 8 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingProduct ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              fullWidth
              placeholder="e.g., piece, kg, box"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.category}>
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Products;

