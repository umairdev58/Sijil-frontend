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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { Category } from '../types';
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

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalCategories, setTotalCategories] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c?.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm
      });
      if (response.success && response.data) {
        const validCategories = response.data.filter((c: any) => c && typeof c._id === 'string');
        setCategories(validCategories);
        const paginationTotal = response.pagination?.totalCategories ?? response.pagination?.total ?? validCategories.length;
        setTotalCategories(paginationTotal);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = async () => {
    const term = searchQuery.trim();
    setSearchTerm(term);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        const response = await apiService.updateCategory(editingCategory._id, formData);
        if (response.success && response.data && response.data._id) {
          setCategories(prev => 
            prev.map(c => c._id === editingCategory._id ? response.data! : c)
              .filter(c => c && c._id)
          );
        } else {
          fetchCategories();
        }
      } else {
        const response = await apiService.createCategory(formData);
        if (response.success && response.data) {
          setCategories(prev => [...prev, response.data!].filter(c => c && c._id));
        }
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? Products associated with this category will need to be reassigned first.')) {
      try {
        await apiService.deleteCategory(id);
        setCategories(prev => prev.filter(c => c._id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Category Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 250,
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
          <Typography variant="h4" fontWeight={800}>Categories</Typography>
          <Typography variant="body2" color="text.secondary">Manage product categories</Typography>
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
          placeholder="Search categories by name or description..."
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
            Add Category
          </Button>
        </Box>
      </ToolbarPaper>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 8, overflow: 'hidden' }} elevation={0}>
        <DataGrid
          rows={categories}
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
          rowCount={totalCategories}
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
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
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
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Categories;

