import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
  Stack,
} from '@mui/material';
import { LockOutlined, Email, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import logo from '../assets/Sijil.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('remember-email') ? true : false;
  });
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const { mode } = useAppTheme();

  useEffect(() => {
    console.log('Login component - isAuthenticated changed:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      console.log('Login error:', error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with:', formData);
    
    if (validateForm()) {
      console.log('Form validation passed, attempting login...');
      try {
        await login(formData);
        console.log('Login function completed');
        if (rememberMe) {
          localStorage.setItem('remember-email', formData.email);
        } else {
          localStorage.removeItem('remember-email');
        }
      } catch (err) {
        console.error('Login error:', err);
      }
    } else {
      console.log('Form validation failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Prefill remembered email
  useEffect(() => {
    const remembered = localStorage.getItem('remember-email');
    if (remembered) {
      setFormData(prev => ({ ...prev, email: remembered }));
    }
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      position: 'relative',
      bgcolor: mode === 'dark' ? '#0f172a' : '#f8fafc',
    }}>
      {/* Left hero panel */
      }
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
        background: mode === 'dark'
          ? 'radial-gradient(1200px 600px at -20% -20%, rgba(30,58,138,0.35) 0%, transparent 60%), linear-gradient(135deg, #0b1220 0%, #0f172a 100%)'
          : 'radial-gradient(1200px 600px at -20% -20%, rgba(30,58,138,0.15) 0%, transparent 60%), linear-gradient(135deg, #eaf0ff 0%, #eef2ff 100%)',
      }}>
        {/* Decorative gold circles */}
        <Box sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(234,179,8,0.55), rgba(234,179,8,0.05))',
          filter: 'blur(4px)'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(234,179,8,0.35), rgba(234,179,8,0.05))',
          filter: 'blur(6px)'
        }} />

        <Box sx={{ maxWidth: 460 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box component="img" src={logo} alt="Sijil" sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              boxShadow: '0 10px 25px rgba(2,6,23,0.2)'
            }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: mode === 'dark' ? '#f1f5f9' : '#0b1220' }}>
              Sijil Accounting
            </Typography>
          </Box>
          <Typography variant="h3" sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            color: mode === 'dark' ? '#f1f5f9' : '#0b1220',
            mb: 2,
          }}>
            Welcome back
          </Typography>
          <Typography variant="h6" sx={{
            color: mode === 'dark' ? '#cbd5e1' : '#334155',
            fontWeight: 500,
          }}>
            Sign in to access your sales, purchases and smart insights.
          </Typography>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
      }}>
        <Paper elevation={0} sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)',
          border: mode === 'dark' ? '1px solid rgba(148,163,184,0.15)' : '1px solid rgba(15,23,42,0.06)',
          backdropFilter: 'blur(8px)',
          boxShadow: mode === 'dark'
            ? '0 10px 30px rgba(0,0,0,0.35)'
            : '0 10px 30px rgba(2,6,23,0.08)',
        }}>
          <Stack spacing={2} alignItems="center">
            <Box sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              borderRadius: '50%',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(139, 92, 246, 0.35)'
            }}>
              <LockOutlined sx={{ color: 'white' }} />
            </Box>
            <Box textAlign="center">
              <Typography component="h1" variant="h5" sx={{ fontWeight: 800 }}>
                Sign in to Sijil
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your credentials to continue
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(s => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link component="button" type="button" underline="hover" sx={{ fontSize: 14 }} onClick={() => {}}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              startIcon={!loading ? <LoginIcon /> : undefined}
              sx={{
                mt: 3,
                mb: 1,
                py: 1.25,
                borderRadius: 2,
                fontWeight: 700,
                boxShadow: '0 10px 25px rgba(99,102,241,0.35)',
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : 'Sign In'}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
              By signing in, you agree to our Terms and Privacy Policy.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login; 