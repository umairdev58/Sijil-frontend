import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { User } from '../types';
import apiService from '../services/api';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'employee' | 'admin',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers(pagination.page + 1, pagination.pageSize);
      if (response.success && response.users) {
        setUsers(response.users);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async () => {
    try {
      setCreateLoading(true);
      const res = await apiService.createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      if (res.success) {
        setCreateOpen(false);
        setForm({ name: '', email: '', password: '', role: 'employee' });
        fetchUsers();
      } else {
        setError(res.message || 'Failed to create user');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
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
      field: 'role',
      headerName: 'Role',
      flex: 1,
      minWidth: 100,
      valueFormatter: (params: any) => {
        if (!params.value) return 'N/A';
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      },
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'position',
      headerName: 'Position',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 1,
      minWidth: 100,
      valueFormatter: (params: any) => {
        if (params.value === undefined || params.value === null) return 'N/A';
        return params.value ? 'Active' : 'Inactive';
      },
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
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Users</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          New User
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
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
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} fullWidth>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={createLoading}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 