import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
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

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.pageSize]);

  const fetchUsers = async () => {
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
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>

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
    </Box>
  );
};

export default Users; 