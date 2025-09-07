import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Alert, Chip, Switch, FormControlLabel } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import apiService from '../services/api';
import { Supplier } from '../types';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });

  const [formData, setFormData] = useState({
    ename: '',
    uname: '',
    email: '',
    number: '',
    marka: '',
    isActive: true,
  });

  useEffect(() => {
    fetchSuppliers();
  }, [pagination.page, pagination.pageSize]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuppliers(pagination.page + 1, pagination.pageSize);
      if (response.success && response.data) {
        const items = response.data.filter((s: any) => s && typeof s._id === 'string');
        setSuppliers(items);
      } else {
        setError('Failed to load suppliers');
      }
    } catch (e) {
      setError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchSuppliers();
      return;
    }
    try {
      setLoading(true);
      const resp = await apiService.searchSuppliers(searchQuery);
      if (resp.success && (resp as any).suppliers) {
        // BE returns {success, suppliers}
        // normalize to array
        // @ts-ignore
        setSuppliers((resp.suppliers || []).filter((s: any) => s && typeof s._id === 'string'));
      }
    } catch (e) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingSupplier) {
        const response = await apiService.updateSupplier(editingSupplier._id, formData);
        if (response.success && response.data) {
          setSuppliers(prev => prev.map(s => s._id === editingSupplier._id ? response.data! : s));
        }
      } else {
        const response = await apiService.createSupplier(formData);
        if (response.success && response.data) {
          setSuppliers(prev => [...prev, response.data!]);
        }
      }
      handleCloseDialog();
    } catch (e) {
      setError('Failed to save supplier');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await apiService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      setError('Failed to delete supplier');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      ename: supplier.ename,
      uname: supplier.uname || '',
      email: supplier.email || '',
      number: supplier.number || '',
      marka: supplier.marka || '',
      isActive: supplier.isActive,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData({ ename: '', uname: '', email: '', number: '', marka: '', isActive: true });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSupplier(null);
    setFormData({ ename: '', uname: '', email: '', number: '', marka: '', isActive: true });
  };

  const columns: GridColDef[] = [
    { field: 'ename', headerName: 'English Name', flex: 1, minWidth: 150 },
    { field: 'uname', headerName: 'Urdu Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'number', headerName: 'Phone', flex: 1, minWidth: 120 },
    { field: 'marka', headerName: 'Marka', flex: 1, minWidth: 120 },
    {
      field: 'isActive', headerName: 'Status', flex: 1, minWidth: 100,
      renderCell: (params) => (
        <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small" />
      )
    },
    {
      field: 'actions', type: 'actions', headerName: 'Actions', flex: 1, minWidth: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleEdit(params.row)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleDelete(params.row._id)} />,
      ]
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Suppliers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Supplier</Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="outlined" startIcon={<SearchIcon />} onClick={handleSearch}>Search</Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={suppliers}
          columns={columns}
          loading={loading}
          pagination
          paginationModel={pagination}
          onPaginationModelChange={(model) => setPagination({ page: model.page, pageSize: model.pageSize })}
          pageSizeOptions={[10, 25, 50]}
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="English Name" value={formData.ename} onChange={(e) => setFormData(p => ({ ...p, ename: e.target.value }))} fullWidth required />
            <TextField label="Urdu Name" value={formData.uname} onChange={(e) => setFormData(p => ({ ...p, uname: e.target.value }))} fullWidth />
            <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} fullWidth />
            <TextField label="Phone Number" value={formData.number} onChange={(e) => setFormData(p => ({ ...p, number: e.target.value }))} fullWidth />
            <TextField label="Marka" value={formData.marka} onChange={(e) => setFormData(p => ({ ...p, marka: e.target.value }))} fullWidth />
            <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingSupplier ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers;


