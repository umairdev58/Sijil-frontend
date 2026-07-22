import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/api';

const Impersonate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Missing impersonation token.');
      return;
    }

    const run = async () => {
      try {
        localStorage.setItem('token', token);
        const response = await apiService.getCurrentUser();
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Unable to verify impersonation session.');
        }
        localStorage.setItem('user', JSON.stringify(response.data));
        const role = (response.data as any).role;
        navigate(role === 'employee' ? '/sales/new' : '/dashboard', { replace: true });
        window.location.reload();
      } catch (err: any) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError(err?.response?.data?.message || err?.message || 'Impersonation failed.');
      }
    };

    run();
  }, [navigate, searchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#0f172a',
        color: '#fff',
        px: 3,
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ maxWidth: 480 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#fff', mb: 2 }} />
          <Typography variant="h6">Starting support session…</Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            You are signing into the tenant application as the selected user.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Impersonate;
