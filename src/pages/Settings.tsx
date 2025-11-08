import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Snackbar,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  RestoreFromTrash as RestoreIcon,
  Save as SaveIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sales: boolean;
    purchases: boolean;
    reports: boolean;
  };
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  autoSave: boolean;
  dataRetention: number;
}

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  // const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupForm, setBackupForm] = useState({
    includeData: true,
    includeSettings: true,
    format: 'json'
  });

  const [settings, setSettings] = useState<SettingsState>({
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sales: true,
      purchases: true,
      reports: false
    },
    language: 'en',
    currency: 'AED',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    autoSave: true,
    dataRetention: 365
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleNotificationChange = (key: keyof SettingsState['notifications'], value: boolean) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        notifications: { ...prev.notifications, [key]: value }
      };
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Settings saved successfully');
    } catch (error: any) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage('Backup completed successfully');
      setShowBackupDialog(false);
    } catch (error: any) {
      setError('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage('Data restored successfully');
    } catch (error: any) {
      setError('Failed to restore data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);

        // Simulate data clearing
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSuccessMessage('Data cleared successfully');
      } catch (error: any) {
        setError('Failed to clear data');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your application preferences and system configurations
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', gap: 3 }}>
        {/* Appearance Settings */}
        <Box sx={{ flex: { xs: '1', md: '1 1 calc(50% - 12px)' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    {theme.palette.mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dark Mode" 
                    secondary="Switch between light and dark themes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={theme.palette.mode === 'dark'}
                      onChange={toggleTheme}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Language" 
                    secondary="Select your preferred language"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="ar">العربية</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Auto Save" 
                    secondary="Automatically save changes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Notification Settings */}
        <Box sx={{ flex: { xs: '1', md: '1 1 calc(50% - 12px)' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActiveIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Push Notifications" 
                    secondary="Receive push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.push}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActiveIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sales Alerts" 
                    secondary="Get notified about new sales"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.sales}
                      onChange={(e) => handleNotificationChange('sales', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActiveIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Purchase Alerts" 
                    secondary="Get notified about new purchases"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.purchases}
                      onChange={(e) => handleNotificationChange('purchases', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActiveIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Report Notifications" 
                    secondary="Get notified when reports are ready"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.reports}
                      onChange={(e) => handleNotificationChange('reports', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* System Settings */}
        <Box sx={{ flex: { xs: '1', md: '1 1 calc(50% - 12px)' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">System</Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Currency" 
                    secondary="Default currency for transactions"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                      >
                        <MenuItem value="AED">AED (UAE Dirham)</MenuItem>
                        <MenuItem value="USD">USD (US Dollar)</MenuItem>
                        <MenuItem value="EUR">EUR (Euro)</MenuItem>
                        <MenuItem value="GBP">GBP (British Pound)</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Date Format" 
                    secondary="Preferred date display format"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      >
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Time Format" 
                    secondary="Preferred time display format"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={settings.timeFormat}
                        onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                      >
                        <MenuItem value="12h">12-hour</MenuItem>
                        <MenuItem value="24h">24-hour</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Data Retention" 
                    secondary="Days to keep data before auto-deletion"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      size="small"
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                      sx={{ width: 100 }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Data Management */}
        <Box sx={{ flex: { xs: '1', md: '1 1 calc(50% - 12px)' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BackupIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Data Management</Typography>
              </Box>
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<BackupIcon />}
                  onClick={() => setShowBackupDialog(true)}
                  fullWidth
                >
                  Create Backup
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={handleRestore}
                  fullWidth
                >
                  Restore Data
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RestoreIcon />}
                  onClick={handleClearData}
                  fullWidth
                >
                  Clear All Data
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Save Settings Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onClose={() => setShowBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={backupForm.includeData}
                  onChange={(e) => setBackupForm({ ...backupForm, includeData: e.target.checked })}
                />
              }
              label="Include all data"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={backupForm.includeSettings}
                  onChange={(e) => setBackupForm({ ...backupForm, includeSettings: e.target.checked })}
                />
              }
              label="Include settings"
            />
            
            <FormControl fullWidth>
              <InputLabel>Backup Format</InputLabel>
              <Select
                value={backupForm.format}
                label="Backup Format"
                onChange={(e) => setBackupForm({ ...backupForm, format: e.target.value })}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="zip">ZIP Archive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleBackup}
            variant="contained"
            disabled={loading}
          >
            Create Backup
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

export default Settings;
