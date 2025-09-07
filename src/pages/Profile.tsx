import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import { User } from '../types';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        trn: (user as any).trn || ''
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      position: user?.position || '',
      trn: (user as any)?.trn || ''
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.updateProfile(editForm);
      
      if (response.success) {
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
        // Refresh user data
        window.location.reload();
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        setSuccessMessage('Password changed successfully');
        setShowPasswordDialog(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Profile Card */}
        <Box sx={{ flex: { xs: '1', md: '1 1 33%' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '3rem'
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              
              <Chip
                label={user.role.toUpperCase()}
                color={user.role === 'admin' ? 'primary' : 'secondary'}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.position}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {user.department}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1} alignItems="flex-start" sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Member since {formatDate(user.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Status: {user.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Profile Details */}
        <Box sx={{ flex: { xs: '1', md: '1 1 67%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Profile Information
                </Typography>
                <Box>
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                      >
                        Save
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: { xs: '1', sm: '1 1 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={isEditing ? editForm.name : user.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Box>
                
                <Box sx={{ flex: { xs: '1', sm: '1 1 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={isEditing ? editForm.email : user.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Box>
                
                <Box sx={{ flex: { xs: '1', sm: '1 1 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={isEditing ? editForm.department : user.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Box>
                
                <Box sx={{ flex: { xs: '1', sm: '1 1 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={isEditing ? editForm.position : user.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Box>

                <Box sx={{ flex: { xs: '1', sm: '1 1 calc(50% - 12px)' } }}>
                  <TextField
                    fullWidth
                    label="Company TRN"
                    value={isEditing ? (editForm as any).trn : (user as any).trn || ''}
                    onChange={(e) => setEditForm({ ...editForm, trn: e.target.value })}
                    disabled={!isEditing}
                    helperText="Used on VAT invoices as our company TRN"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Security
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
