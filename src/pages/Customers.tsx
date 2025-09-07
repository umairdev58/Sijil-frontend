import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Customer } from '../types';
import apiService from '../services/api';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  const [formData, setFormData] = useState({
    ename: '',
    uname: '',
    email: '',
    number: '',
    trn: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, pagination.pageSize]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomers(pagination.page + 1, pagination.pageSize);
      if (response.success && response.data) {
        // Filter out invalid customers
        const validCustomers = response.data.filter((c: any) => c && typeof c._id === 'string');
        setCustomers(validCustomers);
      } else {
        console.log("--------------->",response);
        setError('Failed to load customers');
      }
    } catch (err) {
      console.log("--------------->",err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchCustomers(searchQuery);
      if (response.success && response.data) {
        // Filter out invalid customers
        const validCustomers = response.data.filter((c: any) => c && typeof c._id === 'string');
        setCustomers(validCustomers);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCustomer) {
        const response = await apiService.updateCustomer(editingCustomer._id, formData);
        if (response.success) {
          setCustomers(prev => 
            prev.map(c => c._id === editingCustomer._id ? response.data! : c)
          );
        }
      } else {
        const response = await apiService.createCustomer(formData);
        if (response.success && response.data) {
          setCustomers(prev => [...prev, response.data!]);
        }
      }
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await apiService.deleteCustomer(id);
        setCustomers(prev => prev.filter(c => c._id !== id));
      } catch (err) {
        setError('Failed to delete customer');
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      ename: customer.ename,
      uname: customer.uname || '',
      email: customer.email || '',
      number: customer.number || '',
      trn: customer.trn || '',
      isActive: customer.isActive,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      ename: '',
      uname: '',
      email: '',
      number: '',
      trn: '',
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    setFormData({
      ename: '',
      uname: '',
      email: '',
      number: '',
      trn: '',
      isActive: true,
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'ename',
      headerName: 'English Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'uname',
      headerName: 'Urdu Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'number',
      headerName: 'Phone',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'trn',
      headerName: 'TRN',
      flex: 1,
      minWidth: 140,
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Customer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={loading}
          pagination
          paginationModel={pagination}
          onPaginationModelChange={(model) => 
            setPagination({ page: model.page, pageSize: model.pageSize })
          }
          pageSizeOptions={[10, 25, 50]}
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add Customer'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="English Name"
              value={formData.ename}
              onChange={(e) => setFormData(prev => ({ ...prev, ename: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Urdu Name"
              value={formData.uname}
              onChange={(e) => setFormData(prev => ({ ...prev, uname: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              fullWidth
            />
            <TextField
              label="TRN"
              value={formData.trn}
              onChange={(e) => setFormData(prev => ({ ...prev, trn: e.target.value }))}
              fullWidth
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
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers; 